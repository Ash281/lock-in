import { FlexibilityType } from "@/generated/prisma";

export interface CreateEventInput {
  title: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  flexibility?: FlexibilityType | null;
  priority?: number | null;
}

export interface ConversationMessage {
  role: string;
  content: string;
}