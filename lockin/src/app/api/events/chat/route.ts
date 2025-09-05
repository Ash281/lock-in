import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const response = client.responses.create({
//   model: "gpt-5-nano",
//   input: "tell me a joke",
//   store: true
// });

export async function POST(request: NextRequest) {
try {
  const { message } = await request.json(); // this is the message the user sends to the chatbot
  console.log("Message received:", message);

  // later we can think about storing conversations - leave for now
  const currentEvents = await prisma.event.findMany({
    orderBy: { startTime: "desc" },
  });
  console.log("Current events fetched:", currentEvents.length);

  const completion = await client.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      // first we define the 'system' role - this is the context for the chatbot
      { role: "system", 
        content: "You are a calendar scheduling assistant. Use 
      },
      // then we add the user's message with the user role
      { role: "user", content: message }
    ],
  });