import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  Zap,
  Snowflake,
  Hammer,
  Sparkles,
  Paintbrush,
  Laptop,
  Car,
  Stethoscope,
  GraduationCap,
  Truck,
  ShieldCheck,
  LayoutGrid,
  Tv,
  Globe,
  Home,
  Drill,
  Trees,
  Droplets,
  Smartphone,
  Monitor
} from 'lucide-react';
import { CategoryId } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Wrench,
  Zap,
  Snowflake,
  Hammer,
  Sparkles,
  Paintbrush,
  Laptop,
  Car,
  Stethoscope,
  GraduationCap,
  Truck,
  ShieldCheck,
  Tv,
  Globe,
  Home,
  Drill,
  Trees,
  Droplets,
  Smartphone,
  Monitor,
};

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, setActiveTab, t, language } = useApp();

  return (
    <div id="category-bar-section" className="w-full bg-white/60 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md py-3.5 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {t('categories')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">({categories.length} Specialized Trades)</span>
          </div>
          <button
            id="view-all-categories-directory-btn"
            onClick={() => {
              setSelectedCategory('all');
              setActiveTab('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200/80 dark:border-indigo-800"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'تمام کیٹیگریز ڈائریکٹری دیکھیں' : 'View All Categories'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {/* All Categories Button */}
          <button
            id="cat-btn-all"
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'تمام سروسز' : 'All Trades'}</span>
          </button>

          {/* Dynamic Categories */}
          {categories.map(cat => {
            const IconComponent = iconMap[cat.icon] || Wrench;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id as CategoryId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer group shadow-xs ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform'}`} />
                <span>{cat.name}</span>
                {cat.emergencyAvailable && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60'
                  }`}>
                    ⚡ 15m
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
