import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { SubscriptionPlan, PaymentMethod } from '../types';
import {
  X,
  Sparkles,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Zap,
  ArrowRight,
  Gift,
  Check,
  Star,
  Layers,
  Wallet,
  Smartphone,
  CreditCard,
  Building2,
  Calendar,
  Percent,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SubscriptionModal: React.FC = () => {
  const {
    subscriptionModalOpen,
    setSubscriptionModalOpen,
    currentUser,
    currency,
    formatPrice,
    subscribeToPlan,
    cancelSubscription,
    setWalletModalOpen,
    language,
    t
  } = useApp();

  const [roleTab, setRoleTab] = useState<'customer' | 'provider'>(
    currentUser?.role === 'provider' ? 'provider' : 'customer'
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-plus-customer');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState<string | null>(null);

  if (!subscriptionModalOpen || !currentUser) return null;

  const filteredPlans = SUBSCRIPTION_PLANS.filter(
    p => p.targetRole === roleTab || p.targetRole === 'both'
  );

  const activeSubscription = currentUser.subscription;

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setIsProcessing(true);

    setTimeout(() => {
      const success = subscribeToPlan(plan.id, paymentMethod);
      setIsProcessing(false);

      if (success) {
        setSuccessPlanName(plan.name);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch {
          // ignore
        }

        setTimeout(() => {
          setSuccessPlanName(null);
          setSubscriptionModalOpen(false);
        }, 2500);
      }
    }, 1000);
  };

  return (
    <div
      id="subscription-plans-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border-b border-indigo-500/20 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
                <Crown className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold">
                    {language === 'ur' ? 'فکسورا پریمیم سبسکرپشن پلانز' : 'Fixora Premium Subscriptions'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-amber-400" />
                    <span>Save up to 60%</span>
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  {language === 'ur'
                    ? 'کسٹمرز کے لیے زیرو پلیٹ فارم فیس اور کاریگروں کے لیے صرف 5 فیصد کمیشن کٹوتی'
                    : 'Exclusive discounts for homeowners & ultra-low 5% platform commission for pros'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSubscriptionModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center justify-center mt-5">
            <div className="flex items-center p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold">
              <button
                onClick={() => setRoleTab('customer')}
                className={`py-2 px-5 rounded-xl transition cursor-pointer ${
                  roleTab === 'customer'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{language === 'ur' ? 'کسٹمر ممبرشپ (گھریلو دیکھ بھال)' : 'For Customers / Homeowners'}</span>
              </button>

              <button
                onClick={() => setRoleTab('provider')}
                className={`py-2 px-5 rounded-xl transition cursor-pointer ${
                  roleTab === 'provider'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{language === 'ur' ? 'کاریگر کلب (صرف 5% کمیشن)' : 'For Service Providers (5% Commission)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Active Plan Status Banner (if user has active subscription) */}
        {activeSubscription && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 px-6 py-3 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Active Plan: <strong className="text-slate-900 dark:text-white">{activeSubscription.name}</strong> • Valid until {activeSubscription.expiryDate}
              </span>
            </div>

            <button
              onClick={cancelSubscription}
              className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Cancel Subscription
            </button>
          </div>
        )}

        {/* Success Modal Notification */}
        {successPlanName && (
          <div className="m-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-center font-bold text-sm animate-in fade-in flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <span>Subscribed to {successPlanName}! Benefits are instantly active on your account.</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPlans.map(plan => {
              const isCurrent = activeSubscription?.planId === plan.id;
              const priceDisplay = currency === 'PKR'
                ? `₨ ${(plan.pricePKR || (plan.priceUSD ? Math.round(plan.priceUSD * 280) : 0)).toLocaleString()}`
                : `$${(plan.priceUSD || 0).toFixed(2)}`;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-800 border-indigo-500/80 shadow-xl ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-md">
                      Most Popular
                    </span>
                  )}

                  <div>
                    {/* Title & Tagline */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {language === 'ur' ? plan.nameUrdu : plan.name}
                        </h3>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {language === 'ur' ? plan.taglineUrdu : plan.tagline}
                        </p>
                      </div>

                      {plan.tier === 'pro_vip' && (
                        <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                          <Crown className="w-5 h-5 fill-amber-500" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                      {language === 'ur' ? plan.descriptionUrdu : plan.description}
                    </p>

                    {/* Price Display */}
                    <div className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 mb-5 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                          {priceDisplay}
                        </span>
                        <span className="text-xs font-medium text-slate-500">/ month</span>
                      </div>

                      {plan.commissionRatePercent !== undefined && (
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {plan.commissionRatePercent}% Commission Only
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-300">
                      {(language === 'ur' ? plan.featuresUrdu : plan.features).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Selector & CTA */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Pay via:</span>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] ${
                            paymentMethod === 'wallet' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          Wallet Balance ({formatPrice(currentUser.walletBalance)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('easypaisa')}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] ${
                            paymentMethod === 'easypaisa' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          EasyPaisa / Card
                        </button>
                      </div>
                    </div>

                    <button
                      id={`subscribe-plan-btn-${plan.id}`}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isProcessing || isCurrent}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                        isCurrent
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Current Active Plan</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-white" />
                          <span>{language === 'ur' ? 'ابھی سبسکرائب کریں' : `Subscribe to ${plan.name}`}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need More Wallet Balance? */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Wallet className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>
                Want to pay with your Fixora Wallet balance? Current Balance: <strong className="text-emerald-500">{formatPrice(currentUser.walletBalance)}</strong>
              </span>
            </div>

            <button
              onClick={() => {
                setSubscriptionModalOpen(false);
                setWalletModalOpen(true);
              }}
              className="py-2 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold whitespace-nowrap cursor-pointer transition"
            >
              Recharge SIM Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
