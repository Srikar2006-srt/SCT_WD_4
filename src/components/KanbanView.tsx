import React, { useState } from 'react';
import { Task, List, TaskPriority } from '../types';
import { Star, Clock, Calendar, CheckCircle2, ChevronRight, ChevronLeft, MessageSquare, AlertCircle, Trash } from 'lucide-react';
import { isOverdue } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';

interface KanbanViewProps {
  tasks: Task[];
  list: List;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskPriority: (id: string, priority: TaskPriority) => void;
  onToggleStar: (id: string) => void;
  globalAccentColor: string;
}

export default function KanbanView({
  tasks,
  list,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onUpdateTaskPriority,
  onToggleStar,
  globalAccentColor,
}: KanbanViewProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filter tasks belonging to current list
  const listTasks = tasks.filter(t => t.listId === list.id && !t.isArchived);

  // Columns: Low, Medium, High, Completed
  const columns: { id: string; title: string; color: string; bg: string; border: string; tasks: Task[] }[] = [
    {
      id: 'low',
      title: 'Low Priority',
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/10',
      tasks: listTasks.filter(t => !t.completed && t.priority === 'low'),
    },
    {
      id: 'medium',
      title: 'Medium Priority',
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/10',
      tasks: listTasks.filter(t => !t.completed && t.priority === 'medium'),
    },
    {
      id: 'high',
      title: 'Critical/High',
      color: 'text-red-500 dark:text-red-400',
      bg: 'bg-red-500/5',
      border: 'border-red-500/10',
      tasks: listTasks.filter(t => !t.completed && t.priority === 'high'),
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'text-cyan-500 dark:text-cyan-400',
      bg: 'bg-cyan-500/5',
      border: 'border-cyan-500/10',
      tasks: listTasks.filter(t => t.completed),
    },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (!id) return;

    if (targetColumnId === 'completed') {
      const task = tasks.find(t => t.id === id);
      if (task && !task.completed) {
        onToggleComplete(id);
      }
    } else {
      const task = tasks.find(t => t.id === id);
      if (task) {
        if (task.completed) {
          onToggleComplete(id); // uncheck first
        }
        onUpdateTaskPriority(id, targetColumnId as TaskPriority);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
      {columns.map((column) => {
        const isOver = dragOverColumn === column.id;
        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col p-4 rounded-2xl glass-card border transition-all duration-300 min-h-[400px] ${
              isOver 
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01] rotate-[-0.5deg]' 
                : 'border-white/10'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <span className={`font-black font-mono text-xs uppercase tracking-wider ${column.color}`}>
                {column.title}
              </span>
              <span className="text-[11px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded-full text-slate-300">
                {column.tasks.length}
              </span>
            </div>

            {/* Tasks container (Animation #10 Drop-zone pulse if dragged) */}
            <div className={`flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px] p-0.5 ${draggedTaskId ? 'border-2 border-dashed border-white/10 rounded-xl' : ''}`}>
              <AnimatePresence>
                {column.tasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.completed);
                  const activePriorityClass = 
                    task.priority === 'high' ? 'border-l-4 border-l-red-500' :
                    task.priority === 'medium' ? 'border-l-4 border-l-amber-500' :
                    'border-l-4 border-l-emerald-500';

                  return (
                    <motion.div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      layoutId={`kanban-${task.id}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3.5 bg-white/[0.04] border border-white/10 rounded-xl shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-all relative overflow-hidden group ${activePriorityClass}`}
                    >
                      {/* Priority left border indicator (Feature #55) */}
                      {overdue && (
                        <div className="absolute inset-0 bg-red-500/[0.02] border border-red-500/20 pointer-events-none animate-pulse rounded-xl" />
                      )}

                      {/* Header row */}
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <span 
                          onClick={() => onEditTask(task)}
                          className={`text-sm font-bold tracking-tight text-white cursor-pointer hover:underline decoration-cyan-400 break-words flex-1 ${task.completed ? 'line-through text-slate-500' : ''}`}
                        >
                          {task.title}
                        </span>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Star */}
                          <button 
                            onClick={() => onToggleStar(task.id)}
                            className={`p-1 rounded text-slate-400 hover:text-amber-400 transition-colors ${task.isStarred ? 'text-amber-500' : ''}`}
                          >
                            <Star className={`w-3.5 h-3.5 ${task.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                          {/* Checklist items tracker */}
                          {task.subtasks.length > 0 && (
                            <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-1.5 py-0.5 rounded font-bold border border-white/5">
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes / Description summary */}
                      {task.description && (
                        <p className="text-xs text-slate-400 mb-2.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Tags chips list */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.map(t => (
                            <span key={t} className="text-[9px] font-mono font-bold bg-white/5 text-slate-300 px-1.5 py-0.5 rounded border border-white/10">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metadata Row */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                          {task.dueDate ? (
                            <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-bold' : ''}`}>
                              <Calendar className="w-3 h-3" />
                              <span>{task.dueDate}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">No due date</span>
                          )}
                        </div>

                        {/* Fast action column modifiers for mobile touch */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onToggleComplete(task.id)}
                            className={`p-1 rounded text-slate-400 hover:text-emerald-500 transition-colors`}
                            title={task.completed ? "Mark incomplete" : "Complete task"}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${task.completed ? 'text-emerald-500 fill-emerald-500/20' : ''}`} />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Task"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {column.tasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-2xl mb-1 filter opacity-40">📭</span>
                  <p className="text-[11px] font-mono text-slate-400">Column empty</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
