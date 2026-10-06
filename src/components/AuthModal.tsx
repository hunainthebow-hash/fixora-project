import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FixoraLogo } from './FixoraLogo';
import {
  X,
  User,
  Briefcase,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORIES, DEMO_USERS } from '../data/mockData';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    authTargetRole,
    setAuthTargetRole,
    login,
    signup,
    userAddress,
  } = useApp();

  const [role, setRole] = useState<'customer' | 'provider'>(authTargetRole);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [address, setAddress] = useState(userAddress || 'Sector 18, Royal Palms');
  const [providerCategory, setProviderCategory] = useState<CategoryId>('plumbing');
  const [providerRate, setProviderRate] = useState(35);
  const [providerTitle, setProviderTitle] = useState('Certified Master Technician');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const email = emailOrPhone.includes('@') ? emailOrPhone.trim() : `${emailOrPhone.trim()}@fixora.pk`;

    if (authModalMode === 'login') {
      if (!emailOrPhone.trim()) {
        setErrorMessage('Please enter your email or phone number.');
        setIsLoading(false);
        return;
      }

      // Try Firebase Auth if email contains valid format
      if (emailOrPhone.includes('@') && password.length >= 6) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (firebaseErr: any) {
          console.warn('[Firebase Auth] Sign in notice:', firebaseErr.message);
        }
      }

      const success = login(emailOrPhone.trim(), role);
      setIsLoading(false);
      if (success) {
        setAuthModalOpen(false);
      }
    } else {
      if (!name.trim() || !emailOrPhone.trim()) {
        setErrorMessage('Please fill in your name and email/phone.');
        setIsLoading(false);
        return;
      }

      // Try Firebase Auth Registration
      if (email.includes('@') && password.length >= 6) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (firebaseErr: any) {
          console.warn('[Firebase Auth] Sign up notice:', firebaseErr.message);
        }
      }

      signup(
        {
          name: name.trim(),
          email: email,
          phone: emailOrPhone.includes('@') ? '+92 300 1234567' : emailOrPhone.trim(),
          role,
          address,
        },
        role === 'provider'
          ? {
              categoryId: providerCategory,
              title: providerTitle,
              hourlyRate: providerRate,
            }
          : undefined
      );
      setIsLoading(false);
      setAuthModalOpen(false);
    }
  };

  const handleQuickDemoLogin = (userIndex: number) => {
    const demoUser = DEMO_USERS[userIndex];
    login(demoUser.email, demoUser.role);
    setAuthModalOpen(false);
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Fixora Logo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <FixoraLogo variant="icon-only" size="sm" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {authModalMode === 'login' ? 'Sign In to Fixora' : 'Create a Fixora Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {role === 'customer' ? 'Customer Account' : 'Service Provider Partner'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher Bar */}
        <div className="p-4 bg-white/50 border-b border-white/80 space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            ⚡ 1-Click Demo Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="demo-login-hunain-btn"
              onClick={() => handleQuickDemoLogin(0)}
              className="p-2.5 rounded-2xl bg-white/80 hover:bg-indigo-50/80 hover:border-indigo-300 border border-white/90 text-left transition-all cursor-pointer shadow-xs"
            >
              <span className="text-xs font-bold text-gray-900 block">Hunain</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Customer (Active Booking)</span>
            </button>

            <button
              id="demo-login-vikram-btn"
              onClick={() => handleQuickDemoLogin(1)}
              className="p-2.5 rounded-2xl bg-white/80 hover:bg-amber-50/80 hover:border-amber-300 border border-white/90 text-left transition-all cursor-pointer shadow-xs"
            >
              <span className="text-xs font-bold text-gray-900 block">Vikram S.</span>
              <span className="text-[10px] text-amber-600 font-semibold">Plumber Provider (4.9★)</span>
            </button>

            <button
              id="demo-login-sara-btn"
              onClick={() => handleQuickDemoLogin(2)}
              className="p-2.5 rounded-2xl bg-white/80 hover:bg-emerald-50/80 hover:border-emerald-300 border border-white/90 text-left transition-all cursor-pointer shadow-xs"
            >
              <span className="text-xs font-bold text-gray-900 block">Sara Khan</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Electrician Provider</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Role selector tab */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/60 border border-white/80 shadow-xs">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                role === 'customer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                role === 'provider'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Service Provider</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* If Signup: Name Field */}
          {authModalMode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Full Name / Business Name
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Hunain Khan"
                  className="w-full bg-transparent text-gray-900 text-xs focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Email / Phone */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Email Address or Phone Number
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                placeholder="e.g. hunainthebow@gmail.com or +91 9876543210"
                className="w-full bg-transparent text-gray-900 text-xs focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Password
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-gray-900 text-xs focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Provider Specific fields if Signing Up as Provider */}
          {authModalMode === 'signup' && role === 'provider' && (
            <div className="p-4 rounded-3xl bg-white/60 border border-white/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                Provider Business Details
              </span>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Primary Service Category</label>
                <select
                  value={providerCategory}
                  onChange={e => setProviderCategory(e.target.value as CategoryId)}
                  className="w-full px-3 py-2 rounded-2xl bg-white border border-slate-200 text-gray-900 text-xs shadow-xs focus:outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={providerTitle}
                    onChange={e => setProviderTitle(e.target.value)}
                    placeholder="e.g. Master Plumber"
                    className="w-full px-3 py-2 rounded-2xl bg-white border border-slate-200 text-gray-900 text-xs shadow-xs focus:outline-none placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Hourly / Visit Rate ($)</label>
                  <input
                    type="number"
                    value={providerRate}
                    onChange={e => setProviderRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-2xl bg-white border border-slate-200 text-gray-900 text-xs font-mono shadow-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode Switcher Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setAuthModalMode(authModalMode === 'login' ? 'signup' : 'login');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
            >
              {authModalMode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Log In'}
            </button>
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>{authModalMode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
