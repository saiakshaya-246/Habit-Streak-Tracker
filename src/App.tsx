import { useState, useEffect, useMemo } from 'react';
import { Habit } from './types';
import { getLocalDateString, getLastNDays, CATEGORIES } from './utils';
import LucideIcon from './components/LucideIcon';
import HabitCard from './components/HabitCard';
import Calendar30Day from './components/Calendar30Day';
import OverviewStats from './components/OverviewStats';
import AddEditHabitModal from './components/AddEditHabitModal';
import { motion, AnimatePresence } from 'motion/react';

// Key for LocalStorage
const LOCAL_STORAGE_KEY = 'habit_tracker_habits';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Compute date states
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const last30Days = useMemo(() => getLastNDays(30), []);

  // Initialize/Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setHabits(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored habits', e);
        initializeDefaultHabits();
      }
    } else {
      initializeDefaultHabits();
    }
  }, []);

  // Sync with LocalStorage
  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHabits));
  };

  // Pre-populate realistic mock data for fresh onboarding
  const initializeDefaultHabits = () => {
    const dates = getLastNDays(30);
    const dayToday = dates[dates.length - 1];
    const dayYesterday = dates[dates.length - 2];
    const day2Ago = dates[dates.length - 3];
    const day3Ago = dates[dates.length - 4];
    const day4Ago = dates[dates.length - 5];
    const day5Ago = dates[dates.length - 6];
    const day6Ago = dates[dates.length - 7];
    const day7Ago = dates[dates.length - 8];
    const day8Ago = dates[dates.length - 9];

    const defaultHabits: Habit[] = [
      {
        id: '1',
        name: 'Morning Meditation',
        description: '10 minutes of silent deep breathing in the morning to start the day with focus.',
        category: 'mind',
        color: 'indigo',
        createdAt: dates[0],
        history: {
          [dayToday]: true,
          [dayYesterday]: true,
          [day2Ago]: true,
          [day3Ago]: true,
          [day4Ago]: true,
          [day5Ago]: true,
          [day6Ago]: true,
          [day7Ago]: true,
          // random past days
          [dates[5]]: true,
          [dates[10]]: true,
          [dates[12]]: true,
          [dates[15]]: true,
          [dates[18]]: true,
          [dates[20]]: true,
        },
      },
      {
        id: '2',
        name: 'Drink 3L Water',
        description: 'Keep a water bottle on the desk and refill it regularly to maintain focus and energy levels.',
        category: 'nutrition',
        color: 'cyan',
        createdAt: dates[0],
        history: {
          [dayToday]: false,
          [dayYesterday]: true,
          [day2Ago]: true,
          [day3Ago]: true,
          [day4Ago]: true,
          [day5Ago]: false,
          [day6Ago]: true,
          [day7Ago]: true,
          [day8Ago]: true,
          // past days
          [dates[2]]: true,
          [dates[4]]: true,
          [dates[6]]: true,
          [dates[8]]: true,
          [dates[11]]: true,
          [dates[14]]: true,
          [dates[17]]: true,
          [dates[21]]: true,
        },
      },
      {
        id: '3',
        name: 'Gym Workout',
        description: '30-45 minutes of heavy resistance lifting or high intensity interval cardio.',
        category: 'fitness',
        color: 'rose',
        createdAt: dates[0],
        history: {
          [dayToday]: true,
          [dayYesterday]: false,
          [day2Ago]: true,
          [day3Ago]: false,
          [day4Ago]: true,
          [day5Ago]: false,
          // past days
          [dates[1]]: true,
          [dates[4]]: true,
          [dates[7]]: true,
          [dates[10]]: true,
          [dates[13]]: true,
          [dates[16]]: true,
          [dates[19]]: true,
          [dates[22]]: true,
        },
      },
    ];
    saveHabits(defaultHabits);
  };

  // Toggle day completion status
  const handleToggleDay = (habitId: string, dateStr: string) => {
    const updated = habits.map((habit) => {
      if (habit.id === habitId) {
        const isCompleted = !!habit.history[dateStr];
        return {
          ...habit,
          history: {
            ...habit.history,
            [dateStr]: !isCompleted,
          },
        };
      }
      return habit;
    });
    saveHabits(updated);
  };

  // Handle adding or editing a habit
  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'history'>) => {
    if (habitToEdit) {
      // Edit existing
      const updated = habits.map((h) =>
        h.id === habitToEdit.id ? { ...h, ...habitData } : h
      );
      saveHabits(updated);
      setHabitToEdit(null);
    } else {
      // Add new
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitData.name,
        description: habitData.description,
        category: habitData.category,
        color: habitData.color,
        createdAt: todayStr,
        history: {},
      };
      saveHabits([newHabit, ...habits]);
    }
  };

  // Delete an existing habit
  const handleDeleteHabit = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit? All history will be lost.')) {
      const updated = habits.filter((h) => h.id !== habitId);
      saveHabits(updated);
    }
  };

  // Initiate Edit mode
  const handleStartEdit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
  };

  // Filter habits based on category, search string, and status
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      // 1. Search Query filter
      const matchesSearch =
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category filter
      const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;

      // 3. Today's completion status filter
      const isDoneToday = !!habit.history[todayStr];
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && isDoneToday) ||
        (statusFilter === 'pending' && !isDoneToday);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [habits, searchQuery, selectedCategory, statusFilter, todayStr]);

  // Quick action: Complete all habits for today
  const handleCompleteAllToday = () => {
    const updated = habits.map((h) => ({
      ...h,
      history: {
        ...h.history,
        [todayStr]: true,
      },
    }));
    saveHabits(updated);
  };

  // Quick action: Clear database / Reset mock
  const handleResetApp = () => {
    if (
      window.confirm(
        'This will reset the database to the default sample habits and clear all custom progress. Continue?'
      )
    ) {
      initializeDefaultHabits();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
      {/* Dynamic, visually crafted Navbar */}
      <header className="bg-zinc-900 border-b border-zinc-800/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <LucideIcon name="CheckSquare" size={20} className="text-zinc-950 font-bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-50 tracking-tight">Aura Habit Tracker</h1>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Precision Bento Routine Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetApp}
              className="px-3 py-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset Application Data"
            >
              <LucideIcon name="RotateCcw" size={14} />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
            <button
              onClick={() => {
                setHabitToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <LucideIcon name="Plus" size={14} />
              Add Habit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Top-Level Summary and Insight cards */}
        <OverviewStats habits={habits} todayStr={todayStr} last30Days={last30Days} />

        {/* Global 30-Day Completion Map / Grid Calendar */}
        <Calendar30Day habits={habits} last30Days={last30Days} onToggleDay={handleToggleDay} />

        {/* Control Center & Search / Filters Bar */}
        <div className="bg-zinc-900 rounded-[20px] border border-zinc-800 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <LucideIcon
                name="Search"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search habits by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-zinc-950 text-zinc-100 transition-all placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <LucideIcon name="X" size={14} />
                </button>
              )}
            </div>

            {/* Completion Status Filter tabs */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 self-start md:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-zinc-800 text-zinc-50 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Habits
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-zinc-800 text-zinc-50 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Completed Today
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-zinc-800 text-zinc-50 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pending Today
              </button>
            </div>
          </div>

          {/* Category Quick Filter badges */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-1">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold shadow-sm'
                  : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold shadow-sm'
                      : 'bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <LucideIcon name={cat.iconName} size={12} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Habits List Grid Section */}
        <div>
          <div className="flex items-center justify-between mb-4.5">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <LucideIcon name="Target" size={18} className="text-emerald-400" />
              Track Habits ({filteredHabits.length})
            </h2>
            {habits.length > 0 && habits.some((h) => !h.history[todayStr]) && (
              <button
                onClick={handleCompleteAllToday}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition-colors"
              >
                <LucideIcon name="CheckSquare" size={14} />
                Check in all pending today
              </button>
            )}
          </div>

          {filteredHabits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-900 rounded-[20px] border border-dashed border-zinc-800 p-12 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="p-4 bg-zinc-950 rounded-full text-zinc-500">
                <LucideIcon name="Info" size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-200">No habits found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mt-1">
                  {habits.length === 0
                    ? "Welcome to Aura Habit Tracker! Add some habits to kickstart your tracking and visual calendar progress."
                    : "No habits match your active search filters or category selections. Try adjusting your parameters!"}
                </p>
              </div>
              <button
                onClick={() => {
                  setHabitToEdit(null);
                  setIsModalOpen(true);
                }}
                className="mt-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              >
                <LucideIcon name="Plus" size={14} />
                Create Custom Habit
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    todayStr={todayStr}
                    last30Days={last30Days}
                    onToggleDay={handleToggleDay}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteHabit}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Footer information */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-6 mt-12 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Aura Habit Tracker. Powered by Local Storage and React.</p>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
            <LucideIcon name="Clock" size={12} className="text-emerald-400" />
            <span>UTC Local Storage Database is Live</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Habit Modal Overlay */}
      <AddEditHabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setHabitToEdit(null);
        }}
        onSave={handleSaveHabit}
        habitToEdit={habitToEdit}
      />
    </div>
  );
}
