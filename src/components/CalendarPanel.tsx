import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockEvents } from '../data/mockData';
import { CalendarEvent } from '../types';

interface CalendarPanelProps {
  filterClassId?: string;
}

export default function CalendarPanel({ filterClassId }: CalendarPanelProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const events = filterClassId
    ? mockEvents.filter(e => e.classId === filterClassId)
    : mockEvents;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start
  const startPad = monthStart.getDay();
  const paddedDays: (Date | null)[] = [...Array(startPad).fill(null), ...days];

  const getEventsForDay = (day: Date): CalendarEvent[] =>
    events.filter(e => isSameDay(new Date(e.date), day));

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const typeColors: Record<string, string> = {
    assignment: 'bg-indigo-500',
    exam: 'bg-red-500',
    event: 'bg-amber-500',
    reminder: 'bg-green-500',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 px-2 gap-y-1 flex-1">
        {paddedDays.map((day, idx) => {
          if (!day) return <div key={`pad-${idx}`} />;
          const dayEvents = getEventsForDay(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`
                relative flex flex-col items-center py-1 rounded-lg text-xs transition-colors
                ${!isSameMonth(day, currentDate) ? 'text-gray-300' : 'text-gray-700'}
                ${isToday(day) ? 'bg-indigo-600 text-white font-bold' : ''}
                ${isSelected && !isToday(day) ? 'bg-indigo-100 text-indigo-700' : ''}
                ${!isSelected && !isToday(day) ? 'hover:bg-gray-100' : ''}
              `}
            >
              {format(day, 'd')}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map(e => (
                    <div
                      key={e.id}
                      className={`w-1 h-1 rounded-full ${typeColors[e.type] || 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 py-2 border-t border-gray-100 flex-wrap">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-gray-500 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="px-4 py-2 border-t border-gray-100 max-h-32 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 mb-1">{format(selectedDay, 'MMMM d')}</p>
          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-gray-400">No events</p>
          ) : (
            selectedDayEvents.map(e => (
              <div key={e.id} className="flex items-center gap-2 py-0.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeColors[e.type]}`} />
                <span className="text-xs text-gray-700">{e.title}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
