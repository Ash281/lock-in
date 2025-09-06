import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { strict } from "assert";
import { FlexibilityType } from "@/generated/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// define our function calls
async function getCurrentEvents() {
  const currentEvents = await prisma.event.findMany({
    orderBy: { startTime: 'asc' }
  });
  return currentEvents;
}

async function createEvents(eventsData: any[]) {
  const createdEvents = await Promise.all(
    eventsData.map(event => prisma.event.create({
      data: {
        title: event.title,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        flexibility: event.flexibility as FlexibilityType || FlexibilityType.FLEXIBLE,
        priority: event.priority || 3,
        userId: 'tmpUserId' // replace with actual user ID in real implementation
      }
    }))
  );
  console.log("Events created:", createdEvents);
  return createdEvents;
}

// Function to create a summary of older messages
async function createSummary(messages: any[]) {
  if (messages.length === 0) return null;
  
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Cheaper model for summarization
      messages: [
        {
          role: "system",
          content: "Summarize this conversation history in 2-3 sentences, focusing on key scheduling requests, decisions made, and important context for future interactions."
        },
        {
          role: "user", 
          content: `Summarize this conversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
        }
      ],
      max_tokens: 150
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error creating summary:', error);
    return "Previous conversation about calendar scheduling.";
  }
}

// Function to manage conversation history
async function manageConversationHistory(conversationHistory: any[], newMessage: string) {
  const maxRecentMessages = 6;
  
  if (conversationHistory.length <= maxRecentMessages) {
    // If we have 3 or fewer messages, just add the new one
    return [...conversationHistory, { role: "user", content: newMessage }];
  }
  
  // We have more than 3 messages, need to summarize older ones
  const recentMessages = conversationHistory.slice(-maxRecentMessages);
  const olderMessages = conversationHistory.slice(0, -maxRecentMessages);
  
  // Create summary of older messages
  const summary = await createSummary(olderMessages);
  
  // Build new context with summary + recent messages + new message
  const context = [];
  
  if (summary) {
    context.push({
      role: "system",
      content: `Previous conversation summary: ${summary}`
    });
  }
  
  context.push(...recentMessages);
  context.push({ role: "user", content: newMessage });
  
  return context;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();
    console.log("Message received:", message);
    console.log("Conversation history length:", conversationHistory.length);

    // Manage conversation history with summarization
    let context = await manageConversationHistory(conversationHistory, message);
    console.log("Context prepared:", context);

    // define available functions in tools array
    const tools = [
      {
        type: "function" as const,
        name: "createEvents",
        description: "Create one or more calendar events",
        parameters: {
          type: "object",
          properties: {
            events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  startTime: { type: "string" },
                  endTime: { type: "string" },
                  flexibility: { type: ["string", "null"], enum: ["FLEXIBLE", "DAY_LOCKED", "LOCKED"] },
                  priority: { type: ["integer", "null"], minimum: 1, maximum: 5 }
                },
                required: ["title", "startTime", "endTime", "flexibility", "priority"],
                additionalProperties: false
              }
            }
          },
          required: ["events"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function" as const,
        name: "getCurrentEvents",
        description: "Get all current events to check for conflicts",
        parameters: {
          type: "object",
          properties: {},
          required: [],
          additionalProperties: false
        },
        strict: true
      }
    ];

    // now create input messages array
    // use let here since the input array may be modified during function calling
    let response = await client.responses.create({
      model: "gpt-5-nano",
      tools: tools,
      input: context,
      instructions: "You are a calendar scheduling assistant. Use createEvents function to schedule events based on user requests. Always use getCurrentEvents to check existing events for conflicts. Ask ONE clarifying question if needed, then create events on next response. If user doesn't specify which days, choose suitable ones. Infer meaningful titles from context. Assume user's local timezone. Only ask if date/time is genuinely unclear. Max 25 words response."
    });
    console.log("Initial response:", response);

    // handle function calls
    let hasMoreFunctionCalls = true;
    while (hasMoreFunctionCalls) {
      const functionOutputs = [];
      hasMoreFunctionCalls = false;

      for (const item of response.output) {
        if (item.type === "function_call") {
          hasMoreFunctionCalls = true;
          console.log("Processing function call:", item.name);
          let result;

          if (item.name === "getCurrentEvents") {
            result = await getCurrentEvents();
            console.log("getCurrentEvents result:", result);
          } else if (item.name === "createEvents") {
            const { events } = JSON.parse(item.arguments);
            result = await createEvents(events);
            console.log("createEvents result:", result);
          }

          functionOutputs.push({
            type: "function_call_output",
            call_id: item.call_id,
            output: JSON.stringify(result)
          });
        }
      }

      // If function calls were made, continue the conversation
      if (functionOutputs.length > 0) {
        console.log("Sending function results back to AI...");
        
        const newContext = [
          ...context,
          ...response.output,
          ...functionOutputs
        ];
        
        response = await client.responses.create({
          model: "gpt-5-nano",
          input: newContext,
          tools: tools,
          instructions: "You are a calendar scheduling assistant. Use createEvents function to schedule events based on user requests. Always use getCurrentEvents to check existing events for conflicts. Ask ONE clarifying question if needed, then create events on next response. If user doesn't specify which days, choose suitable ones Infer meaningful titles from context. Assume user's local timezone. Only ask if date/time is genuinely unclear. Max 25 words response."
        });
        
        console.log("AI's next response:", response);
      }
    }

    // Prepare updated conversation history to send back
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: message },
      { role: "assistant", content: response.output_text || "Events processed successfully" }
    ];

    return NextResponse.json({
      success: true,
      message: response.output_text || "Events processed successfully",
      conversationHistory: updatedHistory // Send back updated history
    })

  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}