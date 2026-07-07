import { Habit } from '../types';
import { calculateStreaks, getColorClasses } from '../utils';
import LucideIcon from './LucideIcon';
import { motion } from 'motion/react';

interface OverviewStatsProps {
  habits: Habit[];
  todayStr: string;
  last30Days: string[];
}

export default function OverviewStats({ habits, todayStr, last30Days }: OverviewStatsProps) {
  // 1. Total Habits
  const totalHabits = habits.length;

  // 2. Best Streak
  let bestStreak = 0;
  habits.forEach((h) => {
    const { current } = calculateStreaks(h, todayStr);
    if (current > bestStreak) {
      bestStreak = current;
    }
  });

  // 3. Average Completion Rate (last 30 days)
  let totalCompletionsLast30 = 0;
  habits.forEach((h) => {
    last30Days.forEach((date) => {
      if (h.history[date]) {
        totalCompletionsLast30++;
      }
    });
  });
  const maxPossibleCompletions = totalHabits * last30Days.length;
  const avgCompletionRate =
    maxPossibleCompletions > 0 ? Math.round((totalCompletionsLast30 / maxPossibleCompletions) * 100) : 0;

  // 4. Completed Today Count
  const completedToday = habits.filter((h) => h.history[todayStr]).length;

  // 5. Calculate Weekly Completion Trends (last 4 weeks)
  // Week 1: last 7 days, Week 2: days 8-14, Week 3: days 15-21, Week 4: days 22-28
  const weeklyCompletionRates = [0, 0, 0, 0].map((_, index) => {
    const startIdx = index * 7;
    const endIdx = startIdx + 7;
    const weekDays = last30Days.slice(last30Days.length - endIdx, last30Days.length - startIdx || undefined);
    
    if (weekDays.length === 0 || totalHabits === 0) return 0;
    
    let completed = 0;
    habits.forEach((h) => {
      weekDays.forEach((date) => {
        if (h.history[date]) {
          completed++;
        }
      });
    });
    
    return Math.round((completed / (totalHabits * weekDays.length)) * 100);
  });

  // Dynamic advice / words of wisdom
  let supportMessage = "Welcome! Let's build healthy routines. Add your first habit above!";
  let supportIcon = 'Sparkles';
  let supportColor = 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';

  if (totalHabits > 0) {
    if (avgCompletionRate >= 80) {
      supportMessage = "Incredible discipline! You are mastering your daily routines.";
      supportIcon = 'Flame';
      supportColor = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    } else if (avgCompletionRate >= 50) {
      supportMessage = "Consistency is key. You are making steady progress!";
      supportIcon = 'TrendingUp';
      supportColor = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
    } else if (completedToday === totalHabits && totalHabits > 0) {
      supportMessage = "Perfect score today! Keep this energy going.";
      supportIcon = 'Award';
      supportColor = 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20';
    } else {
      supportMessage = "Every step matters. Even small achievements count!";
      supportIcon = 'Target';
      supportColor = 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20';
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Dynamic Advice Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 bg-zinc-900 rounded-[20px] border border-zinc-800 p-5 flex items-center gap-4 relative overflow-hidden"
      >
        <div className={`p-3 rounded-2xl ${supportColor} flex-shrink-0`}>
          <LucideIcon name={supportIcon} size={24} />
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">
            Daily Focus
          </span>
          <p className="text-sm font-bold text-zinc-100 leading-tight">
            {supportMessage}
          </p>
          {totalHabits > 0 && (
            <p className="text-xs text-zinc-400 mt-1">
              You completed <span className="font-semibold text-zinc-200">{completedToday} of {totalHabits}</span> habits today.
            </p>
          )}
        </div>
      </motion.div>

      {/* Main stats */}
      <div className="md:col-span-2 grid grid-cols-3 gap-4">
        {/* Total Habits Card */}
        <div className="bg-zinc-900 rounded-[20px] border border-zinc-800 p-4 text-center flex flex-col justify-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Total Habits
          </span>
          <p className="text-2xl font-extrabold text-zinc-100 font-mono">
            {totalHabits}
          </p>
        </div>

        {/* Best Streak Card - Styled with an emerald glow highlight from Bento specification */}
        <div className="bg-emerald-950/25 border border-emerald-500/20 rounded-[20px] p-4 text-center flex flex-col justify-center shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Best Streak
          </span>
          <div className="flex items-center justify-center gap-1">
            <LucideIcon name="Flame" size={16} className="text-emerald-400 fill-emerald-500/10" />
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">
              {bestStreak}
            </p>
          </div>
        </div>

        {/* Avg Completion Card */}
        <div className="bg-zinc-900 rounded-[20px] border border-zinc-800 p-4 text-center flex flex-col justify-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Avg Rate
          </span>
          <div className="flex items-center justify-center gap-0.5">
            <p className="text-2xl font-extrabold text-zinc-100 font-mono">
              {avgCompletionRate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
