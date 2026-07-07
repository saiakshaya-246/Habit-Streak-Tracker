export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., 'fitness' | 'mind' | 'work' | 'nutrition' | 'health' | 'custom'
  color: string; // e.g., 'emerald' | 'indigo' | 'rose' | 'amber' | 'violet' | 'cyan'
  createdAt: string; // YYYY-MM-DD
  history: Record<string, boolean>; // map of YYYY-MM-DD -> boolean (true if completed)
}

export interface HabitCategory {
  id: string;
  name: string;
  iconName: string; // Lucide icon name
  colorClass: string;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalCount: number;
  percent: number;
}
