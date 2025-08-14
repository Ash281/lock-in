import Image from "next/image";
import Calendar from "@/components/Calendar";

export default function Home() {
  return (
   <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI Timetable Maker</h1>
      <Calendar />
    </main>
  );
}
