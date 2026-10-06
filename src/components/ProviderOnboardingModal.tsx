import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FixoraLogo } from './FixoraLogo';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Image as ImageIcon,
  MapPin,
  FileCheck,
  Zap,
  Star,
  Eye,
  Camera,
  Layers
} from 'lucide-react';
import { CategoryId, ProviderOfferedService, BeforeAfterPortfolioItem } from '../types';
import { CATEGORIES } from '../data/mockData';

const DEFAULT_CATEGORY_SERVICES: Record<string, { title: string; desc: string; pricePKR: number; priceUSD: number; duration: number }[]> = {
  plumbing: [
    { title: 'Emergency Pipe Burst & Leakage Fix', desc: 'Electronic acoustic leak detection, pipe welding, wall breach repair.', pricePKR: 1500, priceUSD: 18, duration: 45 },
    { title: 'Tap & Mixer Valve Replacement', desc: 'Complete replacement or spindle cartridge fix for bathroom & kitchen taps.', pricePKR: 800, priceUSD: 10, duration: 30 },
    { title: 'Geyser Installation & Descaling', desc: 'Gas/Electric geyser mounting, safety pressure valve fitting, thermostatic setup.', pricePKR: 2200, priceUSD: 25, duration: 60 },
    { title: 'Water Tank Cleaning & Sanitization', desc: 'High-pressure chemical jet wash, UV sanitization, sediment vacuuming.', pricePKR: 3500, priceUSD: 40, duration: 90 },
    { title: 'Drain & Sewer Line Unblocking', desc: 'Heavy duty motorized cable clearance for clogged kitchen sinks and main lines.', pricePKR: 1800, priceUSD: 20, duration: 40 }
  ],
  electrical: [
    { title: 'Emergency Short Circuit Diagnostics', desc: 'Thermal camera wire scanning, insulation resistance tester, phase balancing.', pricePKR: 1800, priceUSD: 20, duration: 45 },
    { title: 'Ceiling Fan & Exhaust Fan Repair', desc: 'Capacitor replacement, rewinding diagnostic, anti-vibration mount fitting.', pricePKR: 700, priceUSD: 8, duration: 30 },
    { title: 'Inverter UPS & Solar Connection Setup', desc: 'Heavy duty battery terminal lugs crimping, bypass switchboard installation.', pricePKR: 3000, priceUSD: 35, duration: 75 },
    { title: 'Main Distribution Board (DB) Breaker Fix', desc: 'Double-pole breaker replacement with surge protection unit.', pricePKR: 2500, priceUSD: 30, duration: 60 }
  ],
  ac_repair: [
    { title: 'Deep Foam Jet Chemical Wash', desc: 'Complete high pressure foam wash of cooling coils, blower wheel & drain tray.', pricePKR: 2000, priceUSD: 24, duration: 60 },
    { title: 'Inverter Refrigerant Gas Refill (R32/R410A)', desc: 'Nitrogen pressure testing, copper brazing at leak point, original gas charging.', pricePKR: 4500, priceUSD: 52, duration: 75 },
    { title: 'Inverter AC PCB Motherboard Repair', desc: 'Microcontroller diagnostics, IPM power module replacement, capacitor check.', pricePKR: 3500, priceUSD: 40, duration: 90 }
  ],
  carpentry: [
    { title: 'Door Lock & Smart Fingerprint Lock Fitting', desc: 'Precision chiseling, mortise cylinder installation, frame alignment.', pricePKR: 1800, priceUSD: 22, duration: 50 },
    { title: 'Sliding Wardrobe Channel & Roller Repair', desc: 'Heavy duty aluminum track replacement, anti-jump wheel balancing.', pricePKR: 1500, priceUSD: 18, duration: 45 },
    { title: 'IKEA / Modular Furniture Assembly', desc: 'Full assembly with high-torque alignment and wall anchor safety bolts.', pricePKR: 2200, priceUSD: 26, duration: 90 }
  ]
};

