import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  Search,
  SlidersHorizontal,
  AlertCircle,
  X,
  Wrench,
  Zap,
  Snowflake,
  Hammer,
  Paintbrush,
  Sparkles,
  Laptop,
  Car,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Flame,
  ArrowRight,
  ArrowLeft,
  Home as HomeIcon,
  Stethoscope,
  GraduationCap,
  Truck,
  Tv,
  Globe,
  Home,
  Drill,
  Trees,
  Droplets,
  Smartphone,
  Monitor,
  LayoutGrid
} from 'lucide-react';
import { ProviderCard } from './ProviderCard';
import { AllCategoriesView } from './AllCategoriesView';
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

export const ServicesDirectoryView: React.FC = () => {
  const {
    providers,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filterEmergencyOnly,
    setFilterEmergencyOnly,
    filterVerifiedOnly,
    setFilterVerifiedOnly,
    filterFavoritesOnly,
    setFilterFavoritesOnly,
    sortBy,
    setSortBy,
    setActiveTab,
    language,
    t
  } = useApp();

  const [onlineOnly, setOnlineOnly] = useState(false);

  // Compute displayed providers matching filters
  const displayedProviders = providers.filter(p => {
    if (p.isSuspended) return false;
    if (filterVerifiedOnly && !p.isVerified) return false;
    if (filterEmergencyOnly && !p.emergencyReady) return false;
    if (onlineOnly && !p.isOnline) return false;

    if (selectedCategory !== 'all') {
      if (p.categoryId !== selectedCategory) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSpecialty = (p.specialties || []).some(s => s.toLowerCase().includes(q));
      const matchCity = (p.serviceCity || '').toLowerCase().includes(q);
      const matchServices = (p.offeredServices || []).some(
        s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
      if (!matchName && !matchTitle && !matchSpecialty && !matchCity && !matchServices) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'price_low' || (sortBy as any) === 'price') return a.hourlyRate - b.hourlyRate;
    if (sortBy === 'completed') return b.jobsCompleted - a.jobsCompleted;
    return b.rating - a.rating;
  });

  const categoryPills = [
    { id: 'all' as CategoryId | 'all', label: language === 'ur' ? 'تمام سروسز' : 'All Services', icon: LayoutGrid, count: providers.length },
    ...categories.map(cat => ({
      id: cat.id as CategoryId | 'all',
      label: language === 'ur' ? cat.nameUrdu || cat.name : cat.name,
      icon: iconMap[cat.icon] || Wrench,
      count: providers.filter(p => p.categoryId === cat.id && !p.isSuspended).length || cat.activeProvidersCount || 10,
      emergencyAvailable: cat.emergencyAvailable
    }))
  ];

  return (
    <div id="services-directory-view" className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar with back to home / close button */}
        <div className="relative z-10 flex items-center justify-between gap-4 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-cyan-300">
            <Users className="w-3.5 h-3.5" />
            <span>
              {language === 'ur'
                ? `${providers.length}+ تصدیق شدہ پروفیشنل کاریگر دستیاب`
                : `${providers.length}+ Verified Service Technicians Available`}
            </span>
          </div>

          <button
            id="close-services-directory-btn"
            onClick={() => {
              setActiveTab('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'ہوم پر واپس جائیں' : 'Back to Home'}</span>
            <X className="w-3.5 h-3.5 ml-1 opacity-75" />
          </button>
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {language === 'ur' ? 'سروسز اور کاریگر ڈائریکٹری' : 'Service Providers & Technicians'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {language === 'ur'
              ? 'پلمبر، الیکٹریشن، اے سی ٹیکنیشن، کارپینٹر اور دیگر تمام کاریگروں سے براہ راست رابطہ کریں یا فوری بک کریں۔'
              : 'Browse background-checked professionals across Karachi, Lahore & Islamabad with transparent pricing and escrow safety.'}
          </p>

          {/* Search Input Bar */}
          <div className="pt-2">
            <div className="relative w-full max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="services-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'ur'
                    ? 'کاریگر کا نام یا سروس تلاش کریں (مثلاً پلمبر، علی الیکٹریشن، اے سی گیس)...'
                    : 'Search technician name, service, or trade (e.g. Plumber, AC gas charge, Tariq)...'
                }
                className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm font-medium shadow-md border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryPills.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0077FE] text-white shadow-md shadow-blue-600/30'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Toolbar: Results count, SOS toggle, Online toggle, Sort selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>
              {searchQuery.trim()
                ? `Results for "${searchQuery}"`
                : selectedCategory !== 'all'
                ? `${selectedCategory.toUpperCase()} Technicians`
                : language === 'ur' ? 'دستیاب کاریگر' : 'Available Technicians'}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0077FE] dark:text-[#00B4D8] border border-blue-200 dark:border-blue-800">
              {displayedProviders.length}
            </span>
          </h2>
        </div>

        {/* Action Toggles & Sort */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* 15-Min Emergency Toggle */}
          <button
            onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              filterEmergencyOnly
                ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>15-Min SOS</span>
          </button>

          {/* Online Toggle */}
          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
              onlineOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Online Now</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0077FE]" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-white"
            >
              <option value="rating" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Top Rated (4.9★)</option>
              <option value="distance" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Nearest (GPS)</option>
              <option value="price_low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lowest Price</option>
              <option value="completed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Most Jobs Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Providers Grid (Services Providers Cards) */}
      {displayedProviders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-[#0077FE] mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {language === 'ur' ? 'کوئی کاریگر نہیں ملا' : 'No Service Technicians Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {language === 'ur'
              ? 'براہ کرم سرچ کے الفاظ تبدیل کریں یا تمام فلٹرز ری سیٹ کریں۔'
              : 'Try clearing your search query or reset the filters to see all available service providers.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setFilterEmergencyOnly(false);
              setOnlineOnly(false);
            }}
            className="py-2 px-4 rounded-xl bg-[#0077FE] text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-600/30"
          >
            {language === 'ur' ? 'تمام فلٹرز ری سیٹ کریں' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayedProviders.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {/* 5. Comprehensive All Categories Trade Overview */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <AllCategoriesView onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      </div>
    </div>
  );
};
