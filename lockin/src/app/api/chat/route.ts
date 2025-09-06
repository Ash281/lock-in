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

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json(); // this is the message the user sends to the chatbot
    console.log("Message received:", message);

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

    let context = [{role: "user", content: message}]; // in real implementation, load previous messages from DB or session
    console.log("Context prepared:", context);

    // now create input messages array
    // use let here since the input array may be modified during function calling
    let response = await client.responses.create({
      model: "gpt-5-nano",
      tools: tools,
      input: context,
      instructions: "You are a calendar scheduling assistant. Use createEvents function to schedule events based on user requests. Always use getCurrentEvents to check existing events for conflicts."
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
      instructions: "You are a calendar scheduling assistant. Use createEvents function to schedule events based on user requests. Always use getCurrentEvents to check existing events for conflicts."
    });
    
    console.log("AI's next response:", response);
  }
}

    return NextResponse.json({
      success: true,
      message: response.output_text || "Events processed successfully"
    })

  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}