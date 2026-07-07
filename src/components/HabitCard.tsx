import React from 'react';
import { Habit } from '../types';
import { calculateStreaks, getColorClasses, CATEGORIES, formatDateReadable } from '../utils';
import LucideIcon from './LucideIcon';
import { motion } from 'motion/react';

interface HabitCardProps {
  key?: string;
  habit: Habit;
  todayStr: string;
  last30Days: string[];
  onToggleDay: (habitId: string, dateStr: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({
  habit,
  todayStr,
  last30Days,
  onToggleDay,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const { current, longest } = calculateStreaks(habit, todayStr);
  const colors = getColorClasses(habit.color);

  // Find category icon
  const categoryObj = CATEGORIES.find((cat) => cat.id === habit.category) || CATEGORIES[CATEGORIES.length - 1];

  // Calculate completion rate in the last 30 days
  const completedInLast30 = last30Days.filter((date) => habit.history[date]).length;
  const completionRate = Math.round((completedInLast30 / last30Days.length) * 100);

  const isCompletedToday = !!habit.history[todayStr];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-5 flex flex-col justify-between shadow-sm hover:border-zinc-700/60 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Visual top border for styling */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bg}`} />

      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${categoryObj.colorClass} flex-shrink-0`}>
              <LucideIcon name={categoryObj.iconName} size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100 line-clamp-1 group-hover:text-zinc-50">
                {habit.name}
              </h3>
              <p className="text-xs text-zinc-400 capitalize">{categoryObj.name}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            <button
              onClick={() => onEdit(habit)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Edit Habit"
            >
              <LucideIcon name="Edit2" size={14} />
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Delete Habit"
            >
              <LucideIcon name="Trash2" size={14} />
            </button>
          </div>
        </div>

        {habit.description && (
          <p className="text-xs text-zinc-400 mb-4 line-clamp-2 h-8 min-h-[2rem]">
            {habit.description}
          </p>
        )}
        {!habit.description && <div className="h-8 min-h-[2rem]" />}

        {/* Streaks and Completion Rates */}
        <div className="grid grid-cols-3 gap-3 mb-4 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/50 text-center">
          <div>
            <div className="flex justify-center items-center gap-0.5 text-zinc-500 mb-0.5">
              <LucideIcon
                name="Flame"
                size={14}
                className={current > 0 ? 'text-amber-500 fill-amber-500/10' : ''}
              />
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Streak</span>
            </div>
            <p className="text-sm font-bold text-zinc-100 font-mono">
              {current} <span className="text-xs font-normal text-zinc-500">days</span>
            </p>
          </div>

          <div>
            <div className="flex justify-center items-center gap-0.5 text-zinc-500 mb-0.5">
              <LucideIcon name="Trophy" size={14} className="text-amber-400" />
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Best</span>
            </div>
            <p className="text-sm font-bold text-zinc-100 font-mono">
              {longest} <span className="text-xs font-normal text-zinc-500">days</span>
            </p>
          </div>

          <div>
            <div className="flex justify-center items-center gap-0.5 text-zinc-500 mb-0.5">
              <LucideIcon name="Percent" size={12} className="text-emerald-400" />
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Rate</span>
            </div>
            <p className="text-sm font-bold text-zinc-100 font-mono">{completionRate}%</p>
          </div>
        </div>

        {/* 30-Day mini-grid */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Last 30 Days</span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {completedInLast30}/30 completed
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1.5 justify-between">
            {last30Days.map((dateStr) => {
              const isCompleted = !!habit.history[dateStr];
              const isToday = dateStr === todayStr;
              
              // Get day number of month for label
              const dayNum = dateStr.split('-')[2];

              return (
                <button
                  key={dateStr}
                  onClick={() => onToggleDay(habit.id, dateStr)}
                  className={`aspect-square rounded-md text-[9px] font-semibold flex items-center justify-center transition-all cursor-pointer relative group/day focus:outline-none focus:ring-1 ${colors.ring} ${
                    isCompleted
                      ? colors.bg + ' text-zinc-950 shadow-sm ' + colors.glow
                      : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  } ${isToday ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-900' : ''}`}
                >
                  <span>{dayNum}</span>

                  {/* Tooltip */}
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/day:block z-10 bg-zinc-950 text-zinc-200 text-[10px] py-1 px-1.5 rounded-lg border border-zinc-800 shadow-lg whitespace-nowrap">
                    {formatDateReadable(dateStr)}: {isCompleted ? 'Completed' : 'Not completed'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Action - Today Check-In */}
      <div className="pt-2 border-t border-zinc-800/80">
        <button
          onClick={() => onToggleDay(habit.id, todayStr)}
          className={`w-full py-2 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 ${
            isCompletedToday
              ? 'bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/30 text-zinc-300 hover:text-zinc-100'
              : `${colors.bg} text-zinc-950 shadow-sm hover:shadow ${colors.glow}`
          }`}
        >
          <LucideIcon name={isCompletedToday ? 'CheckCircle2' : 'Circle'} size={14} />
          {isCompletedToday ? 'Completed Today!' : 'Mark Completed Today'}
        </button>
      </div>
    </motion.div>
  );
}
