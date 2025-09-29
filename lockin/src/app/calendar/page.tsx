'use client'

// Update the import path to the correct location of Calendar
import Calendar from "@/components/Calendar";

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <Calendar />
    </div>
  );
}
