import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  AlertTriangle,
  Tag,
  DollarSign,
  FileCheck2,
  TrendingUp,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
  Eye,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  Percent,
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { CategoryId } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    allUsers,
    blockUser,
    unblockUser,
    providers,
    setProviders,
    bookings,
    disputes,
    resolveDispute,
    verificationDocs,
    reviewVerificationDoc,
    promos,
    createPromoCode,
    togglePromoCodeActive,
    reports,
    resolveReport,
    language,
    t,
    setPlayStoreModalOpen,
    setProviderOnboardingOpen,
    setActiveTab: setGlobalActiveTab
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'users' | 'providers' | 'verification' | 'bookings' | 'disputes' | 'promos' | 'reports'
  >('overview');

  // Search & filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'customer' | 'provider'>('all');
  const [docFilter, setDocFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [disputeFilter, setDisputeFilter] = useState<'all' | 'open' | 'resolved' | 'refunded'>('all');

  // Create promo form modal state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(20);
  const [newPromoMaxDiscount, setNewPromoMaxDiscount] = useState(15);
  const [newPromoMinOrder, setNewPromoMinOrder] = useState(30);
  const [newPromoDescription, setNewPromoDescription] = useState('');
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Selected doc image preview modal
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // Stats calculations
  const totalRevenue = bookings.reduce((sum, b) => (b.paymentStatus === 'paid' ? sum + b.totalAmount : sum), 0);
  const activeBookingsCount = bookings.filter(b => b.status === 'en_route' || b.status === 'in_progress' || b.status === 'accepted').length;
  const pendingDocsCount = verificationDocs.filter(d => d.status === 'pending').length;
  const openDisputesCount = disputes.filter(d => d.status === 'open').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  const filteredUsers = allUsers.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  });

  const filteredDocs = verificationDocs.filter(d => {
    if (docFilter !== 'all' && d.status !== docFilter) return false;
    return true;
  });

  const filteredDisputes = disputes.filter(d => {
    if (disputeFilter !== 'all' && d.status !== disputeFilter) return false;
    return true;
  });

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    createPromoCode({
      code: newPromoCode.toUpperCase().trim(),
      discountPercent: Number(newPromoDiscount),
      maxDiscount: Number(newPromoMaxDiscount),
      minOrder: Number(newPromoMinOrder),
      validUntil: '2026-12-31',
      isActive: true,
      description: newPromoDescription || `${newPromoDiscount}% instant discount on orders above $${newPromoMinOrder}`,
    });

    setNewPromoCode('');
    setNewPromoDescription('');
    setShowPromoModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                {t('superAdminPortal')}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-300">Live Network Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t('platformControlCenter')}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time governance, CNIC ID verification approvals, dispute refunds, live emergency telemetry & service catalog controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="admin-back-to-home-btn"
              onClick={() => {
                setGlobalActiveTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>{language === 'ur' ? 'ہوم پر واپس جائیں' : 'Back to Home'}</span>
            </button>

            <button
              id="admin-open-playstore-btn"
              onClick={() => setPlayStoreModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>Play Store Readiness (API 36)</span>
            </button>

            <button
              id="admin-open-onboarding-btn"
              onClick={() => setProviderOnboardingOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Service Profile Flow</span>
            </button>

            <button
              onClick={() => setShowPromoModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createPromoCode')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: t('overviewStats'), icon: TrendingUp, count: undefined },
          { id: 'users', label: t('manageUsers'), icon: Users, count: allUsers.length },
          { id: 'verification', label: t('cnicVerificationDocs'), icon: FileCheck2, count: pendingDocsCount, badgeColor: 'bg-amber-500' },
          { id: 'bookings', label: t('allBookingsLive'), icon: CalendarCheck, count: bookings.length },
          { id: 'disputes', label: t('disputesAndRefunds'), icon: AlertTriangle, count: openDisputesCount, badgeColor: 'bg-rose-500' },
          { id: 'promos', label: t('promoCoupons'), icon: Tag, count: promos.length },
          { id: 'reports', label: t('safetyAudits'), icon: ShieldAlert, count: pendingReportsCount, badgeColor: 'bg-rose-500' },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeAdminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveAdminTab(item.id as any)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap shadow-sm ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                  : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    item.badgeColor
                      ? `${item.badgeColor} text-white`
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Platform GMV</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +18.4% vs last week
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Bookings</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeBookingsCount} Ongoing
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                {bookings.length} Total Historical Bookings
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">CNIC Approvals</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {pendingDocsCount} Pending
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {verificationDocs.filter(d => d.status === 'verified').length} Certified Providers
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Open Disputes</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {openDisputesCount} Active
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Average resolution SLA &lt; 45 mins
              </div>
            </div>
          </div>

          {/* Real-time Overview Action Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Verification Queue */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Pending Document Reviews</h3>
                </div>
                <button
                  onClick={() => setActiveAdminTab('verification')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  View All ({pendingDocsCount})
                </button>
              </div>

              {pendingDocsCount === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All provider verification documents have been processed!
                </div>
              ) : (
                <div className="space-y-3">
                  {verificationDocs
                    .filter(d => d.status === 'pending')
                    .slice(0, 3)
                    .map(doc => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          {doc.providerAvatar && (
                            <img
                              src={doc.providerAvatar}
                              alt={doc.providerName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                            />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              {doc.providerName}
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium uppercase">
                                {doc.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Doc: {doc.name} • {doc.documentNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {doc.documentImageUrl && (
                            <button
                              onClick={() => setPreviewDocUrl(doc.documentImageUrl || null)}
                              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition"
                              title="Preview Document Image"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => reviewVerificationDoc(doc.id, 'verified')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => reviewVerificationDoc(doc.id, 'rejected', 'Document blurry or expired')}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Active Emergency & Ongoing Dispatches */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Live Dispatches & Emergency Jobs</h3>
                </div>
                <button
                  onClick={() => setActiveAdminTab('bookings')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  View All ({bookings.length})
                </button>
              </div>

              <div className="space-y-3">
                {bookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          #{booking.id}
                        </span>
                        {booking.urgency === 'emergency' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                            ⚡ EMERGENCY
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold uppercase">
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1 line-clamp-1">
                        {booking.serviceTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cust: {booking.customerName} → Prov: {booking.provider.name} • OTP: <strong className="text-indigo-600 dark:text-indigo-400">{booking.otp}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ${booking.totalAmount.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {booking.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeAdminTab === 'users' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Users & Account Governance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage all customer profiles, service technicians, balances, and security suspensions.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name, email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Providers</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Wallet</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {user.name}
                            {user.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                          user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                            : user.role === 'provider'
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="text-slate-900 dark:text-white">{user.email}</div>
                      <div className="text-slate-500 text-[11px]">{user.phone}</div>
                    </td>

                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      ${user.walletBalance.toFixed(2)}
                    </td>

                    <td className="p-3">
                      {user.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      {user.role !== 'admin' && (
                        user.isBlocked ? (
                          <button
                            onClick={() => unblockUser(user.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-[11px] transition flex items-center gap-1 ml-auto"
                          >
                            <Unlock className="w-3 h-3" /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => blockUser(user.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg font-medium text-[11px] transition flex items-center gap-1 ml-auto"
                          >
                            <Ban className="w-3 h-3" /> Suspend
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VERIFICATION & CNIC DOCUMENTS TAB */}
      {activeAdminTab === 'verification' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                CNIC, Trade License & Police Verification Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit uploaded government identity records to grant the official "Verified Pro" badge.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'pending', 'verified', 'rejected'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDocFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    docFilter === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {doc.providerAvatar && (
                      <img
                        src={doc.providerAvatar}
                        alt={doc.providerName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {doc.providerName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {doc.name}
                      </p>
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {doc.fullDocumentNumber || doc.documentNumber}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                      doc.status === 'verified'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : doc.status === 'rejected'
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {doc.documentImageUrl && (
                  <div
                    onClick={() => setPreviewDocUrl(doc.documentImageUrl || null)}
                    className="relative rounded-lg overflow-hidden h-32 bg-slate-200 dark:bg-slate-600 cursor-pointer group border border-slate-300 dark:border-slate-500"
                  >
                    <img
                      src={doc.documentImageUrl}
                      alt="Document scan"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-medium text-xs gap-1.5">
                      <Eye className="w-4 h-4" /> Click to Inspect Document
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600 text-xs">
                  <span className="text-slate-400 text-[11px]">Uploaded: {doc.uploadedAt}</span>
                  {doc.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => reviewVerificationDoc(doc.id, 'verified')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Certify
                      </button>
                      <button
                        onClick={() => reviewVerificationDoc(doc.id, 'rejected', 'ID photocopy unclear or expired')}
                        className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg font-semibold transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500">
                      Audit Status: {doc.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPUTES & REFUNDS TAB */}
      {activeAdminTab === 'disputes' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Customer Disputes & Wallet Refund Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resolve service complaints, inspect job photos, and trigger instant wallet refunds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'open', 'refunded', 'resolved'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDisputeFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    disputeFilter === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredDisputes.map(dispute => (
              <div
                key={dispute.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Dispute #{dispute.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-600 font-mono">
                      {dispute.bookingId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        dispute.status === 'open'
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                          : dispute.status === 'refunded'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>

                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.serviceTitle}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600">
                    "{dispute.description}"
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Customer: <strong>{dispute.customerName}</strong> • Provider: <strong>{dispute.providerName}</strong> • Disputed Amount: <strong>${dispute.amount}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end md:items-center gap-2 w-full md:w-auto">
                  {dispute.status === 'open' ? (
                    <>
                      <button
                        onClick={() => resolveDispute(dispute.id, 'refunded', dispute.amount, '100% Refund Approved by Admin')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 w-full sm:w-auto justify-center"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Full Refund (${dispute.amount})
                      </button>
                      <button
                        onClick={() => resolveDispute(dispute.id, 'refunded', Math.round(dispute.amount * 0.5), '50% Partial Settlement Refund')}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition w-full sm:w-auto justify-center"
                      >
                        Partial 50% Refund
                      </button>
                      <button
                        onClick={() => resolveDispute(dispute.id, 'dismissed', 0, 'Dispute dismissed after technician proof submission')}
                        className="px-2.5 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition hover:bg-slate-300"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <div className="text-right text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {dispute.refundAmount ? `Refunded $${dispute.refundAmount}` : 'Resolved without refund'}
                      </span>
                      <p className="text-[11px] text-slate-400">{dispute.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROMO CODES TAB */}
      {activeAdminTab === 'promos' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Marketing Promo Codes & Discounts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Launch seasonal promo codes, first-time user discounts, and emergency perks.
              </p>
            </div>
            <button
              onClick={() => setShowPromoModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Promo Code
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map(promo => (
              <div
                key={promo.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                        {promo.code}
                      </span>
                      <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {promo.discountPercent}% OFF (Max ${promo.maxDiscount})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => togglePromoCodeActive(promo.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                      promo.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                    }`}
                  >
                    {promo.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {promo.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600 text-[11px] text-slate-400">
                  <span>Min order: ${promo.minOrder}</span>
                  <span>Used {promo.usageCount} times</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL BOOKINGS TAB */}
      {activeAdminTab === 'bookings' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Bookings & Dispatches</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete platform dispatch records with customer OTP and live coordinates.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total {bookings.length} Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Order ID & Service</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Technician</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">OTP</th>
                  <th className="p-3 text-right">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">#{b.id}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1">{b.serviceTitle}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{b.customerName}</div>
                      <div className="text-[11px] text-slate-400">{b.customerPhone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{b.provider.name}</div>
                      <div className="text-[11px] text-slate-400">{b.provider.title}</div>
                    </td>
                    <td className="p-3">
                      {b.urgency === 'emergency' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]">
                          ⚡ EMERGENCY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                          STANDARD
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 uppercase">
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {b.otp}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      ${b.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SAFETY REPORTS TAB */}
      {activeAdminTab === 'reports' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Community Safety & Incident Reports</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit reported violations, abusive conduct, or fraudulent quotes.
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No safety complaints logged at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                        Report #{report.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600 font-medium">
                        Target: {report.reportedUserName} ({report.reportedRole})
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold uppercase">
                        {report.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      Reason: {report.reason}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Details: "{report.details}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Reported by: {report.reportedByName} • {report.createdAt.split('T')[0]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => resolveReport(report.id, 'ban')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" /> Suspend & Ban User
                        </button>
                        <button
                          onClick={() => resolveReport(report.id, 'dismiss')}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE PROMO CODE MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                Create New Promo Code
              </h3>
              <button
                onClick={() => setShowPromoModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={newPromoDiscount}
                    onChange={e => setNewPromoDiscount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Max ($) Cap
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPromoMaxDiscount}
                    onChange={e => setNewPromoMaxDiscount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Min Order ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPromoMinOrder}
                    onChange={e => setNewPromoMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Badge Text
                </label>
                <input
                  type="text"
                  placeholder="Special 30% discount on first repair"
                  value={newPromoDescription}
                  onChange={e => setNewPromoDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Publish Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-4 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Government Identity Document Inspection
              </h4>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden max-h-[70vh] bg-slate-950 flex items-center justify-center">
              <img
                src={previewDocUrl}
                alt="Document Full Scan"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
