import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

export default function CalendarView({ notes, onDateClick }) {
  // Group notes by local date string (fixes timezone issues)
  const notesByDate = notes.reduce((acc, note) => {
    const dateStr = new Date(note.createdAt).toLocaleDateString(); // ✅ local date
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(note);
    return acc;
  }, {});

  const tileContent = ({ date }) => {
    const dateStr = date.toLocaleDateString(); // ✅ local date
    const dayNotes = notesByDate[dateStr];

    if (!dayNotes) return null;

    return (
      <div className="calendar-dots">
        {dayNotes.map((note, idx) => (
          <span
            key={idx}
            className="note-dot"
            style={{ backgroundColor: note.tag.color }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <h3>📅 Note Calendar</h3>
      <Calendar
        onClickDay={onDateClick}
        tileContent={tileContent}
      />
    </div>
  );
}
