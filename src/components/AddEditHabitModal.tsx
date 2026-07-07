import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import { CATEGORIES } from '../utils';
import LucideIcon from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'history'>) => void;
  habitToEdit?: Habit | null;
}

const COLOR_PRESETS = [
  { name: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { name: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { name: 'rose', label: 'Rose', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { name: 'amber', label: 'Amber', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { name: 'violet', label: 'Violet', bg: 'bg-violet-500', ring: 'ring-violet-500' },
  { name: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-500' },
];

const TEMPLATES = [
  { name: 'Drink 2L Water', description: 'Stay hydrated throughout the day', category: 'nutrition', color: 'cyan' },
  { name: 'Read 20 Mins', description: 'Read a book or educational article', category: 'mind', color: 'indigo' },
  { name: 'Daily Workout', description: 'Exercise, cardio or strength training', category: 'fitness', color: 'rose' },
  { name: 'Meditate 10 Mins', description: 'Breathing exercises or silent reflection', category: 'mind', color: 'violet' },
  { name: 'Sleep 8 Hours', description: 'Get a full night of rest', category: 'health', color: 'amber' },
  { name: 'Code Everyday', description: 'Practice programming or learn a tech skill', category: 'work', color: 'emerald' },
];

export default function AddEditHabitModal({ isOpen, onClose, onSave, habitToEdit }: AddEditHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('mind');
  const [color, setColor] = useState('indigo');
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description);
      setCategory(habitToEdit.category);
      setColor(habitToEdit.color);
    } else {
      setName('');
      setDescription('');
      setCategory('mind');
      setColor('indigo');
    }
    setErrors({});
  }, [habitToEdit, isOpen]);

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setName(tpl.name);
    setDescription(tpl.description);
    setCategory(tpl.category);
    setColor(tpl.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Habit name is required' });
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      color,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg bg-zinc-900 rounded-[20px] shadow-2xl overflow-hidden z-10 border border-zinc-800 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-50 flex items-center gap-2">
                <LucideIcon
                  name={habitToEdit ? 'Edit3' : 'PlusCircle'}
                  className="text-emerald-400"
                />
                {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <LucideIcon name="X" size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Form elements */}
              <div className="space-y-1.5">
                <label htmlFor="habit-name" className="text-sm font-medium text-zinc-300">
                  Habit Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="habit-name"
                  type="text"
                  placeholder="e.g. Read books, Drink water"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({});
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 ${
                    errors.name
                      ? 'border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-zinc-800 focus:ring-emerald-500/25 focus:border-emerald-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <LucideIcon name="AlertCircle" size={12} />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="habit-desc" className="text-sm font-medium text-zinc-300">
                  Description / Goal (Optional)
                </label>
                <textarea
                  id="habit-desc"
                  placeholder="e.g. 20 pages a day to complete 12 books this year"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-800 text-sm bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-zinc-300 block">Category</span>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${cat.colorClass}`}>
                          <LucideIcon name={cat.iconName} size={16} />
                        </div>
                        <span className="text-xs font-medium text-zinc-300">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color selector */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-zinc-300 block">Visual Accent Color</span>
                <div className="flex items-center gap-3">
                  {COLOR_PRESETS.map((col) => {
                    const isSelected = color === col.name;
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setColor(col.name)}
                        className={`w-8 h-8 rounded-full ${col.bg} flex items-center justify-center cursor-pointer relative focus:outline-none transition-transform active:scale-95 ${
                          isSelected ? 'ring-4 ring-offset-2 ring-offset-zinc-900 ' + col.ring : ''
                        }`}
                        title={col.label}
                      >
                        {isSelected && (
                          <LucideIcon name="Check" size={14} className="text-zinc-950 font-bold" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Templates - Only show when creating */}
              {!habitToEdit && (
                <div className="space-y-2 pt-3 border-t border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase block">
                    Quick Templates
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col gap-0.5 cursor-pointer"
                      >
                        <span className="text-xs font-medium text-zinc-200">{tpl.name}</span>
                        <span className="text-[10px] text-zinc-500 line-clamp-1">{tpl.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 text-sm font-medium rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-5 py-2 bg-emerald-500 text-zinc-950 font-bold text-sm rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95"
              >
                {habitToEdit ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
