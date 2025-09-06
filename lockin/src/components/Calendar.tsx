import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Event } from '../types/Event'; // import the Event type
import AddEventWindow from './AddEventForm';
import { CSSProperties } from 'react';
import ChatWindow from './ChatWindow';

// Date utility functions
// change date to uk format using a switch case in multiple different formats
// use javascript intl api formatting options e.g 'short' to specify format
const formatDate = (date: Date, format: string) => {
  switch (format) {
    case 'MMM dd': return date.toLocaleDateString('en-GB', { month: 'short', day: '2-digit' }); // Sep 02
    case 'MMM dd, yyyy': return date.toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' }); // Sep 02, 2025
    case 'EEE': return date.toLocaleDateString('en-GB', { weekday: 'short' }); // Tue
    case 'd': return date.getDate().toString(); // 2 (no leading zero for the day of the month)
    case 'h:mm a': return date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: false }); // 10:00
    default: return date.toLocaleDateString('en-GB');
  }
};

// get the starting date of the week (Monday)
const getStartOfWeek = (date: Date) => {
  const d = new Date(date); // make new const d for date
  const day = d.getDay(); // get day of the week (0 to 6, sun to sat)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // if sunday, roll back -6 (previous monday) else set to monday
  return new Date(d.setDate(diff)); // return start of week (monday)
};

// Add days to a date
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Add weeks to a date
const addWeeks = (date: Date, weeks: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + (weeks * 7));
  return result;
};

// Check if two dates are the same day by checking the months, year and date (Get date returns 0 to 31)
const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

// main calendar component
export default function Calendar() {
  // remember all hooks (State, effect) must be inside component
  const [currentWeek, setCurrentWeek] = useState(new Date()); // function to set the current week (default to today)
  // when setCurrentWeek is called, it will update the current week state and rerender the calendar
  const [showAddEvent, setShowAddEvent] = useState(false); // function to show the add event form (set by default to false)
  // when setShowAddEvent is called, it will update the show add event state and show/hide the form (decides whether the form is being shown or not)
  const [showChat, setShowChat] = useState(false); // function to show the chat window (set by default to false)
  // get date for start of current week (Monday)
  const weekStart = getStartOfWeek(currentWeek);

  // generate 7 days of the week from the weekstart
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  // creating an array of length 7 for each day of the week, adding days from 1 to 7 to weekStart

  // generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const goToPreviousWeek = () => setCurrentWeek(addWeeks(currentWeek, -1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  // get the events from the db
  const [events, setEvents] = useState<Event[]>([]); // state to hold events
  const [loading, setLoading] = useState(true); // state to hold loading status

  // use effect hooks are used to fetch events from the API
  // call fetchEvents after first render ONLY (hence empty dependency array)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/events');
        const eventsData = await response.json();
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false); // stop loading after trying to fetch events
      }
    };

    fetchEvents();
  }, []);

  const handleAddEvent = async (eventData: {
    title: string;
    startTime: string;
    endTime: string;
    flexibility?: string;
    priority?: number;
  }) => {

    const newStart = new Date(eventData.startTime);
    const newEnd = new Date(eventData.endTime);

    const overlappingEvent = events.some(existingEvent => {
      const existingStart = new Date(existingEvent.startTime);
      const existingEnd = new Date(existingEvent.endTime);
      return (newStart < existingEnd && newEnd > existingStart);
    });

    if (overlappingEvent) {
      console.error('Event overlaps with an existing event');
      alert('Event overlaps with an existing event');
      return;
    }

    try {
      const response = await fetch('api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prevEvents => [...prevEvents, newEvent]);
      }
      else {
        console.error('failed to create event');
        console.log(eventData);
      }
    }
    catch (error) {
      console.error('error creating event', error);
    }
  }

  const refreshEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to refresh events:', error);
    }
  };

  // get events for a specific day and hour
  const getEventsForSlot = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const eventStartHour = eventStart.getHours();
      const eventEndHour = eventEnd.getHours();
      return isSameDay(eventStart, day) && hour >= eventStartHour && hour < eventEndHour;
    });
  };

  const calculateEventSlotStyling = (event: Event, dayIndex: number) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    const startHour = startTime.getHours() + (startTime.getMinutes() / 60);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    return {
      position: 'absolute' as const,
      top: `calc(${startHour} * clamp(40px, 6vh, 100px))`,     // Match your clamp!
      height: `calc(${duration} * clamp(40px, 6vh, 100px))`,   // Match your clamp!
      left: `${(dayIndex + 1) * (100 / 8) + 0.5}%`,
      width: '11.5%',
      zIndex: 10,
    };
  };

  // get flexibility color (locked = red, day locked = yellow, flexible = green)
  const getFlexibilityColor = (flexibility: string) => {
    switch (flexibility) {
      case 'LOCKED': return 'bg-red-100 border-red-300 text-red-800';
      case 'DAY_LOCKED': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'FLEXIBLE': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {formatDate(weekStart, 'MMM dd')} - {formatDate(addDays(weekStart, 6), 'MMM dd, yyyy')}
          </h1>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Event
          </button>
        {/* AI Chat button */}
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MessageCircle size={16} />
            AI Assistant
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b overflow-hidden [scrollbar-gutter:stable]">
          <div className="p-4 bg-gray-50 font-medium text-gray-600 text-sm">
            Time
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-4 text-center font-medium border-l ${isSameDay(day, new Date())
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-gray-50 text-gray-600'
                }`}
            >
              <div className="text-xs">{formatDate(day, 'EEE')}</div>
              <div className={`text-lg ${isSameDay(day, new Date()) ? 'font-bold' : ''}`}>
                {formatDate(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="max-h-96 overflow-y-auto relative">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-400 min-h-[clamp(40px,6vh,100px)]">
              {/* Time Label */}
              <div className="p-2 bg-gray-50 text-xs text-gray-600 font-medium border-r">
                {formatDate(new Date(new Date().setHours(hour, 0, 0, 0)), 'h:mm a')}
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const events = getEventsForSlot(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={`border-l border-gray-400 p-1 hover:bg-gray-50 transition-colors ${isSameDay(day, new Date()) ? 'bg-blue-25' : ''
                      }`}
                  >

                  </div>
                );
              })}
              {/* Event Slots */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {weekDays.map((day, dayIndex) =>
                  events
                    .filter(event => isSameDay(new Date(event.startTime), day))
                    .map(event => (
                      <div
                        key={event.id}
                        style={calculateEventSlotStyling(event, dayIndex)}  // ← HERE is where you use it
                        className={`${getFlexibilityColor(event.flexibility)} border rounded p-1 cursor-pointer pointer-events-auto text-xs`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-[10px]">
                          {formatDate(new Date(event.startTime), 'h:mm a')} - {formatDate(new Date(event.endTime), 'h:mm a')}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
          <span>Day Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
          <span>Flexible</span>
        </div>
      </div>

      {/* Simple Add Event Modal Placeholder */}
      <AddEventWindow
        isOpen={showAddEvent} // show the window if showAddEvent is true
        onClose={() => setShowAddEvent(false)} // close the window by setting showAddEvent to false
        onSubmit={handleAddEvent}
      />

      <ChatWindow
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onEventsCreated={refreshEvents}
        />
    </div>
      
  );
}