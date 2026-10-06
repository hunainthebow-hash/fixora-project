import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  LayoutGrid,
  Calendar,
  Siren,
  Wallet,
  Settings
} from 'lucide-react';

export const FixoraBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setWalletModalOpen,
    currentUser,
    setFilterEmergencyOnly,
    setBookingIsEmergency,
    setBookingModalProvider,
    providers,
    setSelectedCategory,
    language
  } = useApp();

  const handleEmergencyClick = () => {
    setFilterEmergencyOnly(true);
    const emergencyPro = providers.find(p => p.emergencyReady && p.isOnline) || providers[0];
    if (emergencyPro) {
      setBookingIsEmergency(true);
      setBookingModalProvider(emergencyPro);
    }
  };

  const handleServicesClick = () => {
    setActiveTab('services');
    setSelectedCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="fixora-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom))'
      }}
      className="w-full bg-white dark:bg-[#070D1A] border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] px-2 sm:px-4 pt-1.5 transition-all"
    >
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        {/* 1. Home Button */}
        <button
          id="bottom-nav-home"
          type="button"
          onClick={() => {
            setActiveTab('explore');
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0077FE] dark:text-[#00B4D8]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'explore' ? 'stroke-[2.5] text-[#0077FE] dark:text-[#00B4D8]' : 'stroke-2'}`} />
          <span className="text-[11px] font-bold mt-0.5 tracking-tight">
            {language === 'ur' ? 'ہوم' : 'Home'}
          </span>
        </button>

        {/* 2. Services Button (Opens Dedicated Services & Technicians Directory) */}
        <button
          id="bottom-nav-services"
          type="button"
          onClick={handleServicesClick}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0077FE] dark:text-[#00B4D8]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 ${activeTab === 'services' ? 'stroke-[2.5] text-[#0077FE] dark:text-[#00B4D8]' : 'stroke-2'}`} />
          <span className="text-[11px] font-bold mt-0.5 tracking-tight">
            {language === 'ur' ? 'سروسز' : 'Services'}
          </span>
        </button>

        {/* 3. Bookings Button */}
        <button
          id="bottom-nav-bookings"
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0077FE] dark:text-[#00B4D8]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5] text-[#0077FE] dark:text-[#00B4D8]' : 'stroke-2'}`} />
          <span className="text-[11px] font-bold mt-0.5 tracking-tight">
            {language === 'ur' ? 'بکنگز' : 'Bookings'}
          </span>
        </button>

        {/* 4. Emergency Button */}
        <button
          id="bottom-nav-emergency"
          type="button"
          onClick={handleEmergencyClick}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer group"
        >
          <div className="relative">
            <Siren className="w-5 h-5 text-red-600 dark:text-red-500 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="animate-ping absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500 opacity-75" />
          </div>
          <span className="text-[11px] font-bold mt-0.5 text-red-600 dark:text-red-400 tracking-tight">
            {language === 'ur' ? 'ایمرجنسی' : 'Emergency'}
          </span>
        </button>

        {/* 5. Wallet Button */}
        <button
          id="bottom-nav-payment"
          type="button"
          onClick={() => setWalletModalOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-[#0077FE] dark:hover:text-[#00B4D8] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
        >
          <Wallet className="w-5 h-5 stroke-2" />
          <span className="text-[11px] font-bold mt-0.5 tracking-tight">
            {language === 'ur' ? 'والٹ' : 'Wallet'}
          </span>
        </button>
      </div>
    </nav>
  );
};


