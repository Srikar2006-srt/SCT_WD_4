import React, { useState } from 'react';
import { List, Task } from '../types';
import { 
  Plus, Settings, LogOut, CheckSquare, Sparkles, FolderOpen, 
  Trash2, Download, Upload, Sun, Moon, Edit3, Check, Palette, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  lists: List[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onAddList: (name: string, emoji: string, accentColor: string) => void;
  onEditList: (id: string, name: string, emoji: string, accentColor: string) => void;
  onDeleteList: (id: string) => void;
  tasks: Task[];
  onOpenSettings: () => void;
  onExportTasks: () => void;
  onImportTasks: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenProfile: () => void;
  globalAccentColor: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Sidebar({
  lists,
  activeListId,
  onSelectList,
  onAddList,
  onEditList,
  onDeleteList,
  tasks,
  onOpenSettings,
  onExportTasks,
  onImportTasks,
  onOpenProfile,
  globalAccentColor,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListEmoji, setNewListEmoji] = useState('📝');
  const [newListColor, setNewListColor] = useState('#06b6d4');
  
  // For editing an existing list
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('📝');
  const [editColor, setEditColor] = useState('#06b6d4');

  const presetEmojis = ['📝', '💼', '🌸', '💡', '🔥', '🚀', '🏋️', '📚', '🛒', '🎨', '✈️', '🏠'];
  const presetColors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#64748b'];

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onAddList(newListName.trim(), newListEmoji, newListColor);
    setNewListName('');
    setShowAddListForm(false);
  };

  const handleStartEditing = (list: List, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingListId(list.id);
    setEditName(list.name);
    setEditEmoji(list.emoji);
    setEditColor(list.accentColor);
  };

  const handleSaveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    onEditList(id, editName.trim(), editEmoji, editColor);
    setEditingListId(null);
  };

  return (
    <div className="w-full md:w-72 glass-panel border border-white/10 flex flex-col h-full z-10 rounded-2xl shadow-2xl overflow-hidden shrink-0">
      
      {/* User profile / App name (Feature #44, Animation #79 avatar entrance) */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onOpenProfile}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-10 h-10 rounded-full border-2 border-cyan-500/30 overflow-hidden relative"
          >
            {/* Real aesthetic user avatar */}
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" 
              alt="User profile" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Hover green dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#11131B]" />
          </motion.div>
          <div>
            <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors font-sans">
              Sai Srikar
            </h4>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Student</p>
          </div>
        </div>

        {/* Theme Toggle (Feature #57, Animation #23 sun/moon morph) */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:text-cyan-400 dark:hover:text-cyan-400 transition-all active:scale-90"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>
      </div>

      {/* Navigation Lists Section (Feature #9) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest">
            Boards / Lists
          </span>
          <button
            onClick={() => setShowAddListForm(!showAddListForm)}
            className="p-1 rounded-lg bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition-all active:scale-90"
            title="Create New List"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add List Expandable Form */}
        <AnimatePresence>
          {showAddListForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateList}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 space-y-3 overflow-hidden"
            >
              <input
                type="text"
                placeholder="List name..."
                required
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />

              {/* Emoji Selector Preset */}
              <div>
                <label className="block text-[9px] font-mono uppercase text-slate-400 mb-1 font-bold">Icon</label>
                <div className="grid grid-cols-6 gap-1">
                  {presetEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewListEmoji(emoji)}
                      className={`text-sm p-1 rounded hover:bg-slate-200 dark:hover:bg-white/5 transition-transform hover:scale-110 ${newListEmoji === emoji ? 'bg-slate-200 dark:bg-white/10 scale-110' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector Preset */}
              <div>
                <label className="block text-[9px] font-mono uppercase text-slate-400 mb-1 font-bold">Accent Color</label>
                <div className="flex flex-wrap gap-1">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewListColor(color)}
                      className={`w-4 h-4 rounded-full border border-white/20 transition-transform ${newListColor === color ? 'scale-125 ring-2 ring-cyan-400' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddListForm(false)}
                  className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: newListColor }}
                  className="px-3 py-1 text-[10px] font-bold text-white rounded-lg hover:brightness-110 transition-all"
                >
                  Create
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* List of Boards */}
        <div className="space-y-1">
          {lists.map((list) => {
            const listTasks = tasks.filter((t) => t.listId === list.id && !t.isArchived);
            const total = listTasks.length;
            const completed = listTasks.filter((t) => t.completed).length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isActive = activeListId === list.id;
            const isEditing = editingListId === list.id;

            return (
              <div
                key={list.id}
                onClick={() => !isEditing && onSelectList(list.id)}
                className={`group/item p-3 rounded-xl cursor-pointer transition-all border flex flex-col gap-2 ${
                  isActive
                    ? 'bg-white/[0.08] border-white/10 shadow-lg'
                    : 'bg-transparent border-transparent hover:bg-white/[0.03]'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-1">
                  {isEditing ? (
                    <div className="flex-1 flex flex-col gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-1.5 py-0.5 bg-transparent border-none text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                      <div className="flex items-center justify-between">
                        {/* Emojis edit */}
                        <div className="flex gap-1">
                          {presetEmojis.slice(0, 4).map((em) => (
                            <button key={em} onClick={() => setEditEmoji(em)} className={`text-xs p-0.5 rounded ${editEmoji === em ? 'bg-white/20' : ''}`}>{em}</button>
                          ))}
                        </div>
                        {/* Color edit */}
                        <div className="flex gap-1">
                          {presetColors.slice(0, 4).map((c) => (
                            <button key={c} onClick={() => setEditColor(c)} className={`w-3.5 h-3.5 rounded-full border border-white/10 ${editColor === c ? 'scale-110 ring-1 ring-cyan-400' : ''}`} style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button onClick={() => setEditingListId(null)} className="text-[10px] text-slate-400">Cancel</button>
                        <button onClick={(e) => handleSaveEdit(list.id, e)} className="text-[10px] text-cyan-400 font-bold">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                        <span className="text-base select-none shrink-0" style={{ textShadow: `0 0 10px ${list.accentColor}40` }}>
                          {list.emoji}
                        </span>
                        <span className={`text-sm font-bold truncate leading-none ${isActive ? 'text-white font-black' : 'text-slate-300'}`}>
                          {list.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartEditing(list, e)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-200"
                          title="Edit Board"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        {lists.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteList(list.id);
                            }}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-red-400"
                            title="Delete Board"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Task Count Badge (Feature #35) */}
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 group-hover/item:scale-105 transition-transform shrink-0">
                        {total}
                      </span>
                    </>
                  )}
                </div>

                {/* Progress bar per board (Feature #33, Animation #13 progress bar smooth fill) */}
                {!isEditing && total > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800/60 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: list.accentColor,
                          boxShadow: `0 0 8px ${list.accentColor}60`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer: Export, Import, Settings (Features #45, #46, #47) */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2 bg-white/[0.01] shrink-0">
        
        {/* Import & Export Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Export tasks JSON */}
          <button
            onClick={onExportTasks}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/20 transition-all text-xs font-semibold group cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            <span>Export</span>
          </button>

          {/* Import tasks JSON */}
          <label className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/20 transition-all text-xs font-semibold cursor-pointer group">
            <Upload className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportTasks}
              className="hidden"
            />
          </label>
        </div>

        {/* Settings panel trigger */}
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-between w-full p-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-colors text-xs font-semibold cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 animate-[spin_10s_infinite_linear]" />
            <span>Application Settings</span>
          </div>
          <span className="text-[9px] font-mono opacity-50">v1.2.0</span>
        </button>

      </div>

    </div>
  );
}
