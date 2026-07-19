import React, { useState } from 'react';
import { ArrowRight, Sparkles, Key, LayoutGrid, CheckSquare, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  onComplete: () => void;
  globalAccentColor: string;
}

export default function Onboarding({ onComplete, globalAccentColor }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Control Room To-Do',
      description: 'Your premium productivity dashboard. Organise, track, and complete your tasks with responsive micro-interactions, metrics, and keyboard shortcuts.',
      icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
      tagline: 'Crafted for creative professionals.'
    },
    {
      title: 'Multimodal Board Views',
      description: 'Switch instantly between standard list layout, columns-based Kanban boards, or calendar schedules depending on your work state.',
      icon: <LayoutGrid className="w-8 h-8 text-indigo-400" />,
      tagline: 'Custom emoji icons per board.'
    },
    {
      title: 'Interactive Analytics & Metrics',
      description: 'Keep tabs on your completion percentages, monitor overdue tasks, and grow your productivity streak with our built-in flame meter.',
      icon: <CheckSquare className="w-8 h-8 text-emerald-400" />,
      tagline: 'Confetti celebration on 100% list completion.'
    },
    {
      title: 'Pro Keyboard Shortcuts',
      description: 'Lightning-fast task creation: use Enter to add, Escape to cancel modal, and Delete key to wipe selected item instantly.',
      icon: <Key className="w-8 h-8 text-amber-400" />,
      tagline: 'Whip through your tasks in seconds.'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay with strong blur (Animation #19, #62) */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

      {/* Onboarding Dialog Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#12111d] border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden flex flex-col items-center text-center">
        
        {/* Dynamic background lighting */}
        <div 
          className="absolute -top-24 w-44 h-44 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ backgroundColor: globalAccentColor }}
        />

        {/* Dynamic icon animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="p-4 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 mb-5 relative flex items-center justify-center"
          >
            {current.icon}
          </motion.div>
        </AnimatePresence>

        {/* Step indicator bubbles */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6' : 'w-2 bg-slate-300 dark:bg-white/10'
              }`}
              style={{ backgroundColor: idx === currentStep ? globalAccentColor : undefined }}
            />
          ))}
        </div>

        {/* Title & Description with transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="space-y-2.5 mb-8"
          >
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
              {current.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              {current.description}
            </p>
            <span className="inline-block text-xs font-mono font-bold uppercase text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-white/5">
              {current.tagline}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Primary Action Trigger (Animation #1, #2) */}
        <button
          onClick={handleNext}
          style={{ backgroundColor: globalAccentColor }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold hover:brightness-110 active:scale-95 hover:scale-[1.01] transition-all shadow-lg cursor-pointer"
        >
          <span>{currentStep === steps.length - 1 ? "Get Started" : "Continue"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
