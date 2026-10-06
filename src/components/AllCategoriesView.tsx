import React, { useState, useMemo } from 'react';
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
  Tv,
  Globe,
  Home,
  Drill,
  Trees,
  Droplets,
  Smartphone,
  Monitor,
  Search,
  Star,
  Users,
  MapPin,
  ArrowRight,
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkle
} from 'lucide-react';
import { CategoryId, ServiceCategory } from '../types';

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

interface AllCategoriesViewProps {
  onSelectCategory: (categoryId: CategoryId) => void;
}

export const AllCategoriesView: React.FC<AllCategoriesViewProps> = ({ onSelectCategory }) => {
  const { categories, providers, language, t } = useApp();
  const [catSearch, setCatSearch] = useState('');
  const [filterTag, setFilterTag] = useState<'all' | 'emergency' | 'popular'>('all');

  // Filter categories based on search input and filter tags
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      // Search filter
      if (catSearch.trim()) {
        const query = catSearch.toLowerCase().trim();
        const matchName = cat.name.toLowerCase().includes(query);
        const matchNameUrdu = (cat.nameUrdu || '').toLowerCase().includes(query);
        const matchDesc = (cat.description || '').toLowerCase().includes(query);
        const matchTags = (cat.popularTags || []).some(t => t.toLowerCase().includes(query));
        if (!matchName && !matchNameUrdu && !matchDesc && !matchTags) {
          return false;
        }
      }

      // Filter tag
      if (filterTag === 'emergency' && !cat.emergencyAvailable) return false;
      if (filterTag === 'popular' && (cat.activeProvidersCount || 0) < 20) return false;

      return true;
    });
  }, [categories, catSearch, filterTag]);

  // Helper to calculate stats per category
  const getCategoryStats = (catId: string) => {
    const catProviders = providers.filter(p => p.categoryId === catId && !p.isSuspended);
    const count = catProviders.length || categories.find(c => c.id === catId)?.activeProvidersCount || 15;
    const avgRating = catProviders.length
      ? (catProviders.reduce((acc, p) => acc + p.rating, 0) / catProviders.length).toFixed(1)
      : '4.9';
    const nearestKm = catProviders.length
      ? Math.min(...catProviders.map(p => p.distanceKm)).toFixed(1)
      : '0.8';

    return {
      providerCount: count,
      avgRating,
      nearestKm,
      isEmergency: categories.find(c => c.id === catId)?.emergencyAvailable || false
    };
  };

  return (
    <div id="all-services-directory-section" className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header with Search and Title */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{categories.length} Specialized Professional Trades</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {language === 'ur' ? 'تمام دستیاب ہوم سروسز ڈائریکٹری' : 'Explore All Services & Trades'}
          </h1>
          <p className="text-sm text-indigo-100/80 leading-relaxed">
            {language === 'ur'
              ? 'اپنے مطلوبہ کام کے لیے بہترین اور تصدیق شدہ کاریگر فوری بک کریں۔ 15 منٹ ایمرجنسی سروس کے ساتھ۔'
              : 'Browse all background-checked, licensed technicians, tutors, cleaners, and automotive specialists available in your area.'}
          </p>

          {/* Search bar inside header */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-all-categories-input"
                type="text"
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                placeholder={language === 'ur' ? 'سروس یا کام تلاش کریں (مثلاً پلمبر، اے سی، الیکٹریشن)...' : 'Search categories (e.g. Plumbing, AC Repair, Electrician, Car Wash)...'}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm font-medium shadow-md border-0 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              {catSearch && (
                <button
                  onClick={() => setCatSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Tag Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15 text-xs">
              <button
                onClick={() => setFilterTag('all')}
                className={`px-3 py-2 rounded-xl font-semibold transition ${
                  filterTag === 'all'
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                All ({categories.length})
              </button>
              <button
                onClick={() => setFilterTag('emergency')}
                className={`px-3 py-2 rounded-xl font-semibold transition flex items-center gap-1 ${
                  filterTag === 'emergency'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>15m Emergency</span>
              </button>
              <button
                onClick={() => setFilterTag('popular')}
                className={`px-3 py-2 rounded-xl font-semibold transition ${
                  filterTag === 'popular'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-indigo-100 hover:text-white'
                }`}
              >
                High Demand
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of All Categories */}
      {filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Search className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No categories found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No service trade matches "{catSearch}". Try searching for plumbing, AC, cleaning, or tutor.
          </p>
          <button
            onClick={() => {
              setCatSearch('');
              setFilterTag('all');
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredCategories.map(cat => {
            const IconComponent = iconMap[cat.icon] || Wrench;
            const stats = getCategoryStats(cat.id);

            return (
              <div
                key={cat.id}
                id={`category-card-${cat.id}`}
                onClick={() => onSelectCategory(cat.id as CategoryId)}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Top Row: Icon + Emergency Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {stats.isEmergency && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        <span>15m SLA</span>
                      </span>
                    )}
                  </div>

                  {/* Title and Urdu translation */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                      <span>{cat.name}</span>
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                      {cat.nameUrdu}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Popular Tags */}
                  {cat.popularTags && cat.popularTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cat.popularTags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom stats & Find button */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{stats.providerCount}</span> Pros
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{stats.avgRating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{stats.nearestKm} km</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 group-hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 group-hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs"
                  >
                    <span>Find {cat.name} Pros</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
