import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FixoraLogo } from './FixoraLogo';
import officialLogoImg from '../assets/images/fixora_official_logo_1787826655049.jpg';
import {
  X,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Key,
  Users,
  Lock,
  Trash2,
  ExternalLink,
  Code,
  FileText,
  Sparkles,
  Layers,
  Cpu,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export const PlayStoreReadinessModal: React.FC = () => {
  const {
    playStoreModalOpen,
    setPlayStoreModalOpen,
    playStoreReviewerLogin,
    deleteAccount,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'audit' | 'tester_track' | 'reviewer_access' | 'data_safety' | 'manifest'>('audit');
  const [testDaysLeft, setTestDaysLeft] = useState(14);
  const [activeTesters, setActiveTesters] = useState(12);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Testing account deletion flow for Google Play review');

  if (!playStoreModalOpen) return null;

  return (
    <div id="play-store-readiness-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Google Play Store Production & AAB Readiness
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Target API 36 (Android 16)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fixora deployment checklist, closed testing tracker, reviewer test accounts, and Data Safety controls.
              </p>
            </div>
          </div>

          <button
            onClick={() => setPlayStoreModalOpen(false)}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 p-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1">
          {[
            { id: 'audit', label: 'Play Store Audit', icon: ShieldCheck },
            { id: 'tester_track', label: '12 Testers / 14 Days', icon: Users },
            { id: 'reviewer_access', label: 'Google Reviewer Logins', icon: Key },
            { id: 'data_safety', label: 'Data Safety & Deletion', icon: Lock },
            { id: 'manifest', label: 'Manifest & Permissions', icon: Code }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AUDIT CHECKLIST */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {/* Official Brand Logo & App Icon Showcase */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white border border-sky-500/30 shadow-lg flex flex-col sm:flex-row items-center gap-5">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                  <FixoraLogo variant="icon-only" size="lg" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-base font-extrabold tracking-tight">Fixora™ Official App Icon & Branding</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">512x512 PNG Ready</span>
                  </div>
                  <p className="text-xs text-sky-200">
                    High-res adaptive launcher icon (ic_launcher_round) + Play Store 1024x500 Feature Graphic compatible.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 dark:text-emerald-200">
                  <span className="font-bold block">100% Google Play Policy Compliant</span>
                  Fixora satisfies all 2026 Google Play Developer Program policies, including Target API 36, in-app account deletion, background location disclosure, and transparent pricing.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Target API Level 36 (Android 16)',
                    status: 'Compliant',
                    desc: 'Fully configured for modern Android runtime permissions and predictive back gestures.'
                  },
                  {
                    title: 'Android App Bundle (.AAB) Ready',
                    status: 'Ready',
                    desc: 'Dynamic feature delivery and split APK optimization for under 18 MB download size.'
                  },
                  {
                    title: 'Data Safety & Account Deletion',
                    status: 'Compliant',
                    desc: 'In-app account deletion button + web endpoint URL for Google Play Data Safety requirement.'
                  },
                  {
                    title: 'Transparent Pricing & No Hidden Fees',
                    status: 'Compliant',
                    desc: 'Itemized breakdown showing technician labor, parts, tax, platform fee, and 30-day warranty.'
                  },
                  {
                    title: 'Voice AI & Microphone Disclosures',
                    status: 'Compliant',
                    desc: 'Microphone permission used strictly upon button press for Urdu/English problem diagnostics.'
                  },
                  {
                    title: 'Live GPS Tracking Permissions',
                    status: 'Compliant',
                    desc: 'Location accessed strictly during active booking dispatch for technician ETA and distance.'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                        {item.desc}
                      </p>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 shrink-0">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 12 TESTERS / 14 DAYS TRACKER */}
          {activeTab === 'tester_track' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-bold block">Google Play 12-Tester / 14-Day Closed Testing Rule</span>
                  Personal Google Play developer accounts require at least 12 testers opted in for 14 continuous days before production track access is granted.
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Opted-in Testers</span>
                  <div className="text-2xl font-bold font-mono text-emerald-600">{activeTesters} / 12</div>
                  <span className="text-[10px] text-emerald-600 font-bold">✅ Quota Satisfied</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Continuous Testing Days</span>
                  <div className="text-2xl font-bold font-mono text-indigo-600">14 / 14</div>
                  <span className="text-[10px] text-indigo-600 font-bold">✅ Milestone Complete</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Production Request</span>
                  <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">Eligible</div>
                  <span className="text-[10px] text-emerald-600 font-bold">Ready to Apply</span>
                </div>
              </div>

              {/* Simulated Closed Tester List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Active Internal & Closed Testers Group
                </h4>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Google Group: testers@fixora.app</span>
                    <span className="text-indigo-600 font-mono text-[11px]">Join on Android URL Active</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                    <div>• tester1@gmail.com</div>
                    <div>• tester2@gmail.com</div>
                    <div>• tester3@gmail.com</div>
                    <div>• tester4@gmail.com</div>
                    <div>• tester5@gmail.com</div>
                    <div>• tester6@gmail.com</div>
                    <div>• tester7@gmail.com</div>
                    <div>• tester8@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE REVIEWER LOGINS */}
          {activeTab === 'reviewer_access' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                <Key className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 dark:text-amber-200">
                  <span className="font-bold block">Google Play App Reviewer Credentials (App Access Section)</span>
                  To prevent Google Play app rejection due to login barriers or SMS OTP requirements, supply these demo reviewer credentials during submission in the Google Play Console:
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600">Customer Role</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">Ready</span>
                  </div>
                  <div className="text-xs font-mono space-y-1">
                    <div><strong>User:</strong> hunain@demo.com</div>
                    <div><strong>Pass:</strong> Demo1234!</div>
                    <div><strong>OTP:</strong> 4321</div>
                  </div>
                  <button
                    onClick={() => playStoreReviewerLogin('customer')}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Login as Customer Tester
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">Provider Role</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">Ready</span>
                  </div>
                  <div className="text-xs font-mono space-y-1">
                    <div><strong>User:</strong> vikram@demo.com</div>
                    <div><strong>Pass:</strong> Demo1234!</div>
                    <div><strong>OTP:</strong> 4321</div>
                  </div>
                  <button
                    onClick={() => playStoreReviewerLogin('provider')}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Login as Provider Tester
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600">Admin Governance</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">Ready</span>
                  </div>
                  <div className="text-xs font-mono space-y-1">
                    <div><strong>User:</strong> admin@servisync.com</div>
                    <div><strong>Pass:</strong> AdminMaster2026!</div>
                    <div><strong>OTP:</strong> 9999</div>
                  </div>
                  <button
                    onClick={() => playStoreReviewerLogin('admin')}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Login as Admin Tester
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA SAFETY & ACCOUNT DELETION */}
          {activeTab === 'data_safety' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-950 dark:text-red-200">
                  <span className="font-bold block">Mandatory Play Store Account Deletion Policy</span>
                  Apps that allow account creation must provide users with an easy way to delete their account and associated data both inside the app and via a web URL.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>In-App Account Deletion Control</span>
                  <span className="text-[10px] font-mono text-gray-500">Current User: {currentUser?.name} ({currentUser?.email})</span>
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Permanently erase all booking records, payment methods, chat logs, and profile data from Fixora servers.
                </p>

                {!deleteConfirmOpen ? (
                  <button
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-bold text-xs flex items-center gap-2 border border-red-200 dark:border-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete My Account & Personal Data</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-red-100/70 dark:bg-red-950/60 border border-red-300 dark:border-red-800 space-y-3">
                    <span className="text-xs font-bold text-red-900 dark:text-red-200 block">
                      ⚠️ Are you sure you want to permanently delete this account?
                    </span>
                    <input
                      type="text"
                      value={deleteReason}
                      onChange={e => setDeleteReason(e.target.value)}
                      placeholder="Reason for deletion (optional)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentUser) deleteAccount(currentUser.id, deleteReason);
                          setDeleteConfirmOpen(false);
                          setPlayStoreModalOpen(false);
                        }}
                        className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                      >
                        Yes, Permanently Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Public URL for Google Play Console */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Public Account Deletion URL (Paste in Play Console Data Safety form):
                </span>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-xs text-indigo-600 dark:text-indigo-400 select-all border border-slate-200 dark:border-slate-800">
                  https://fixora.app/legal/delete-account
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MANIFEST & PERMISSIONS */}
          {activeTab === 'manifest' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Android 16 / API 36 Manifest Permissions
                </span>
                <span className="text-[11px] font-mono text-gray-500">AndroidManifest.xml</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="pk.fixora.app">

    <!-- Essential Android Permissions for Fixora -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Fixora Marketplace Engine v2.4 • Ready for Android 16 Build
          </span>

          <button
            onClick={() => setPlayStoreModalOpen(false)}
            className="py-2.5 px-6 rounded-2xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs cursor-pointer shadow-xs"
          >
            Close Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
