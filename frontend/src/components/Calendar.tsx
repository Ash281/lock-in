"use client"

// here i made a basic calendar component using FullCalendar. this is where the main timetable functionality will be implemented later.
// includes code to handle date clicks, displaying events, basic setup (editable, selectable, etc.)

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Calendar() {
    const handleDateClick = (arg: any) => {
        alert(`Date clicked: ${arg.dateStr}`)
    }

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            dateClick={handleDateClick}
            events={[
                { title: 'Event 1', date: '2023-10-01' },
                { title: 'Event 2', date: '2023-10-02' },
                { title: 'Event 3', date: '2023-10-03' }]
            }
        />
    )
}