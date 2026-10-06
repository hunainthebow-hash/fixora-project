import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Tag,
  CalendarCheck,
  DollarSign,
  Info,
  ShieldCheck
} from 'lucide-react';
import { NotificationItem } from '../types';

export const NotificationDrawer: React.FC = () => {
  const {
    notifDrawerOpen,
    setNotifDrawerOpen,
    notifications,
    markNotifAsRead,
    markAllNotifsRead,
    unreadNotifCount,
    t
  } = useApp();

  if (!notifDrawerOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'booking':
        return <CalendarCheck className="w-4 h-4 text-indigo-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'promo':
        return <Tag className="w-4 h-4 text-amber-500" />;
      case 'dispute':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  {t('notifications')}
                  {unreadNotifCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                      {unreadNotifCount} new
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time updates, dispatch status & promos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotifCount > 0 && (
                <button
                  onClick={markAllNotifsRead}
                  className="p-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setNotifDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-500 mt-1">We'll alert you when a provider is en route or sends a message.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotifAsRead(notif.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    notif.read
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-80'
                      : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/50 shadow-sm'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              End-to-end encrypted dispatch alerts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
