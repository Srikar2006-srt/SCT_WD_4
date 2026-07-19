import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Task } from '../types';
import { getMotivationalQuote } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';

interface TodayWidgetProps {
  tasks: Task[];
  streak: number;
  globalAccentColor: string;
}

export default function TodayWidget({ tasks, streak, globalAccentColor }: TodayWidgetProps) {
  const [time, setTime] = useState(new Date());
  const [quote, setQuote] = useState(getMotivationalQuote());
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate motivational quotes every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const quoteTimer = setInterval(() => {
      setQuote(getMotivationalQuote());
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  const todayTasks = tasks.filter(t => {
    if (t.isArchived) return false;
    if (!t.dueDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return t.dueDate === todayStr;
  });

  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const percentToday = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Let's compute overall stats too
  const activeTasks = tasks.filter(t => !t.isArchived);
  const totalActive = activeTasks.length;
  const completedActive = activeTasks.filter(t => t.completed).length;
  const overallPercent = totalActive > 0 ? Math.round((completedActive / totalActive) * 100) : 0;

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Donut chart stroke math
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercent / 100) * circumference;

  return (
    <div className="relative p-6 rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Dynamic background glow based on global Accent Color */}
      <div 
        className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: globalAccentColor }}
      />
      <div 
        className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: globalAccentColor }}
      />

      {/* Date & Time Widget (Feature #29) */}
      <div className="flex-1 flex flex-col gap-2.5 z-10 w-full md:w-auto text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 justify-center md:justify-start">
          <span className="text-4xl md:text-5xl font-mono font-black text-white tracking-widest leading-none animate-pulse-slow" style={{ textShadow: `0 0 20px ${globalAccentColor}60` }}>
            {formattedTime}
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
            {formattedDate}
          </span>
        </div>
        
        <h2 className="text-2xl font-sans font-black text-white tracking-tight leading-none mt-1">
          Spatial Workstation
        </h2>

        {/* Motivational quote (Feature #38, Animation #64 Typewriter-style effect) */}
        <div className="h-10 mt-1 flex items-center justify-center md:justify-start">
          <p className="text-xs md:text-sm text-slate-400 italic flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
            <span className="animate-fade-in inline-block font-sans">
              "{quote}"
            </span>
          </p>
        </div>
      </div>

      {/* Progress & Streak Counters */}
      <div className="flex items-center gap-8 z-10 shrink-0 w-full md:w-auto justify-around md:justify-end">
        
        {/* Streak Flame Counter (Feature #37, Animation #39) */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative group cursor-pointer flex items-center justify-center">
            {/* Pulsing Backlight */}
            <div className="absolute inset-0 bg-orange-600/30 rounded-full blur-lg group-hover:scale-125 transition-all duration-300 animate-pulse pointer-events-none" />
            
            {/* Streak flame circle */}
            <div className="relative w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Flame className="w-7 h-7 text-orange-500 fill-orange-500 animate-[bounce_2s_infinite] drop-shadow-[0_2px_8px_rgba(249,115,22,0.5)]" />
              <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full scale-90 group-hover:scale-105 transition-all">
                {streak}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-1">
            Day Streak
          </span>
        </div>

        {/* Overall Progress Donut Chart (Feature #34, Animation #14, Animation #15) */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex items-center justify-center w-14 h-14 cursor-pointer group">
            {/* Glowing background */}
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
              style={{ backgroundColor: globalAccentColor }}
            />
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-slate-200/10"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke={globalAccentColor}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-white">
                {overallPercent}%
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-1">
            Completed
          </span>
        </div>

        {/* Today's Tasks Summary Stats */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-baseline gap-1 text-slate-700 dark:text-white">
            <span className="text-2xl font-black font-mono text-cyan-400">{completedToday}</span>
            <span className="text-xs text-slate-500 font-mono">/</span>
            <span className="text-sm font-bold text-slate-500 font-mono">{totalToday}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
            Today's Tasks
          </span>
        </div>

      </div>
    </div>
  );
}
