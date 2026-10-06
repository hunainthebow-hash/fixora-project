/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { FixoraHomeDashboard } from './components/FixoraHomeDashboard';
import { FixoraBottomNav } from './components/FixoraBottomNav';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ProviderDetailModal } from './components/ProviderDetailModal';
import { BookingModal } from './components/BookingModal';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { ChatModal } from './components/ChatModal';
import { ReviewModal } from './components/ReviewModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DisputeModal } from './components/DisputeModal';
import { ReportModal } from './components/ReportModal';
import { DirectCallModal } from './components/DirectCallModal';
import { PriceEstimatorModal } from './components/PriceEstimatorModal';
import { AllCategoriesView } from './components/AllCategoriesView';
import { ServicesDirectoryView } from './components/ServicesDirectoryView';
import { SupportTicketModal } from './components/SupportTicketModal';
import { ReferralModal } from './components/ReferralModal';
import { ProviderOnboardingModal } from './components/ProviderOnboardingModal';
import { PlayStoreReadinessModal } from './components/PlayStoreReadinessModal';
import { WalletModal } from './components/WalletModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SettingsModal } from './components/SettingsModal';
import { BargainingModal } from './components/BargainingModal';
import {
  Mic,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const MarketplaceContent: React.FC = () => {
  const {
    activeTab,
    currentRole,
    setSelectedCategory,
    setVoiceModalOpen,
    t
  } = useApp();

  const [estimatorOpen, setEstimatorOpen] = useState(false);

  // If in Admin Dashboard tab
  if (activeTab === 'admin') {
    return <AdminDashboard />;
  }

  // If in Provider Dashboard tab
  if (activeTab === 'dashboard' && currentRole === 'provider') {
    return <ProviderDashboard />;
  }

  // If in Customer Bookings tab
  if (activeTab === 'dashboard' && currentRole === 'customer') {
    return <CustomerDashboard />;
  }

  // If in Services Directory tab
  if (activeTab === 'services') {
    return (
      <div className="w-full space-y-6">
        <CategoryBar />
        <ServicesDirectoryView />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 15-Minute Emergency SLA Dispatch Banner */}
      <EmergencyBanner />

      {/* Categories Horizontal Carousel */}
      <CategoryBar />

      {/* Main Fixora Blue + Orange Visual Dashboard */}
      <FixoraHomeDashboard onOpenEstimator={() => setEstimatorOpen(true)} />

      {/* Trust & Verification Guarantee Footer Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#1565D8] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#14213D] dark:text-white text-sm">100% Background Checked</h4>
              <p className="text-[#64748B] dark:text-slate-400 text-[11px] mt-0.5">Government ID, trade credentials & criminal record verified.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-[#DC2626] shrink-0">
              <Zap className="w-5 h-5 fill-[#DC2626]" />
            </div>
            <div>
              <h4 className="font-bold text-[#14213D] dark:text-white text-sm">15-Min Emergency SLA</h4>
              <p className="text-[#64748B] dark:text-slate-400 text-[11px] mt-0.5">Rapid dispatch for burst pipes, electrical short circuits & leaks.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#16A34A] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#14213D] dark:text-white text-sm">Dispute & Refund Protection</h4>
              <p className="text-[#64748B] dark:text-slate-400 text-[11px] mt-0.5">Instant wallet escrow resolution with 100% satisfaction guarantee.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-[#FF8A00] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#14213D] dark:text-white text-sm">Voice AI Assistant</h4>
              <p className="text-[#64748B] dark:text-slate-400 text-[11px] mt-0.5">Urdu, Hindi & English natural language diagnostics.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Voice Assistant Trigger FAB */}
      <button
        id="floating-voice-fab-btn"
        onClick={() => setVoiceModalOpen(true)}
        className="fixed bottom-22 right-4 z-40 p-3 sm:p-4 rounded-full bg-[#1565D8] hover:bg-[#0D47A1] text-white shadow-xl shadow-[#1565D8]/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 font-bold cursor-pointer group border border-blue-400/40"
      >
        <div className="relative">
          <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF8A00] animate-ping" />
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-wider text-white">
          {t('voiceAssistant')}
        </span>
      </button>

      {/* Modals Mounting */}
      <VoiceAssistantModal />
      <ProviderDetailModal />
      <BookingModal />
      <LiveTrackingModal />
      <ChatModal />
      <ReviewModal />
      <PaymentReceiptModal />
      <AuthModal />
      <NotificationDrawer />
      <DisputeModal />
      <ReportModal />
      <DirectCallModal />
      <SupportTicketModal />
      <ReferralModal />
      <ProviderOnboardingModal />
      <PlayStoreReadinessModal />
      <WalletModal />
      <SubscriptionModal />
      <SettingsModal />
      <BargainingModal />
      <PriceEstimatorModal isOpen={estimatorOpen} onClose={() => setEstimatorOpen(false)} />
    </div>
  );
};

const AppShell: React.FC = () => {
  const { theme } = useApp();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0B2A4A] text-slate-100' : 'bg-[#F7F9FC] text-[#14213D]'} antialiased selection:bg-[#1565D8] selection:text-white flex flex-col font-sans relative transition-colors duration-200 pb-20`}>
      {/* Soft Ambient Background Glow */}
      <div className="fixed top-[-10%] left-[-5%] w-[45%] h-[45%] bg-[#1565D8]/10 dark:bg-[#1565D8]/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#FF8A00]/10 dark:bg-[#FF8A00]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Navbar />
      <main className="flex-1 relative z-10">
        <MarketplaceContent />
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 mb-4 text-center text-xs text-[#64748B] dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md relative z-10">
        <p>© 2026 Fixora Technologies • Your Local Service Partner • 15-Minute Rapid Response SLA</p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
      {/* Docked Permanent Fixed Bottom Navigation (Indeed style - always visible at viewport bottom on load) */}
      <FixoraBottomNav />
    </AppProvider>
  );
}

