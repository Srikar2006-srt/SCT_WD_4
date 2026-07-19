import React, { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Task, List } from '../types';
import { BarChart3, TrendingUp, CheckSquare, AlertTriangle, Star, Archive } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsDashboardProps {
  tasks: Task[];
  lists: List[];
  globalAccentColor: string;
}

export default function StatsDashboard({ tasks, lists, globalAccentColor }: StatsDashboardProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Active / non-archived tasks
  const activeTasks = tasks.filter(t => !t.isArchived);
  const totalTasksCount = activeTasks.length;
  const completedTasksCount = activeTasks.filter(t => t.completed).length;
  const overdueTasksCount = activeTasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const due = new Date(t.dueDate + 'T23:59:59');
    return due < new Date();
  }).length;
  const starredTasksCount = activeTasks.filter(t => t.isStarred).length;
  const archivedTasksCount = tasks.filter(t => t.isArchived).length;

  // Generate last 7 days statistics (Feature #36)
  const getPastSevenDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      days.push({
        date: dateString,
        label: dayNames[d.getDay()],
        dayNum: d.getDate(),
        count: 0,
      });
    }
    return days;
  };

  const weeklyData = getPastSevenDays();
  tasks.forEach(task => {
    if (task.completed && task.completedAt) {
      const completedDate = task.completedAt.split('T')[0];
      const foundDay = weeklyData.find(d => d.date === completedDate);
      if (foundDay) {
        foundDay.count += 1;
      }
    }
  });

  const maxVal = Math.max(...weeklyData.map(d => d.count), 1);

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Productivity Analytics</h3>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Completed Tasks This Week</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Active Streak</span>
        </div>
      </div>

      {/* Grid of Key Analytics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric Card: Completed */}
        <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-200/5 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-2 right-2 text-slate-400/20 group-hover:text-emerald-500/20 transition-colors">
            <CheckSquare className="w-8 h-8" />
          </div>
          <p className="text-xs text-slate-500 font-mono uppercase">Completed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-2xl font-black font-mono text-emerald-400">{completedTasksCount}</h4>
            <span className="text-[10px] text-slate-500 font-mono">/ {totalTasksCount} active</span>
          </div>
          <div className="w-full bg-slate-200/10 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric Card: Overdue */}
        <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-200/5 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-2 right-2 text-slate-400/20 group-hover:text-red-500/20 transition-colors">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-xs text-slate-500 font-mono uppercase">Overdue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className={`text-2xl font-black font-mono ${overdueTasksCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
              {overdueTasksCount}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">require attention</span>
          </div>
          <div className="w-full bg-slate-200/10 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-red-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${totalTasksCount > 0 ? (overdueTasksCount / totalTasksCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric Card: Starred */}
        <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-200/5 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-2 right-2 text-slate-400/20 group-hover:text-amber-500/20 transition-colors">
            <Star className="w-8 h-8" />
          </div>
          <p className="text-xs text-slate-500 font-mono uppercase">Starred</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-2xl font-black font-mono text-amber-400">{starredTasksCount}</h4>
            <span className="text-[10px] text-slate-500 font-mono">critical tasks</span>
          </div>
          <div className="w-full bg-slate-200/10 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${totalTasksCount > 0 ? (starredTasksCount / totalTasksCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric Card: Archived */}
        <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-200/5 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-2 right-2 text-slate-400/20 group-hover:text-cyan-400/20 transition-colors">
            <Archive className="w-8 h-8" />
          </div>
          <p className="text-xs text-slate-500 font-mono uppercase">Archived</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-2xl font-black font-mono text-cyan-400">{archivedTasksCount}</h4>
            <span className="text-[10px] text-slate-500 font-mono">cleared from list</span>
          </div>
          <div className="w-full bg-slate-200/10 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full w-full opacity-40" />
          </div>
        </div>

      </div>

      {/* SVG Interactive Bar Chart (Feature #36, Animation #38) */}
      <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 px-2 border-t border-slate-200/5 dark:border-white/5">
        {weeklyData.map((day, idx) => {
          const heightPercent = (day.count / maxVal) * 100;
          const isHovered = hoveredBar === idx;
          return (
            <div 
              key={day.date} 
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip on top of bar */}
              <div className={`relative h-6 flex items-center justify-center transition-all duration-200 ${isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 scale-90 translate-y-1 pointer-events-none'}`}>
                <span className="absolute bottom-1 bg-slate-800 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-xl border border-white/10 whitespace-nowrap">
                  {day.count} {day.count === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Dynamic Bar Cylinder */}
              <div className="w-full bg-slate-800/10 dark:bg-slate-800/30 rounded-t-lg h-36 flex items-end overflow-hidden relative border border-slate-200/5 dark:border-white/5">
                <motion.div 
                  className="w-full rounded-t-md relative"
                  style={{ 
                    height: `${heightPercent}%`,
                    backgroundColor: globalAccentColor,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                >
                  {/* Subtle bar glow overlay */}
                  <div className="absolute inset-0 bg-white/25 dark:bg-white/10 mix-blend-overlay" />
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 rounded-t-md" />
                </motion.div>
              </div>

              {/* Date Labels */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {day.label}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {day.dayNum}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
