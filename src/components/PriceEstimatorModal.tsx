import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, X, Zap, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

interface PriceEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriceEstimatorModal: React.FC<PriceEstimatorModalProps> = ({ isOpen, onClose }) => {
  const { categories, setSelectedCategory, t, formatPrice } = useApp();

  const [selectedCat, setSelectedCat] = useState('plumbing');
  const [complexity, setComplexity] = useState<'minor' | 'standard' | 'major'>('standard');
  const [isEmergency, setIsEmergency] = useState(false);
  const [partsRequired, setPartsRequired] = useState(false);

  if (!isOpen) return null;

  // Base estimation algorithm
  const basePrices: Record<string, number> = {
    plumbing: 35,
    electrical: 40,
    carpentry: 38,
    ac_repair: 45,
    appliance_repair: 35,
    painting: 50,
    cleaning: 30,
    it_services: 45,
    tutoring: 25,
    mechanic: 45,
    moving: 60,
    maintenance: 35,
    healthcare: 55,
    handyman: 25,
    gardening: 30,
    car_wash: 25,
    mobile_repair: 35,
    computer_repair: 45,
  };

  const base = basePrices[selectedCat] || 35;
  const complexityMultiplier = complexity === 'minor' ? 0.75 : complexity === 'standard' ? 1.0 : 1.6;
  const emergencySurge = isEmergency ? 15 : 0;
  const partsEstimate = partsRequired ? 25 : 0;

  const estimatedMin = Math.round(base * complexityMultiplier + emergencySurge + partsEstimate);
  const estimatedMax = Math.round(estimatedMin * 1.35);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
            <Calculator className="w-5 h-5" />
            <h3>Instant Price & Fare Estimator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Get real-time market estimates based on service trade, complexity, and emergency SLA before booking.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Service Trade
            </label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-medium"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Scope & Complexity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'minor', label: 'Minor Fix', desc: 'Quick < 30 mins' },
                { id: 'standard', label: 'Standard', desc: 'Typical inspection' },
                { id: 'major', label: 'Heavy / Overhaul', desc: 'Complex installation' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setComplexity(opt.id as any)}
                  className={`p-2 rounded-xl border text-center transition ${
                    complexity === opt.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Add-on toggles */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Zap className="w-4 h-4 text-rose-500" />
                <span>15-Min Emergency Priority Dispatch</span>
              </span>
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={e => setIsEmergency(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Include Basic Replacement Parts / Consumables</span>
              </span>
              <input
                type="checkbox"
                checked={partsRequired}
                onChange={e => setPartsRequired(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
            </label>
          </div>

          {/* Estimation Result Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg space-y-1 text-center">
            <span className="text-[11px] uppercase tracking-wider text-indigo-100 font-bold">Estimated Cost Range</span>
            <div className="text-2xl font-black font-mono">
              {formatPrice(estimatedMin)} - {formatPrice(estimatedMax)}
            </div>
            <p className="text-[11px] text-indigo-100/90">
              *Guaranteed within platform bounds. Exact quotation confirmed after technician diagnostics.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(selectedCat as any);
                onClose();
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition"
            >
              <span>Browse {categories.find(c => c.id === selectedCat)?.name} Pros</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
