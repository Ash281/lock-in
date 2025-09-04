import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// get function for all events ordered by start time
export async function GET(req: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startTime: "asc" // find all events ordered by start time
      }
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// post function for creating new events and adding them to db
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received body:', body);
    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        startTime: new Date(body.startTime), // start time and end time are both DateTime objects
        endTime: new Date(body.endTime),
        flexibility: body.flexibility,
        priority: body.priority,
        userId: 'tmpUserId'
      }
    });
    console.log('Created event:', newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}