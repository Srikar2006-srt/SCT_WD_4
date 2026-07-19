import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, ListFilter, SlidersHorizontal, Share2, Printer, 
  Trash2, Bell, AlertTriangle, Play, Sparkles, LogOut, CheckCircle2,
  Calendar, Kanban, LayoutList, Mic, MicOff, Info, HelpCircle
} from 'lucide-react';
import { Task, List, Settings, Toast, UndoAction, TaskPriority } from './types';
import { isToday, isThisWeek, isOverdue, launchConfetti } from './utils/helpers';
import Sidebar from './components/Sidebar';
import TodayWidget from './components/TodayWidget';
import StatsDashboard from './components/StatsDashboard';
import TaskModal from './components/TaskModal';
import SettingsPanel from './components/SettingsPanel';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import Onboarding from './components/Onboarding';
import TaskCard from './components/TaskCard';
import { motion, AnimatePresence } from 'motion/react';

// Default Board Lists
const DEFAULT_LISTS: List[] = [
  { id: 'personal', name: 'Personal', emoji: '🌸', accentColor: '#06b6d4' },
  { id: 'work', name: 'Work', emoji: '💼', accentColor: '#3b82f6' },
  { id: 'ideas', name: 'Ideas', emoji: '💡', accentColor: '#f59e0b' },
];

// Initial Demo Tasks to show immediately
const DEMO_TASKS = (listId: string): Task[] => [
  {
    id: 'demo-1',
    title: 'Design high-fidelity user onboarding wireframes',
    description: 'Create beautiful mockups for user onboarding inside Figma using custom dark-control themes.',
    dueDate: new Date().toISOString().split('T')[0], // Today
    dueTime: '14:00',
    priority: 'high',
    listId,
    tags: ['figma', 'onboarding'],
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-1', title: 'Define user journey maps', completed: true },
      { id: 'sub-2', title: 'Draft wireframes', completed: false },
      { id: 'sub-3', title: 'Add neon glow accents', completed: false }
    ],
    isStarred: true,
    isRecurring: false,
    isArchived: false
  },
  {
    id: 'demo-2',
    title: 'Review production-grade frontend codebase',
    description: 'Ensure no layout shifts, inspect CSS keyframe transitions, and clean up stale package imports.',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    priority: 'medium',
    listId,
    tags: ['audit', 'refactor'],
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [],
    isStarred: false,
    isRecurring: true,
    recurrenceInterval: 'weekly',
    isArchived: false
  },
  {
    id: 'demo-3',
    title: 'Launch feature announcement newsletter',
    description: 'Send HTML announcement campaign to waitlisted subscribers.',
    dueDate: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago (overdue)
    priority: 'low',
    listId,
    tags: ['marketing'],
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [],
    isStarred: false,
    isRecurring: false,
    isArchived: false
  }
];

