import { useState } from 'react';
import { Habit } from '../types';
import { formatDateReadable, getWeekdayLabel, getColorClasses } from '../utils';
import LucideIcon from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

interface Calendar30DayProps {
  habits: Habit[];
  last30Days: string[];
  onToggleDay: (habitId: string, dateStr: string) => void;
}

export default function Calendar30Day({ habits, last30Days, onToggleDay }: Calendar30DayProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calculate stats for each of the last 30 days
  const dailySummaries = last30Days.map((dateStr) => {
    const totalCount = habits.length;
    const completedHabits = habits.filter((habit) => habit.history[dateStr]);
    const completedCount = completedHabits.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return {
      date: dateStr,
      completedCount,
      totalCount,
      percent,
      completedHabits,
    };
  });

  const selectedSummary = dailySummaries.find((s) => s.date === selectedDate);

  // Perfect days count
  const perfectDaysCount = dailySummaries.filter(
    (s) => s.totalCount > 0 && s.completedCount === s.totalCount
  ).length;

  return (
    <div className="bg-zinc-900 rounded-[20px] border border-zinc-800 p-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-50 flex items-center gap-2">
            <LucideIcon name="CalendarDays" className="text-emerald-400" />
            30-Day Completion Calendar
          </h2>
          <p className="text-xs text-zinc-400">
            Click on any day to review habit checklist and log past progress
          </p>
        </div>

        {/* Perfect days badge */}
        <div className="flex items-center gap-2.5 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
          <LucideIcon name="Award" className="text-emerald-400" size={18} />
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Perfect Days</p>
            <p className="text-sm font-extrabold text-emerald-300 font-mono">
              {perfectDaysCount} <span className="text-xs font-normal text-zinc-500">of 30</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 30 days */}
      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3">
        {dailySummaries.map((summary) => {
          const isSelected = selectedDate === summary.date;
          
          // Determine status color based on percentage
          let bgColor = 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800/80';
          let textColor = 'text-zinc-400';
          let ringColor = 'ring-zinc-700';

          if (summary.totalCount > 0) {
            if (summary.percent === 100) {
              bgColor = 'bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30';
              textColor = 'text-emerald-400';
              ringColor = 'ring-emerald-500/50';
            } else if (summary.percent >= 50) {
              bgColor = 'bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/30';
              textColor = 'text-indigo-400';
              ringColor = 'ring-indigo-500/50';
            } else if (summary.percent > 0) {
              bgColor = 'bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30';
              textColor = 'text-amber-400';
              ringColor = 'ring-amber-500/50';
            }
          }

          return (
            <motion.button
              key={summary.date}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDate(summary.date)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-between min-h-[90px] cursor-pointer transition-all relative ${bgColor} ${
                isSelected ? 'ring-2 ring-emerald-400 border-transparent shadow-sm' : ''
              }`}
            >
              {/* Day info */}
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                  {getWeekdayLabel(summary.date)}
                </span>
                <span className="text-sm font-extrabold block leading-tight font-mono text-zinc-100">
                  {summary.date.split('-')[2]}
                </span>
              </div>

              {/* Progress visualizer: dynamic dots or percent */}
              <div className="mt-2 w-full flex flex-col items-center gap-1.5">
                {summary.totalCount > 0 ? (
                  <>
                    {/* Tiny dots representing completed habits */}
                    <div className="flex flex-wrap justify-center gap-1 max-w-full">
                      {habits.map((h) => {
                        const isDone = summary.completedHabits.some((ch) => ch.id === h.id);
                        const c = getColorClasses(h.color);
                        return (
                          <div
                            key={h.id}
                            className={`w-1.5 h-1.5 rounded-full ${isDone ? c.bg : 'bg-zinc-800'}`}
                            title={`${h.name}: ${isDone ? 'Done' : 'Missed'}`}
                          />
                        );
                      })}
                    </div>
                    {/* Completion text */}
                    <span className={`text-[9px] font-bold font-mono ${textColor}`}>
                      {summary.completedCount}/{summary.totalCount}
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] text-zinc-600 italic font-mono">-</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Popover / Overlay details when a date is selected */}
      <AnimatePresence>
        {selectedDate && selectedSummary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-5 bg-zinc-950 border border-zinc-800/80 rounded-[20px] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                  <LucideIcon name="CheckSquare" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Log for {formatDateReadable(selectedDate)}
                  </h3>
                  <p className="text-[10px] text-zinc-500 capitalize">
                    {getWeekdayLabel(selectedDate)} day
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Completion rate on selected day */}
                {selectedSummary.totalCount > 0 && (
                  <span className="text-xs font-semibold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                    {selectedSummary.percent}% Completed
                  </span>
                )}
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <LucideIcon name="X" size={14} /> Close
                </button>
              </div>
            </div>

            {habits.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4 italic">
                No habits defined. Create a habit to start tracking!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {habits.map((habit) => {
                  const isCompleted = !!habit.history[selectedDate];
                  const c = getColorClasses(habit.color);
                  
                  return (
                    <motion.div
                      key={habit.id}
                      whileHover={{ y: -1 }}
                      onClick={() => onToggleDay(habit.id, selectedDate)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isCompleted
                          ? 'bg-zinc-900 border-emerald-500/20 shadow-xs'
                          : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Status Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                              : 'border-zinc-700'
                          }`}
                        >
                          {isCompleted && <LucideIcon name="Check" size={14} className="stroke-[3]" />}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold text-zinc-200 ${isCompleted ? 'line-through text-zinc-500' : ''}`}>
                            {habit.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 capitalize">{habit.category}</p>
                        </div>
                      </div>

                      {/* Accent Dot */}
                      <div className={`w-2 h-2 rounded-full ${c.bg}`} />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
