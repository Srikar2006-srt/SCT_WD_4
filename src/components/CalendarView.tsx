import React, { useState } from 'react';
import { Task, List } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Plus, Star, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  tasks: Task[];
  list: List;
  onEditTask: (task: Task) => void;
  onAddTaskOnDate: (dateStr: string) => void;
  globalAccentColor: string;
}

export default function CalendarView({
  tasks,
  list,
  onEditTask,
  onAddTaskOnDate,
  globalAccentColor,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get tasks for the current list and not archived
  const listTasks = tasks.filter(t => t.listId === list.id && !t.isArchived);

  // Math for calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get previous month padding days
  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevMonthPadding = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevMonthPadding.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      dateString: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
    });
  }

  // Current month days
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      isCurrentMonth: true,
      dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  // Next month padding days to make grid of 42 (6 rows of 7)
  const totalDays = prevMonthPadding.length + currentMonthDays.length;
  const nextMonthPaddingDaysCount = totalDays > 35 ? 42 - totalDays : 35 - totalDays;
  const nextMonthPadding = [];
  for (let i = 1; i <= nextMonthPaddingDaysCount; i++) {
    nextMonthPadding.push({
      day: i,
      isCurrentMonth: false,
      dateString: `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }

  const calendarDays = [...prevMonthPadding, ...currentMonthDays, ...nextMonthPadding];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl">
      {/* Calendar Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Board Calendar Timeline</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/5 text-slate-300 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/5 text-slate-300 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of the Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-xs font-mono font-bold text-slate-400 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayObj, idx) => {
          // Find tasks due on this date
          const dayTasks = listTasks.filter(t => t.dueDate === dayObj.dateString);
          const isCurrentDay = dayObj.dateString === new Date().toISOString().split('T')[0];

          return (
            <div
              key={idx}
              className={`min-h-[90px] p-1.5 rounded-xl border flex flex-col justify-between transition-all group ${
                dayObj.isCurrentMonth
                  ? 'bg-white dark:bg-[#11101a] border-slate-200/50 dark:border-white/5 hover:border-cyan-500/50'
                  : 'bg-slate-100/30 dark:bg-slate-900/10 border-slate-100/50 dark:border-white/5 text-slate-400 dark:text-slate-600 opacity-60'
              } ${isCurrentDay ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-white dark:ring-offset-[#11101a]' : ''}`}
            >
              {/* Day number & Quick add on date */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-mono font-bold ${
                  isCurrentDay 
                    ? 'text-white bg-cyan-500 w-5 h-5 rounded-full flex items-center justify-center shadow-md' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {dayObj.day}
                </span>

                <button
                  onClick={() => onAddTaskOnDate(dayObj.dateString)}
                  className="p-0.5 rounded bg-slate-100 dark:bg-white/5 opacity-0 group-hover:opacity-100 text-slate-500 dark:text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                  title="Add task on this date"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Tasks preview list for this day */}
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[64px] scrollbar-thin">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer transition-all border flex items-center gap-1 ${
                      t.completed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80 line-through'
                        : t.priority === 'high'
                        ? 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
                        : t.priority === 'medium'
                        ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                    title={t.title}
                  >
                    {t.isStarred && <Star className="w-2 h-2 fill-amber-500 text-amber-500 shrink-0" />}
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
