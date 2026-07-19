import React, { useState, useRef } from 'react';
import { Task, TaskPriority } from '../types';
import { 
  Star, Clock, Calendar, CheckSquare, Trash, Edit3, 
  RefreshCw, Bell, AlertTriangle, ArrowRight, Eye, ChevronRight
} from 'lucide-react';
import { isOverdue, highlightText } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';

interface TaskCardProps {
  key?: React.Key;
  task: Task;
  searchQuery: string;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleStar: (id: string) => void;
  globalAccentColor: string;
}

export default function TaskCard({
  task,
  searchQuery,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onToggleStar,
  globalAccentColor,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineTitle, setInlineTitle] = useState(task.title);
  const [showTooltip, setShowTooltip] = useState(false);

  const overdue = isOverdue(task.dueDate, task.completed);

  // Class styling based on priority (Feature #55 color-coded left border)
  const priorityBorderClass = 
    task.priority === 'high' ? 'border-l-4 border-l-red-500' :
    task.priority === 'medium' ? 'border-l-4 border-l-amber-500' :
    'border-l-4 border-l-emerald-500';

  const priorityBadgeClass = 
    task.priority === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
    task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';

  const handleInlineSave = () => {
    if (inlineTitle.trim() && inlineTitle !== task.title) {
      task.title = inlineTitle.trim();
    }
    setIsEditingInline(false);
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInlineSave();
    } else if (e.key === 'Escape') {
      setInlineTitle(task.title);
      setIsEditingInline(false);
    }
  };

  const subtasksCompleted = task.subtasks.filter(s => s.completed).length;
  const subtasksTotal = task.subtasks.length;

  return (
    <div className="relative">
      {/* Task main wrapper */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onMouseEnter={() => {
          setIsHovered(true);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        className={`group p-4 glass-card border border-white/10 rounded-2xl shadow-sm hover:shadow-lg hover:border-white/20 transition-all duration-300 relative flex items-center justify-between gap-4 overflow-hidden ${priorityBorderClass} ${
          task.completed ? 'opacity-60' : ''
        }`}
      >
        {/* Overdue Glow overlay (Animation #31 Overdue glow pulse) */}
        {overdue && (
          <div className="absolute inset-0 bg-red-500/[0.02] border border-red-500/15 pointer-events-none rounded-2xl animate-pulse" />
        )}

        {/* Task complete wash color animation (Animation #47) */}
        {task.completed && (
          <div className="absolute inset-y-0 left-0 bg-emerald-500/5 w-1.5 pointer-events-none" />
        )}

        {/* Checkbox and text column */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          
          {/* Custom Animated Checkbox (Feature #14, Animation #4) */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className="shrink-0 w-6 h-6 rounded-lg border-2 border-slate-400 dark:border-white/20 hover:border-cyan-500 dark:hover:border-cyan-500 flex items-center justify-center transition-all bg-transparent cursor-pointer active:scale-90"
            title={task.completed ? "Mark incomplete" : "Complete task"}
          >
            {task.completed ? (
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                {/* SVG path check animation drawing effect */}
                <motion.path 
                  initial={{ pathLength: 0 }} 
                  animate={{ pathLength: 1 }} 
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            ) : null}
          </button>

          {/* Title and details wrapper */}
          <div className="flex-1 min-w-0 space-y-1">
            
            {/* Inline Title Field (Feature #16 click to inline edit) */}
            {isEditingInline ? (
              <input
                type="text"
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onBlur={handleInlineSave}
                onKeyDown={handleInlineKeyDown}
                autoFocus
                className="w-full bg-white/5 border border-cyan-500/40 rounded px-2 py-0.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            ) : (
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <span
                  onClick={() => setIsEditingInline(true)}
                  className={`text-sm font-bold tracking-tight text-white cursor-text hover:text-cyan-400 break-words line-clamp-2 leading-tight transition-colors ${
                    task.completed ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {/* Highlight text if matches search */}
                  {highlightText(task.title, searchQuery)}
                </span>

                {/* Overdue alert indicator */}
                {overdue && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 font-mono uppercase animate-bounce shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Overdue</span>
                  </span>
                )}
              </div>
            )}

            {/* Subtitle description / subtasks completed count */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium flex-wrap">
              {/* Due Date & Time indicator */}
              {task.dueDate && (
                <span className={`flex items-center gap-1 font-mono text-[10px] ${overdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{task.dueDate}</span>
                  {task.dueTime && <span>at {task.dueTime}</span>}
                </span>
              )}

              {/* Subtasks Progress Tracker */}
              {subtasksTotal > 0 && (
                <span className="flex items-center gap-1 text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono font-bold text-slate-300">
                  <span>{subtasksCompleted}/{subtasksTotal} Checklist</span>
                </span>
              )}

              {/* Recurring intervals icon (Feature #19) */}
              {task.isRecurring && (
                <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono font-bold capitalize">
                  <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{task.recurrenceInterval}</span>
                </span>
              )}

              {/* Reminder icon indicator (Feature #20) */}
              {task.tags.includes('alert') && (
                <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 p-1 rounded-full" title="Reminder Alerts Enabled">
                  <Bell className="w-3 h-3 animate-pulse" />
                </span>
              )}
            </div>

            {/* List of tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {task.tags.map(t => (
                  <span key={t} className="text-[10px] font-mono font-bold bg-white/5 text-slate-300 px-2 py-0.5 rounded-md border border-white/10">
                    #{t}
                  </span>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right side actions panel (visible on hover) */}
        <div className="flex items-center gap-1 shrink-0 z-10">
          
          {/* Star Favorite toggle (Feature #21, Animation #29) */}
          <button
            onClick={() => onToggleStar(task.id)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-75 ${
              task.isStarred 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 scale-105' 
                : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
            title="Star Task"
          >
            <Star className={`w-4 h-4 ${task.isStarred ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Edit Task details (opens full modal) */}
          <button
            onClick={() => onEditTask(task)}
            className="p-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Edit Task Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete task button */}
          <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash className="w-4 h-4" />
          </button>

        </div>

      </motion.div>

      {/* Hover Preview Tooltip (Feature #56, Animation #27: Tooltip fade + scale-in) */}
      <AnimatePresence>
        {showTooltip && isHovered && (task.description || task.subtasks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute left-8 bottom-full mb-2 w-64 p-4 rounded-xl bg-slate-900/95 dark:bg-[#161525] border border-slate-200/10 dark:border-white/10 text-white shadow-2xl z-40 backdrop-blur-md pointer-events-none"
          >
            <h5 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1.5">Task Preview</h5>
            {task.description && (
              <p className="text-[11px] text-slate-300 line-clamp-3 mb-2 italic">
                "{task.description}"
              </p>
            )}
            {task.subtasks.length > 0 && (
              <div className="space-y-1 border-t border-white/5 pt-2">
                <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">Checklist items:</p>
                {task.subtasks.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className={s.completed ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {s.completed ? '✓' : '○'}
                    </span>
                    <span className={`truncate ${s.completed ? 'line-through opacity-50' : ''}`}>{s.title}</span>
                  </div>
                ))}
                {task.subtasks.length > 3 && (
                  <span className="text-[9px] text-slate-400 font-mono font-bold italic">
                    + {task.subtasks.length - 3} more subtasks
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
