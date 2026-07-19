import React from 'react';
import { X, Sun, Moon, Bell, HelpCircle, Key, Palette, Trash2, ArrowRight } from 'lucide-react';
import { Settings } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (s: Partial<Settings>) => void;
  onClearAllData: () => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllData,
}: SettingsPanelProps) {
  
  const accentSwatches = [
    { name: 'Teal Aurora', value: '#06b6d4' },
    { name: 'Power Blue', value: '#3b82f6' },
    { name: 'Deep Purple', value: '#8b5cf6' },
    { name: 'Hot Pink', value: '#ec4899' },
    { name: 'Rose Petal', value: '#f43f5e' },
    { name: 'Green Mint', value: '#10b981' },
    { name: 'Amber Glow', value: '#f59e0b' },
    { name: 'Retro Slate', value: '#64748b' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glassmorphism (Animation #19) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Panel body (Animation #18) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#11101a] border border-slate-200/10 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400">
                <Palette className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-base font-black text-slate-800 dark:text-white">
                Application Configuration
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Settings scrollable block */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Theme Toggle option */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400 font-bold">Aesthetic Theme</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                    settings.theme === 'light'
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Control-Room</span>
                </button>
              </div>
            </div>

            {/* Accent swatch color picker */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400 font-bold">Accent Theme Color</label>
              <div className="grid grid-cols-4 gap-2">
                {accentSwatches.map((swatch) => {
                  const isSelected = settings.globalAccentColor === swatch.value;
                  return (
                    <button
                      key={swatch.value}
                      type="button"
                      onClick={() => onUpdateSettings({ globalAccentColor: swatch.value })}
                      className={`h-11 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 group ${
                        isSelected 
                          ? 'border-cyan-500 ring-2 ring-cyan-500/20' 
                          : 'border-slate-200 dark:border-white/5'
                      }`}
                      style={{ backgroundColor: `${swatch.value}15` }}
                    >
                      <div 
                        className="w-5 h-5 rounded-full shadow-inner transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: swatch.value }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications settings */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400 font-bold">System Alerts</label>
              <button
                type="button"
                onClick={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  settings.notificationsEnabled 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                    : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className={`w-4.5 h-4.5 ${settings.notificationsEnabled ? 'animate-bounce' : ''}`} />
                  <div className="text-left">
                    <p className="text-xs font-bold leading-none">Toast Notifications</p>
                    <p className="text-[10px] text-slate-400 mt-1">Show brief in-app activity alert bars</p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            {/* Keyboard shortcuts helper info box */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Key className="w-4 h-4 text-cyan-400" />
                <h5 className="text-xs font-bold">Keyboard Shortcuts</h5>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                  <span>New Task Modal:</span>
                  <kbd className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1 rounded font-bold">N</kbd>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                  <span>Save / Create:</span>
                  <kbd className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1 rounded font-bold">Enter</kbd>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                  <span>Close / Cancel:</span>
                  <kbd className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1 rounded font-bold">Esc</kbd>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
                  <span>Toggle Star:</span>
                  <kbd className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1 rounded font-bold">S</kbd>
                </div>
              </div>
            </div>

            {/* Destruction Option: Clear Lists / Tasks */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you absolutely sure you want to clear ALL board lists and tasks? This cannot be undone.')) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="w-full py-3 px-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 flex items-center justify-center gap-2 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Application & Wipe Data</span>
              </button>
            </div>

          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4.5 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
              style={{ backgroundColor: settings.globalAccentColor }}
            >
              Done Configure
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