export default function App() {
  // Storage loading
  const [lists, setLists] = useState<List[]>(() => {
    const saved = localStorage.getItem('control_room_lists');
    return saved ? JSON.parse(saved) : DEFAULT_LISTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('control_room_tasks');
    if (saved) return JSON.parse(saved);
    // Seed default lists with tasks
    return [...DEMO_TASKS('personal'), ...DEMO_TASKS('work')];
  });

  const [activeListId, setActiveListId] = useState<string>(() => lists[0]?.id || 'personal');
  
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('control_room_settings');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      globalAccentColor: '#06b6d4',
      notificationsEnabled: true
    };
  });

  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    const saved = localStorage.getItem('control_room_onboarded');
    return saved ? JSON.parse(saved) : false;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('control_room_streak');
    return saved ? parseInt(saved, 10) : 5; // Starting with a positive streak
  });

  // Active View ('list' | 'kanban' | 'calendar')
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'calendar'>('list');

  // Interactive Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'alphabetical'>('date');

  // UI Component Toggles
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);

  // Quick Add Form State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDueDate, setQuickDueDate] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');

  // Toast / Undo Notification queues
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  // Voice recognition simulation state (Feature #42, Animation #65 & #66)
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  // Mouse position & Parallax offsets for spatial effect (visionOS)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      const xOffset = (e.clientX / window.innerWidth - 0.5) * 15;
      const yOffset = (e.clientY / window.innerHeight - 0.5) * 15;
      setParallaxOffset({ x: xOffset, y: yOffset });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Refs for confetti & canvas
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('control_room_lists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('control_room_tasks', JSON.stringify(tasks));
    
    // Set Document Tab Title with active tasks count (Feature #59)
    const activeCount = tasks.filter(t => !t.completed && !t.isArchived).length;
    document.title = activeCount > 0 ? `(${activeCount}) Productivity Control` : 'Productivity Control Room';
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('control_room_settings', JSON.stringify(settings));
    
    // Inject Theme Class to Document
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  // Keyboard Shortcuts (Feature #41)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts when typing in inputs or textareas
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setSelectedTask(null);
        setIsTaskModalOpen(true);
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // System alert toast helper (Feature #50)
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    if (!settings.notificationsEnabled) return;
    const newToast: Toast = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  // Add Task Function
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (selectedTask) {
      // Editing Mode
      const updated = tasks.map(t => {
        if (t.id === selectedTask.id) {
          return {
            ...t,
            ...taskData,
          } as Task;
        }
        return t;
      });
      setTasks(updated);
      addToast('Task details updated successfully.', 'success');
    } else {
      // Creating Mode
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime,
        priority: taskData.priority || 'medium',
        listId: taskData.listId || activeListId,
        tags: taskData.tags || [],
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: taskData.subtasks || [],
        isStarred: taskData.isStarred || false,
        isRecurring: taskData.isRecurring || false,
        recurrenceInterval: taskData.recurrenceInterval,
        isArchived: false,
      };
      setTasks(prev => [newTask, ...prev]);
      addToast('Task successfully created.', 'success');
    }
    setSelectedTask(null);
  };

  // Quick Add Submission (Feature #1)
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: quickTitle.trim(),
      description: '',
      dueDate: quickDueDate || undefined,
      priority: quickPriority,
      listId: activeListId,
      tags: [],
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      isStarred: false,
      isRecurring: false,
      isArchived: false,
    };

    setTasks(prev => [newTask, ...prev]);
    addToast('Task quick-added!', 'success');
    setQuickTitle('');
    setQuickDueDate('');
    setQuickPriority('medium');
  };

  // Delete Task Handler (Feature #17, Animation #22 Undo snackbar)
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    // Filter out of list
    setTasks(prev => prev.filter(t => t.id !== id));

    // Save for undo action
    setUndoAction({
      id: Math.random().toString(36).substr(2, 9),
      type: 'delete_task',
      task: taskToDelete,
      expiry: Date.now() + 6000 // 6 seconds undo window
    });

    addToast('Task deleted.', 'info');
  };

  const handleUndo = () => {
    if (!undoAction) return;
    if (undoAction.type === 'delete_task') {
      setTasks(prev => [undoAction.task, ...prev]);
      addToast('Task restored.', 'success');
    } else if (undoAction.type === 'archive_task') {
      setTasks(prev => prev.map(t => t.id === undoAction.task.id ? { ...t, isArchived: false } : t));
      addToast('Task unarchived.', 'success');
    }
    setUndoAction(null);
  };

  // Complete Toggle Handler (Feature #60 confetti on 100% list complete)
  const handleToggleComplete = (id: string) => {
    let listCompleteTriggered = false;
    
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextCompletedState = !t.completed;
        const nowStr = new Date().toISOString();
        
        // If marking complete, check if that makes this list 100% done
        if (nextCompletedState) {
          const listTasks = tasks.filter(tk => tk.listId === t.listId && !tk.isArchived && tk.id !== id);
          const allOthersCompleted = listTasks.every(tk => tk.completed);
          if (allOthersCompleted && listTasks.length > 0) {
            listCompleteTriggered = true;
          }
        }

        return {
          ...t,
          completed: nextCompletedState,
          completedAt: nextCompletedState ? nowStr : undefined,
        };
      }
      return t;
    });

    setTasks(updated);

    if (listCompleteTriggered) {
      addToast('Incredible! 100% list completion achieved! 🎉', 'success');
      if (confettiCanvasRef.current) {
        launchConfetti(confettiCanvasRef.current);
      }
    }
  };

  // Star / Favorite Toggle
  const handleToggleStar = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isStarred: !t.isStarred } : t));
  };

  // Update priority from Kanban Column movement
  const handleUpdateTaskPriority = (id: string, priority: TaskPriority) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority } : t));
    addToast(`Priority updated to ${priority}.`, 'info');
  };

  // Archive completed tasks (Feature #22)
  const handleArchiveCompleted = () => {
    const completedTasks = tasks.filter(t => t.listId === activeListId && t.completed && !t.isArchived);
    if (completedTasks.length === 0) {
      addToast('No completed tasks to archive.', 'info');
      return;
    }

    setTasks(prev => prev.map(t => t.listId === activeListId && t.completed ? { ...t, isArchived: true } : t));
    addToast(`Archived ${completedTasks.length} completed tasks.`, 'success');
  };

  // Export Tasks JSON (Feature #46)
  const handleExportTasks = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ tasks, lists }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "control_room_tasks_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Tasks and boards exported successfully.', 'success');
  };

  // Import Tasks JSON (Feature #47)
  const handleImportTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.tasks && parsed.lists) {
            setTasks(parsed.tasks);
            setLists(parsed.lists);
            addToast('Data imported successfully!', 'success');
          } else {
            addToast('Invalid export file format.', 'error');
          }
        } catch (error) {
          addToast('Error reading import file.', 'error');
        }
      };
    }
  };

  // Voice input recognition helper (Feature #42)
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Mock recognition since iframe browser may block API
      setIsListeningVoice(true);
      addToast('Listening for voice (Mock Simulation)...', 'info');
      setTimeout(() => {
        setIsListeningVoice(false);
        setQuickTitle('Launch new marketing campaign wireframes');
        addToast('Voice captured: "Launch new marketing campaign wireframes"', 'success');
      }, 3500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListeningVoice(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setQuickTitle(speechToText);
      addToast(`Captured: "${speechToText}"`, 'success');
    };

    recognition.onerror = () => {
      addToast('Voice input error. Try typing.', 'error');
      setIsListeningVoice(false);
    };

    recognition.onend = () => {
      setIsListeningVoice(false);
    };

    recognition.start();
  };

  // Clear everything helper
  const handleClearAllData = () => {
    localStorage.removeItem('control_room_lists');
    localStorage.removeItem('control_room_tasks');
    setLists(DEFAULT_LISTS);
    setTasks([]);
    setActiveListId('personal');
    addToast('All system configurations reset.', 'warning');
  };

  // Filtering Logic
  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  const filteredTasks = tasks
    .filter(t => t.listId === activeListId && !t.isArchived)
    .filter(t => {
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    })
    .filter(t => {
      // Completion status filter
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return !t.completed;
      if (statusFilter === 'completed') return t.completed;
      return true;
    })
    .filter(t => {
      // Priority filter
      if (priorityFilter === 'all') return true;
      return t.priority === priorityFilter;
    })
    .filter(t => {
      // Date filter
      if (dateFilter === 'all') return true;
      if (dateFilter === 'today') return isToday(t.dueDate);
      if (dateFilter === 'week') return isThisWeek(t.dueDate);
      if (dateFilter === 'overdue') return isOverdue(t.dueDate, t.completed);
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // Print function (Feature #54)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0b0c11] text-white font-sans transition-all duration-700 select-none relative overflow-x-hidden md:p-6 md:gap-6 h-screen overflow-hidden">
      
      {/* Absolute Confetti Overlay Canvas */}
      <canvas 
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Spatial Light Refraction Cursor follow shadow */}
      <div 
        className="fixed pointer-events-none z-30 w-[180px] h-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-2xl opacity-60"
        style={{ left: cursorPos.x, top: cursorPos.y, transition: 'left 0.1s ease-out, top 0.1s ease-out' }}
      />

      {/* Background spatial computing ambient grid of drifting colors (Animation #36, Parallax) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{ 
          transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`, 
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
      >
        {/* Soft background mesh color layers */}
        <div className="absolute inset-0 bg-radial from-[#151822] via-[#0b0c11] to-[#050608]" />

        {/* Slow moving soft bloom blobs */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[120px] opacity-25 dark:opacity-20 animate-float-slow"
          style={{ 
            backgroundColor: settings.globalAccentColor, 
            left: '15%', 
            top: '15%',
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[130px] opacity-20 dark:opacity-15 animate-float-medium"
          style={{ 
            backgroundColor: '#8b5cf6', 
            right: '20%', 
            bottom: '20%',
          }}
        />
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-[100px] opacity-15 dark:opacity-10 animate-float-fast"
          style={{ 
            backgroundColor: '#4fd1c5', 
            left: '45%', 
            top: '55%',
          }}
        />

        {/* Floating Spatial Glass Circles to establish depth */}
        <div className="absolute w-24 h-24 rounded-full glass-panel-light left-[8%] bottom-[25%] opacity-30 animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="absolute w-16 h-16 rounded-full glass-panel-light right-[12%] top-[30%] opacity-20 animate-bounce" style={{ animationDuration: '11s' }} />
        <div className="absolute w-32 h-32 rounded-full glass-panel-light left-[50%] top-[8%] opacity-15 animate-bounce" style={{ animationDuration: '14s' }} />
      </div>

      {/* Onboarding Dialog Overlay (Feature #40) */}
      {!hasOnboarded && (
        <Onboarding 
          globalAccentColor={settings.globalAccentColor}
          onComplete={() => {
            setHasOnboarded(true);
            localStorage.setItem('control_room_onboarded', 'true');
          }}
        />
      )}

      {/* Main Sidebar (Feature #9 lists, profile, actions) */}
      <Sidebar
        lists={lists}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        onAddList={(name, emoji, accent) => {
          const newList: List = { id: Math.random().toString(), name, emoji, accentColor: accent };
          setLists([...lists, newList]);
          setActiveListId(newList.id);
          addToast(`Board "${name}" created!`, 'success');
        }}
        onEditList={(id, name, emoji, accent) => {
          setLists(lists.map(l => l.id === id ? { ...l, name, emoji, accentColor: accent } : l));
          addToast('Board modified.', 'success');
        }}
        onDeleteList={(id) => {
          if (lists.length <= 1) return;
          setLists(lists.filter(l => l.id !== id));
          setTasks(tasks.filter(t => t.listId !== id));
          if (activeListId === id) {
            setActiveListId(lists.find(l => l.id !== id)!.id);
          }
          addToast('Board and its tasks deleted.', 'warning');
        }}
        tasks={tasks}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportTasks={handleExportTasks}
        onImportTasks={handleImportTasks}
        onOpenProfile={() => setShowProfileCard(!showProfileCard)}
        globalAccentColor={settings.globalAccentColor}
        theme={settings.theme}
        onToggleTheme={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
      />

      {/* Primary Dashboard Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto glass-panel border border-white/10 shadow-2xl relative rounded-2xl z-10">
        
        {/* Quick Notification Toast Stack */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-xl border shadow-xl flex items-center gap-2.5 pointer-events-auto bg-white dark:bg-[#151421] ${
                  toast.type === 'success' ? 'border-emerald-500/20 text-emerald-500' :
                  toast.type === 'error' ? 'border-red-500/20 text-red-500' :
                  'border-cyan-500/20 text-cyan-400'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current animate-ping" />
                <span className="text-xs font-bold font-sans">{toast.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Undo Activity Snackbar (Feature #17, Animation #22) */}
        <AnimatePresence>
          {undoAction && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-[#151421]/95 text-white py-3.5 px-5 rounded-xl border border-white/10 shadow-2xl flex items-center gap-4 max-w-md w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold">Action completed.</span>
              </div>
              <button
                onClick={handleUndo}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-black rounded-lg text-cyan-400 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card Popover menu */}
        <AnimatePresence>
          {showProfileCard && (
            <div className="fixed inset-0 z-40 flex items-start justify-start p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 15 }}
                transition={{ type: "spring", damping: 18, stiffness: 220 }}
                className="absolute left-20 top-20 w-64 p-5 rounded-2xl bg-[#181c25]/90 backdrop-blur-xl border border-white/10 text-white shadow-2xl pointer-events-auto shadow-cyan-500/5"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500 shadow-lg shadow-cyan-500/20">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-white tracking-tight">Sai Srikar</h5>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Student</p>
                  </div>
                  <div className="w-full border-t border-white/10 pt-3 mt-1 text-xs space-y-2 text-left">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Total Tasks:</span>
                      <span className="font-bold text-white">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Streak:</span>
                      <span className="font-bold text-orange-400">{streak} Days 🔥</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProfileCard(false)} 
                    className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-white rounded-xl transition-all font-semibold border border-white/5 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dashboard Area Padding */}
        <div className="p-6 md:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          
          {/* Top Banner Today Summarizer (Feature #29) */}
          <TodayWidget 
            tasks={tasks} 
            streak={streak} 
            globalAccentColor={settings.globalAccentColor} 
          />

          {/* Quick-Add Single Line Panel Input (Feature #1, Feature #42 voice) */}
          <form onSubmit={handleQuickAdd} className="p-4 rounded-xl bg-white dark:bg-[#13121c]/60 border border-slate-200/50 dark:border-white/5 shadow-md flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center gap-3 w-full md:flex-1">
              {/* Voice recognition mic */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-lg border transition-all ${
                  isListeningVoice 
                    ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-white/5 text-slate-400 hover:text-slate-200'
                }`}
                title="Voice Input Command"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Quick add new task title..."
                required
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium text-sm"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-auto justify-end">
              {/* Priority select */}
              <select
                value={quickPriority}
                onChange={(e: any) => setQuickPriority(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="low" className="text-emerald-500 bg-white dark:bg-[#0f0e17]">Low Priority</option>
                <option value="medium" className="text-amber-500 bg-white dark:bg-[#0f0e17]">Med Priority</option>
                <option value="high" className="text-red-500 bg-white dark:bg-[#0f0e17]">High Priority</option>
              </select>

              {/* Quick Due Date picker */}
              <div className="relative">
                <input
                  type="date"
                  value={quickDueDate}
                  onChange={(e) => setQuickDueDate(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none w-36"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Add trigger */}
              <button
                type="submit"
                style={{ backgroundColor: settings.globalAccentColor }}
                className="p-2.5 rounded-xl text-white hover:brightness-110 active:scale-90 shadow-md transition-all cursor-pointer font-bold flex items-center justify-center"
                title="Create Task"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>
          </form>

          {/* Sub Navigation filters bar and display mode options (Features #23-27) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#13121c]/60 border border-slate-200/50 dark:border-white/5 shadow-md space-y-4">
            
            {/* Top Row: View Selector Toggles + Search (Feature #30, #31, #32, #23) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Views switcher tabs (Feature #30, #31, #32) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-white/5 select-none w-fit">
                <button
                  onClick={() => setActiveView('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'list' ? 'bg-white dark:bg-[#11101a] text-cyan-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-300'}`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  onClick={() => setActiveView('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'kanban' ? 'bg-white dark:bg-[#11101a] text-cyan-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-300'}`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'calendar' ? 'bg-white dark:bg-[#11101a] text-cyan-400 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-300'}`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </button>
              </div>

              {/* Action utility row */}
              <div className="flex items-center gap-2">
                {/* Print board */}
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg border border-slate-200 dark:border-white/5 text-slate-500 hover:text-cyan-400 bg-slate-50 dark:bg-slate-900/20 transition-all cursor-pointer"
                  title="Print active list"
                >
                  <Printer className="w-4 h-4" />
                </button>
                {/* ArchiveCompleted tasks */}
                <button
                  onClick={handleArchiveCompleted}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 hover:text-cyan-400 bg-slate-50 dark:bg-slate-900/20 transition-all cursor-pointer"
                >
                  <span>Archive Completed</span>
                </button>
              </div>

              {/* Live search input (Feature #23) */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search tasks, descriptions, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

            </div>

            {/* Bottom Row: Detailed filter selectors (Features #24, #25, #26, #27) */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 font-medium">
              
              {/* Status filter tabs */}
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Status:</span>
                <div className="flex gap-1.5">
                  {(['all', 'active', 'completed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === st ? 'bg-slate-200 dark:bg-white/10 text-cyan-400 font-bold' : 'hover:text-slate-300'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority filter selector */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e: any) => setPriorityFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 px-2.5 py-1 rounded-lg text-xs"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              {/* Due Date Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Due Date:</span>
                <select
                  value={dateFilter}
                  onChange={(e: any) => setDateFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 px-2.5 py-1 rounded-lg text-xs"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today Only</option>
                  <option value="week">This Week</option>
                  <option value="overdue">Overdue Only</option>
                </select>
              </div>

              {/* Sorting rule selector */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 px-2.5 py-1 rounded-lg text-xs"
                >
                  <option value="date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

            </div>

          </div>

          {/* Active View Content Box with stagger fade elements */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeView === 'list' && (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        searchQuery={searchQuery}
                        onToggleComplete={handleToggleComplete}
                        onEditTask={(t) => {
                          setSelectedTask(t);
                          setIsTaskModalOpen(true);
                        }}
                        onDeleteTask={handleDeleteTask}
                        onToggleStar={handleToggleStar}
                        globalAccentColor={settings.globalAccentColor}
                      />
                    ))
                  ) : (
                    /* Elegant empty-state vector (Feature #39, Animation #40 floats/breathes) */
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <div className="relative flex items-center justify-center w-24 h-24 bg-slate-100 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-white/5 animate-[bounce_4s_infinite_alternate]">
                        <span className="text-4xl filter saturate-150 animate-pulse">🌸</span>
                      </div>
                      <div className="max-w-xs space-y-1">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">All caught up here!</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                          There are no tasks matching your selected filters inside board list "{activeList?.name}".
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeView === 'kanban' && (
                <motion.div
                  key="kanban-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <KanbanView
                    tasks={tasks}
                    list={activeList}
                    onToggleComplete={handleToggleComplete}
                    onEditTask={(t) => {
                      setSelectedTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTaskPriority={handleUpdateTaskPriority}
                    onToggleStar={handleToggleStar}
                    globalAccentColor={settings.globalAccentColor}
                  />
                </motion.div>
              )}

              {activeView === 'calendar' && (
                <motion.div
                  key="calendar-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <CalendarView
                    tasks={tasks}
                    list={activeList}
                    onEditTask={(t) => {
                      setSelectedTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onAddTaskOnDate={(dateStr) => {
                      setQuickDueDate(dateStr);
                      setSelectedTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    globalAccentColor={settings.globalAccentColor}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Statistics Dashboard Panel (Feature #36) */}
          <StatsDashboard 
            tasks={tasks} 
            lists={lists} 
            globalAccentColor={settings.globalAccentColor} 
          />

        </div>

        {/* Floating Action Button for mobile layout (Feature #2, Animation #26 rotatable icon) */}
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            style={{ backgroundColor: settings.globalAccentColor }}
            className="w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center cursor-pointer hover:brightness-110 active:scale-95"
          >
            <Plus className="w-7 h-7" />
          </motion.button>
        </div>

        {/* Mobile bottom navigation (Feature #49 bottom menu responsive) */}
        <div className="md:hidden sticky bottom-0 inset-x-0 bg-white/95 dark:bg-[#0f0e17]/95 border-t border-slate-200 dark:border-white/5 py-2.5 px-6 flex items-center justify-around z-40 backdrop-blur-md">
          <button 
            onClick={() => setActiveView('list')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeView === 'list' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <LayoutList className="w-5 h-5" />
            <span>List View</span>
          </button>
          <button 
            onClick={() => setActiveView('kanban')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeView === 'kanban' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Kanban className="w-5 h-5" />
            <span>Kanban</span>
          </button>
          <button 
            onClick={() => setActiveView('calendar')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeView === 'calendar' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <Calendar className="w-5 h-5" />
            <span>Calendar</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Configure</span>
          </button>
        </div>

      </div>

      {/* Complete Task Detail Overlay Drawer / Modal (Feature #43) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        lists={lists}
        currentListId={activeListId}
        onSave={handleSaveTask}
        globalAccentColor={settings.globalAccentColor}
      />

      {/* Interactive Global Config Configuration (Feature #45) */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(partial) => setSettings(prev => ({ ...prev, ...partial }))}
        onClearAllData={handleClearAllData}
      />

    </div>
  );
}