export const ProviderOnboardingModal: React.FC = () => {
  const {
    providerOnboardingOpen,
    setProviderOnboardingOpen,
    currentUser,
    providers,
    updateProviderProfile,
    formatPrice,
    currency
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // User's provider profile if already linked, or mock provider
  const currentProvider = providers.find(p => p.id === currentUser?.providerProfileId) || providers[0];

  // Step 1: Personal & Verification Info
  const [fullName, setFullName] = useState(currentUser?.name || currentProvider.name || 'Vikram Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || currentProvider.phone || '+92 300 1234567');
  const [cnicNumber, setCnicNumber] = useState(currentProvider.cnicNumber || '42101-5829143-7');
  const [serviceCity, setServiceCity] = useState(currentProvider.serviceCity || 'Karachi (Clifton, DHA, Gulshan, PECHS)');
  const [experienceYears, setExperienceYears] = useState(currentProvider.experienceYears || 8);
  const [title, setTitle] = useState(currentProvider.title || 'Master Licensed Plumber & Pipe Specialist');
  const [bio, setBio] = useState(
    currentProvider.bio ||
    'I provide professional home plumbing and sanitary repair services with 8+ years of field experience. Specializing in rapid 15-minute emergency responses, concealed leakages, tap repairs, and water tank maintenance.'
  );

  // Step 2: Category & Services Catalogue
  const [selectedCat, setSelectedCat] = useState<CategoryId>(currentProvider.categoryId || 'plumbing');
  const [servicesList, setServicesList] = useState<Omit<ProviderOfferedService, 'id'>[]>(
    currentProvider.offeredServices?.map(s => ({
      title: s.title,
      description: s.description,
      pricePKR: s.pricePKR,
      priceUSD: s.priceUSD,
      durationMins: s.durationMins,
      isEmergencyAllowed: s.isEmergencyAllowed,
      isPopular: s.isPopular
    })) || DEFAULT_CATEGORY_SERVICES[selectedCat] || DEFAULT_CATEGORY_SERVICES.plumbing
  );

  // New Custom Service Inputs
  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvPricePKR, setNewSrvPricePKR] = useState(1200);
  const [newSrvDuration, setNewSrvDuration] = useState(45);
  const [newSrvEmergency, setNewSrvEmergency] = useState(true);

  // Step 3: Work Showcase (Before & After)
  const [beforeAfterList, setBeforeAfterList] = useState<Omit<BeforeAfterPortfolioItem, 'id'>[]>(
    currentProvider.beforeAfterPortfolio?.map(ba => ({
      title: ba.title,
      description: ba.description,
      category: ba.category,
      beforeImg: ba.beforeImg,
      afterImg: ba.afterImg,
      completedDate: ba.completedDate
    })) || [
      {
        title: 'Master Bathroom Concealed Leakage & Sanitary Overhaul',
        description: 'Detected concealed wall seepage, replaced rusted galvanized lines with PPRC pipes, and installed modern matte-black mixer fittings.',
        category: 'Bathroom Plumbing',
        beforeImg: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
        afterImg: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&auto=format&fit=crop&q=80',
        completedDate: '2026-08-20'
      }
    ]
  );

  const [newBaTitle, setNewBaTitle] = useState('');
  const [newBaDesc, setNewBaDesc] = useState('');
  const [newBaCategory, setNewBaCategory] = useState('General Maintenance');
  const [newBaBeforeImg, setNewBaBeforeImg] = useState('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80');
  const [newBaAfterImg, setNewBaAfterImg] = useState('https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&auto=format&fit=crop&q=80');

  // Step 4: Availability & SLA
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('22:00');
  const [emergencyReady, setEmergencyReady] = useState(true);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(15);
  const [startingRate, setStartingRate] = useState(1200);

  if (!providerOnboardingOpen) return null;

  const handleCategoryChange = (newCat: CategoryId) => {
    setSelectedCat(newCat);
    if (DEFAULT_CATEGORY_SERVICES[newCat]) {
      setServicesList(DEFAULT_CATEGORY_SERVICES[newCat].map(s => ({
        title: s.title,
        description: s.desc,
        pricePKR: s.pricePKR,
        priceUSD: s.priceUSD,
        durationMins: s.duration,
        isEmergencyAllowed: true,
        isPopular: true
      })));
    }
  };

  const handleAddCustomService = () => {
    if (!newSrvTitle.trim()) return;
    const item: Omit<ProviderOfferedService, 'id'> = {
      title: newSrvTitle.trim(),
      description: newSrvDesc.trim() || 'Professional on-site service with warranty.',
      pricePKR: Number(newSrvPricePKR) || 1000,
      priceUSD: Math.round(Number(newSrvPricePKR) / 85),
      durationMins: Number(newSrvDuration) || 45,
      isEmergencyAllowed: newSrvEmergency,
      isPopular: false
    };
    setServicesList(prev => [...prev, item]);
    setNewSrvTitle('');
    setNewSrvDesc('');
  };

  const handleRemoveService = (idx: number) => {
    setServicesList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddBeforeAfter = () => {
    if (!newBaTitle.trim()) return;
    const item: Omit<BeforeAfterPortfolioItem, 'id'> = {
      title: newBaTitle.trim(),
      description: newBaDesc.trim() || 'Completed with professional craftsmanship and warranty.',
      category: newBaCategory,
      beforeImg: newBaBeforeImg,
      afterImg: newBaAfterImg,
      completedDate: new Date().toISOString().split('T')[0]
    };
    setBeforeAfterList(prev => [...prev, item]);
    setNewBaTitle('');
    setNewBaDesc('');
  };

  const handleRemoveBeforeAfter = (idx: number) => {
    setBeforeAfterList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAndPublish = () => {
    const formattedServices: ProviderOfferedService[] = servicesList.map((s, idx) => ({
      ...s,
      id: `srv-custom-${Date.now()}-${idx}`
    }));

    const formattedBA: BeforeAfterPortfolioItem[] = beforeAfterList.map((ba, idx) => ({
      ...ba,
      id: `ba-custom-${Date.now()}-${idx}`
    }));

    updateProviderProfile(currentProvider.id, {
      name: fullName,
      phone,
      title,
      bio,
      categoryId: selectedCat,
      experienceYears: Number(experienceYears),
      cnicNumber,
      serviceCity,
      emergencyReady,
      serviceRadiusKm: Number(serviceRadiusKm),
      workingHours: { start: workingHoursStart, end: workingHoursEnd },
      hourlyRate: Math.round(startingRate / 85),
      emergencyRate: Math.round((startingRate * 1.4) / 85),
      offeredServices: formattedServices,
      beforeAfterPortfolio: formattedBA,
      verificationStatus: 'verified',
      isVerified: true
    });

    setProviderOnboardingOpen(false);
  };

  return (
    <div id="provider-onboarding-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Steps */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FixoraLogo variant="icon-only" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Fixora Partner • Service & Profile Setup
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Step {step} of 5
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Setup your professional services, pricing, portfolio photos, and availability for customers.
              </p>
            </div>
          </div>

          <button
            onClick={() => setProviderOnboardingOpen(false)}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-5 p-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
          {[
            { num: 1, label: 'Personal & CNIC' },
            { num: 2, label: 'Services & Pricing' },
            { num: 3, label: 'Work Photos (Before/After)' },
            { num: 4, label: 'Hours & Emergency SLA' },
            { num: 5, label: 'Preview & Publish' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={`py-2 px-1 text-center rounded-xl transition-all cursor-pointer truncate ${
                step === s.num
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">Step {s.num}: </span>{s.label}
            </button>
          ))}
        </div>

        {/* Step Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Personal Information & CNIC Verification */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-bold block">NADRA & Police Background Check Compliance</span>
                  Fixora displays verified badges on technician profiles to establish trust with residential and commercial customers.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ahmed Khan"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Phone Number (WhatsApp Active)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    CNIC / National Identity Card Number
                  </label>
                  <input
                    type="text"
                    value={cnicNumber}
                    onChange={e => setCnicNumber(e.target.value)}
                    placeholder="e.g. 42101-5829143-7"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Service Areas / City
                  </label>
                  <input
                    type="text"
                    value={serviceCity}
                    onChange={e => setServiceCity(e.target.value)}
                    placeholder="e.g. Karachi (DHA, Clifton, Gulshan, PECHS)"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Years of Field Experience
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={e => setExperienceYears(Number(e.target.value))}
                    min="1"
                    max="40"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Professional Headline / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Master Licensed Plumber & Sanitary Expert"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  About My Business & Service Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Describe your expertise, certifications, and what tools you bring..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Service Selection & Custom Catalogue */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                  Select Primary Service Trade
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedCat === cat.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-xs block font-bold">{cat.name}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{cat.nameUrdu}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Offered Services List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Offered Sub-Services & Price Catalog ({servicesList.length})
                  </h4>
                  <span className="text-[11px] text-gray-500">Customers can book these specific items directly</span>
                </div>

                <div className="space-y-2">
                  {servicesList.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                            {srv.title}
                          </span>
                          {srv.isEmergencyAllowed && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800">
                              ⚡ Emergency SLA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {srv.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 block">
                            ₨ {(srv.pricePKR || (srv.priceUSD ? Math.round(srv.priceUSD * 280) : 0)).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">~{srv.durationMins} mins</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Sub-Service Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Add Custom Sub-Service to Your Menu
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newSrvTitle}
                      onChange={e => setNewSrvTitle(e.target.value)}
                      placeholder="Service Name (e.g., Water Tank Float Valve Replacement)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      value={newSrvPricePKR}
                      onChange={e => setNewSrvPricePKR(Number(e.target.value))}
                      placeholder="Price (₨ PKR)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newSrvDesc}
                      onChange={e => setNewSrvDesc(e.target.value)}
                      placeholder="Brief Description (e.g., Heavy duty brass valve with leak test)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Work Photos (Before & After Portfolio) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block">Showcase Your Real Workmanship</span>
                  Before & After comparison photos give customers confidence and increase your booking rate by up to 300%.
                </div>
              </div>

              {/* Existing Before/After Showcase */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Active Before & After Work Gallery ({beforeAfterList.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {beforeAfterList.map((ba, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {ba.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBeforeAfter(idx)}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                            Before (Broken)
                          </span>
                          <div className="h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 dark:border-slate-700">
                            <img src={ba.beforeImg} alt="Before" className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                            After (Repaired)
                          </span>
                          <div className="h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 dark:border-slate-700">
                            <img src={ba.afterImg} alt="After" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                        {ba.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Before/After Item */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Add New Before/After Job Photo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={newBaTitle}
                      onChange={e => setNewBaTitle(e.target.value)}
                      placeholder="e.g. Broken Water Tank Pipe Bypass"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      value={newBaCategory}
                      onChange={e => setNewBaCategory(e.target.value)}
                      placeholder="e.g. Tank Installation"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                      Before Image URL
                    </label>
                    <input
                      type="text"
                      value={newBaBeforeImg}
                      onChange={e => setNewBaBeforeImg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                      After Image URL
                    </label>
                    <input
                      type="text"
                      value={newBaAfterImg}
                      onChange={e => setNewBaAfterImg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1">
                    Summary of Work Performed
                  </label>
                  <input
                    type="text"
                    value={newBaDesc}
                    onChange={e => setNewBaDesc(e.target.value)}
                    placeholder="e.g. Removed corroded iron line, welded new 1-inch PPRC piping with high pressure brass gate valve."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddBeforeAfter}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project to Portfolio</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Hours & Emergency SLA */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Daily Operating Hours
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Start Time</label>
                      <input
                        type="time"
                        value={workingHoursStart}
                        onChange={e => setWorkingHoursStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">End Time</label>
                      <input
                        type="time"
                        value={workingHoursEnd}
                        onChange={e => setWorkingHoursEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Dispatch Radius
                  </h4>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Service Range:</span>
                      <span className="font-bold text-indigo-600">{serviceRadiusKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="35"
                      value={serviceRadiusKm}
                      onChange={e => setServiceRadiusKm(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Readiness Toggle */}
              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-1" />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-red-950 dark:text-red-200 block">
                      ⚡ Enable 15-Minute Emergency On-Call
                    </span>
                    <p className="text-[11px] text-red-800 dark:text-red-300">
                      Receive immediate sound alerts for midnight leaks, power outages, and burst pipes with a 40% surge payout.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={emergencyReady}
                    onChange={e => setEmergencyReady(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Starting Pricing */}
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Starting Base Inspection / Minimum Visit Fee (₨ PKR)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={startingRate}
                    onChange={e => setStartingRate(Number(e.target.value))}
                    min="500"
                    step="100"
                    className="w-48 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white"
                  />
                  <span className="text-xs text-gray-500">
                    Standard home visit rate (Emergency dispatch will calculate automatically at ₨ {(startingRate * 1.4).toFixed(0)})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Live Marketplace & AI Matching Preview */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block">Live Marketplace & AI Match Preview</span>
                  This is exactly how customers in {serviceCity || 'Karachi'} will see your profile and services when searching on Fixora or using Voice AI!
                </div>
              </div>

              {/* Card Preview */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg space-y-4 max-w-lg mx-auto">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentProvider.avatar}
                      alt={fullName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{fullName}</h4>
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-500" /> {serviceCity} • {experienceYears} Yrs Exp
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>5.0</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">🟢 Available Now</span>
                  </div>
                </div>

                {/* Sub-services pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Services Offered ({servicesList.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {servicesList.slice(0, 4).map((s, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-medium"
                      >
                        {s.title} • <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">₨{s.pricePKR}</span>
                      </span>
                    ))}
                    {servicesList.length > 4 && (
                      <span className="text-[10px] px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-gray-500 font-bold">
                        +{servicesList.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Before / After badge */}
                {beforeAfterList.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      {beforeAfterList.length} Before/After Showcase Jobs
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">Verified Photos</span>
                  </div>
                )}

                {/* Price CTA bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Starting From</span>
                    <span className="text-base font-bold font-mono text-gray-900 dark:text-white">
                      ₨ {(startingRate || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {emergencyReady && (
                      <span className="text-[10px] px-2 py-1 rounded-xl bg-red-50 text-red-600 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-red-600" /> 15-Min On-Call
                      </span>
                    )}
                    <div className="py-2 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs">
                      Book Now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="py-2.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAndPublish}
              className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish & Activate My Services</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
