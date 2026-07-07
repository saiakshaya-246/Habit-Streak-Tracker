import { Habit } from './types';

// Helper to get formatted YYYY-MM-DD local date string
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generates an array of the last N dates in YYYY-MM-DD format, ending with today
export function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(getLocalDateString(d));
  }
  return dates;
}

// Convert date string YYYY-MM-DD to a readable format (e.g., "Jul 7")
export function formatDateReadable(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Convert date string YYYY-MM-DD to weekday (e.g., "Tue")
export function getWeekdayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Calculate streaks (current and longest) for a single habit
export function calculateStreaks(habit: Habit, todayStr: string): { current: number; longest: number } {
  const history = habit.history;
  
  // Get all completed dates, sorted chronologically
  const completedDates = Object.keys(history)
    .filter((date) => history[date])
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (completedDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Calculate Longest Streak
  let longest = 0;
  let currentRun = 0;
  let previousDate: Date | null = null;

  for (const dateStr of completedDates) {
    const currentDate = new Date(dateStr);
    
    if (previousDate === null) {
      currentRun = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        if (currentRun > longest) {
          longest = currentRun;
        }
        currentRun = 1;
      }
    }
    previousDate = currentDate;
  }
  if (currentRun > longest) {
    longest = currentRun;
  }

  // Calculate Current Streak
  // A streak is current if completed today, or completed yesterday (and user still has today to complete it)
  let current = 0;
  const today = new Date(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const hasCompletedToday = !!history[todayStr];
  const hasCompletedYesterday = !!history[yesterdayStr];

  if (hasCompletedToday || hasCompletedYesterday) {
    let checkDate = hasCompletedToday ? today : yesterday;
    let checkStr = getLocalDateString(checkDate);

    while (history[checkStr]) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getLocalDateString(checkDate);
    }
  }

  return { current, longest: Math.max(longest, current) };
}

// Color map helper for Tailwind CSS
export function getColorClasses(colorName: string): {
  bg: string;
  text: string;
  border: string;
  ring: string;
  fill: string;
  glow: string;
  lightBg: string;
} {
  switch (colorName) {
    case 'emerald':
      return {
        bg: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        ring: 'focus:ring-emerald-500/50',
        fill: 'bg-emerald-500/10 text-emerald-300',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
        lightBg: 'bg-emerald-950/20 border-emerald-900/30'
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-500 hover:bg-indigo-400 text-zinc-950',
        text: 'text-indigo-400',
        border: 'border-indigo-500/20',
        ring: 'focus:ring-indigo-500/50',
        fill: 'bg-indigo-500/10 text-indigo-300',
        glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
        lightBg: 'bg-indigo-950/20 border-indigo-900/30'
      };
    case 'rose':
      return {
        bg: 'bg-rose-500 hover:bg-rose-400 text-zinc-950',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        ring: 'focus:ring-rose-500/50',
        fill: 'bg-rose-500/10 text-rose-300',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
        lightBg: 'bg-rose-950/20 border-rose-900/30'
      };
    case 'amber':
      return {
        bg: 'bg-amber-500 hover:bg-amber-400 text-zinc-950',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        ring: 'focus:ring-amber-500/50',
        fill: 'bg-amber-500/10 text-amber-300',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
        lightBg: 'bg-amber-950/20 border-amber-900/30'
      };
    case 'violet':
      return {
        bg: 'bg-violet-500 hover:bg-violet-400 text-zinc-950',
        text: 'text-violet-400',
        border: 'border-violet-500/20',
        ring: 'focus:ring-violet-500/50',
        fill: 'bg-violet-500/10 text-violet-300',
        glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
        lightBg: 'bg-violet-950/20 border-violet-900/30'
      };
    case 'cyan':
      return {
        bg: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950',
        text: 'text-cyan-400',
        border: 'border-cyan-500/20',
        ring: 'focus:ring-cyan-500/50',
        fill: 'bg-cyan-500/10 text-cyan-300',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
        lightBg: 'bg-cyan-950/20 border-cyan-900/30'
      };
    default:
      return {
        bg: 'bg-zinc-500 hover:bg-zinc-400 text-zinc-950',
        text: 'text-zinc-400',
        border: 'border-zinc-500/20',
        ring: 'focus:ring-zinc-500/50',
        fill: 'bg-zinc-500/10 text-zinc-300',
        glow: 'shadow-[0_0_15px_rgba(113,113,122,0.15)]',
        lightBg: 'bg-zinc-900/40 border-zinc-800'
      };
  }
}

export const CATEGORIES = [
  { id: 'fitness', name: 'Fitness', iconName: 'Dumbbell', colorClass: 'text-rose-400 bg-rose-500/10' },
  { id: 'mind', name: 'Mindset', iconName: 'Brain', colorClass: 'text-indigo-400 bg-indigo-500/10' },
  { id: 'work', name: 'Productivity', iconName: 'Briefcase', colorClass: 'text-amber-400 bg-amber-500/10' },
  { id: 'nutrition', name: 'Nutrition', iconName: 'Apple', colorClass: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'health', name: 'Health', iconName: 'Heart', colorClass: 'text-cyan-400 bg-cyan-500/10' },
  { id: 'custom', name: 'Custom', iconName: 'Sparkles', colorClass: 'text-violet-400 bg-violet-500/10' },
];
