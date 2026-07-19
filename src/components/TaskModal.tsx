import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, AlertCircle, Tag, Plus, Trash2, Bell, Star, RefreshCw, Layers } from 'lucide-react';
import { Task, TaskPriority, List, SubTask } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null; // Null means we are creating a new task
  lists: List[];
  currentListId: string;
  onSave: (taskData: any) => void;
  globalAccentColor: string;
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  lists,
  currentListId,
  onSave,
  globalAccentColor,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [listId, setListId] = useState(currentListId);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hasReminder, setHasReminder] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state with selected task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setPriority(task.priority);
      setListId(task.listId);
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
      setIsStarred(task.isStarred || false);
      setIsRecurring(task.isRecurring || false);
      setRecurrenceInterval(task.recurrenceInterval || 'daily');
      setHasReminder(task.tags.includes('alert') || false); // Or separate field, let's treat alert tag as reminder
    } else {
      // Clear fields for new task
      setTitle('');
      setDescription('');
      setDueDate('');
      setDueTime('');
      setPriority('medium');
      setListId(currentListId);
      setTags([]);
      setSubtasks([]);
      setIsStarred(false);
      setIsRecurring(false);
      setRecurrenceInterval('daily');
      setHasReminder(false);
    }
  }, [task, isOpen, currentListId]);

  // Handle outside click to close
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const titleTrim = newSubtaskTitle.trim();
    if (titleTrim) {
      const newSub: SubTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: titleTrim,
        completed: false,
      };
      setSubtasks([...subtasks, newSub]);
    }
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      listId,
      tags,
      subtasks,
      isStarred,
      isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
      completed: task ? task.completed : false,
      isArchived: task ? task.isArchived : false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glassmorphism (Animation #19) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal body (Animation #18) */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#11101a] border border-slate-200/20 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-800 dark:text-white">
                {task ? 'Edit Task Details' : 'Create New Task'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Starred Favorite Toggle */}
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className={`p-2 rounded-lg border transition-all ${isStarred ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-transparent border-slate-200/50 dark:border-white/5 text-slate-400 hover:text-slate-200'}`}
              >
                <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-500' : ''}`} />
              </button>
              {/* Reminder alert Toggle */}
              <button
                type="button"
                onClick={() => setHasReminder(!hasReminder)}
                className={`p-2 rounded-lg border transition-all ${hasReminder ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-transparent border-slate-200/50 dark:border-white/5 text-slate-400 hover:text-slate-200'}`}
              >
                <Bell className={`w-5 h-5 ${hasReminder ? 'animate-[wiggle_1s_infinite_alternate]' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Scrollable Area */}
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Description / Notes</label>
                <textarea
                  placeholder="Add details, links, or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* List Board, Priority & Recurrence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Board List Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Board List</label>
                <div className="relative">
                  <select
                    value={listId}
                    onChange={(e) => setListId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm font-medium appearance-none"
                  >
                    {lists.map((l) => (
                      <option key={l.id} value={l.id} className="bg-white dark:bg-[#11101a] text-slate-700 dark:text-slate-200">
                        {l.emoji} {l.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Priority Select */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Priority</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                    const colors = {
                      low: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
                      medium: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
                      high: 'bg-red-500/10 border-red-500/20 text-red-500',
                    };
                    const activeColors = {
                      low: 'bg-emerald-500 border-emerald-500 text-white font-bold',
                      medium: 'bg-amber-500 border-amber-500 text-white font-bold',
                      high: 'bg-red-50 border-red-500 text-white font-bold',
                    };
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 rounded-xl text-xs border text-center transition-all ${isSelected ? (p === 'high' ? 'bg-red-500 border-red-500 text-white font-bold' : activeColors[p]) : colors[p]} capitalize hover:scale-105 active:scale-95`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence Trigger */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Recurrence</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`px-3 py-2 border rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs font-medium w-full ${isRecurring ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-200'}`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRecurring ? 'animate-spin' : ''}`} />
                    <span>{isRecurring ? 'Recurring' : 'One-time'}</span>
                  </button>
                  {isRecurring && (
                    <select
                      value={recurrenceInterval}
                      onChange={(e: any) => setRecurrenceInterval(e.target.value)}
                      className="px-2.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Due Date (Picker)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Due Time (Picker)</label>
                <div className="relative">
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Subtasks checklist (Feature #18, Accordion/Checklist Animations) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono uppercase text-slate-400 font-bold">Checklist / Subtasks</label>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {subtasks.map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => toggleSubtask(sub.id)}
                        className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 transition-all cursor-pointer"
                      />
                      <span className={`text-xs font-medium ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {sub.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a checklist subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trim = newSubtaskTitle.trim();
                      if (trim) {
                        setSubtasks([...subtasks, { id: Math.random().toString(), title: trim, completed: false }]);
                        setNewSubtaskTitle('');
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trim = newSubtaskTitle.trim();
                    if (trim) {
                      setSubtasks([...subtasks, { id: Math.random().toString(), title: trim, completed: false }]);
                      setNewSubtaskTitle('');
                    }
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom tags/categories (Feature #8, Animation #57 stagger chips) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono uppercase text-slate-400 font-bold">Tags / Categories</label>
              
              <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                {tags.map((tag, i) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-transform active:scale-95"
                  >
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(i)} className="text-cyan-500 hover:text-cyan-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-slate-400/80 italic py-1">No tags added yet. Press Enter below to add one.</span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type tag and press Enter..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const tag = newTagInput.trim().toLowerCase();
                      if (tag && !tags.includes(tag)) {
                        setTags([...tags, tag]);
                        setNewTagInput('');
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    const tag = newTagInput.trim().toLowerCase();
                    if (tag && !tags.includes(tag)) {
                      setTags([...tags, tag]);
                      setNewTagInput('');
                    }
                  }}
                  className="px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Footer Action buttons */}
          <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              style={{ backgroundColor: globalAccentColor }}
              className="px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg shadow-cyan-500/10 hover:brightness-110 active:scale-95 transition-all"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
