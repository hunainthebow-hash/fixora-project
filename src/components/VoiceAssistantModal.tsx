import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Star,
  MapPin,
  Clock,
  Building2,
  PhoneCall,
  PhoneOff,
  UserCheck,
  ChevronRight,
  Flame,
  Award,
  Layers,
  Check,
  FileText,
  BadgePercent,
  Radio,
  Activity,
  Send,
  MessageSquare
} from 'lucide-react';
import { CategoryId, ProviderProfile } from '../types';
import { PAKISTAN_CITIES, getLocalizedBenchmark } from '../data/pakistanCities';
import { formatPrice } from '../utils/currency';
import { useGeminiLive } from '../hooks/useGeminiLive';

interface DiagnosticQuestion {
  category: CategoryId;
  question: string;
  questionUrdu: string;
  options: {
    label: string;
    labelUrdu: string;
    inferredIssue: string;
    costImpactPercent: number; // e.g. -20% or +40%
    isEmergency?: boolean;
  }[];
}

const DIAGNOSTIC_TREES: Record<string, DiagnosticQuestion> = {
  ac_repair: {
    category: 'ac_repair',
    question: 'Is the outdoor compressor unit running or is the AC blowing warm air?',
    questionUrdu: 'کیا باہر والا کمپریسر چل رہا ہے یا صرف گرم ہوا آ رہی ہے؟',
    options: [
      { label: 'Blowing warm air & low cooling (Gas leak likely)', labelUrdu: 'گرم ہوا آ رہی ہے (گیس لیکیج ممکن ہے)', inferredIssue: 'Inverter AC Gas Charge & Leak Seal', costImpactPercent: 35, isEmergency: false },
      { label: 'Ice/Frost on indoor unit grill (Clogged filter / Coil)', labelUrdu: 'اندر والی جالی پر برف جم رہی ہے (سروس درکار)', inferredIssue: 'Master Chemical Wash & Jet Servicing', costImpactPercent: -15, isEmergency: false },
      { label: 'Tripping main electric breaker immediately (Short/Capacitor)', labelUrdu: 'آن کرتے ہی بریکر گر جاتا ہے (شارٹ سرکٹ)', inferredIssue: 'Compressor PCB / Capacitor Diagnostic & Repair', costImpactPercent: 10, isEmergency: true },
      { label: 'Water leaking/dripping inside room from drain', labelUrdu: 'کمرے کے اندر پانی ٹپک رہا ہے', inferredIssue: 'AC Drain Pipe Unblock & Level Fix', costImpactPercent: -30, isEmergency: false },
    ]
  },
  plumbing: {
    category: 'plumbing',
    question: 'Where is the leak or water blockage located?',
    questionUrdu: 'پانی کا مسئلہ یا لیکیج کس جگہ ہے؟',
    options: [
      { label: 'Active main supply pipe burst (Water flooding)', labelUrdu: 'مین لائن پائپ پھٹ گیا ہے (پانی بہہ رہا ہے)', inferredIssue: 'Main Water Line Emergency Burst Repair', costImpactPercent: 30, isEmergency: true },
      { label: 'Tap / Angle valve dripping or mixer broken', labelUrdu: 'نل یا مکسر سے پانی ٹپک رہا ہے', inferredIssue: 'Bathroom Sanitary & Tap Mixer Replacement', costImpactPercent: -20, isEmergency: false },
      { label: 'Underground motor pump not pulling water / humming', labelUrdu: 'پانی کی موٹر نہیں چل رہی یا آواز کر رہی ہے', inferredIssue: 'Water Motor Pump Repair / Capacitor Change', costImpactPercent: 20, isEmergency: false },
      { label: 'Washroom / Kitchen sink drain clogged', labelUrdu: 'کچن یا واش روم سنک بند ہو گیا ہے', inferredIssue: 'Drain Line Mechanical Snake Unclogging', costImpactPercent: -10, isEmergency: false },
    ]
  },
  electrical: {
    category: 'electrical',
    question: 'What is the electrical symptom at your premises?',
    questionUrdu: 'بجلی کا کیا مسئلہ پیش آ رہا ہے؟',
    options: [
      { label: 'Sparks / Burning smell from DB board or socket', labelUrdu: 'بریکر بورڈ سے چنگاریاں یا جلنے کی بو آ رہی ہے', inferredIssue: 'Emergency DB Breaker & Short Circuit Repair', costImpactPercent: 40, isEmergency: true },
      { label: 'UPS or Solar Inverter not switching to backup', labelUrdu: 'یو پی ایس یا سولر انورٹر بیٹری بیک اپ نہیں دے رہا', inferredIssue: 'UPS / Solar Inverter Wiring & Battery Check', costImpactPercent: 25, isEmergency: false },
      { label: 'Ceiling fan / SMD light switch board installation', labelUrdu: 'پنکھا یا نئی لائٹس فٹ کروانی ہیں', inferredIssue: 'Fan & Concealed Light Fitting', costImpactPercent: -25, isEmergency: false },
      { label: 'Single room power out while rest of house working', labelUrdu: 'صرف ایک کمرے کی لائٹ بند ہے', inferredIssue: 'Phase Load Balancer & Single Circuit Fix', costImpactPercent: -10, isEmergency: false },
    ]
  },
  appliance_repair: {
    category: 'appliance_repair',
    question: 'Which home appliance is malfunctioning?',
    questionUrdu: 'کونسی ہوم اپلائنس خراب ہے؟',
    options: [
      { label: 'Refrigerator not cooling in bottom compartment', labelUrdu: 'فریج نیچے ٹھنڈا نہیں کر رہا', inferredIssue: 'Refrigerator Defrost Sensor & Gas Check', costImpactPercent: 15, isEmergency: false },
      { label: 'Automatic washing machine not spinning or draining', labelUrdu: 'واشنگ مشین اسپن نہیں کر رہی', inferredIssue: 'Washing Machine Motor Belt & Drain Pump Repair', costImpactPercent: 10, isEmergency: false },
      { label: 'Microwave oven heating plate not working', labelUrdu: 'مائیکروویو گرم نہیں کر رہا', inferredIssue: 'Microwave Magnetron Tube Repair', costImpactPercent: -10, isEmergency: false },
    ]
  },
  mechanic: {
    category: 'mechanic',
    question: 'What is the roadside breakdown issue?',
    questionUrdu: 'گاڑی یا بائیک میں کیا مسئلہ ہے؟',
    options: [
      { label: 'Battery completely dead (Clicking sound / Jumpstart)', labelUrdu: 'بیٹری ڈیڈ ہے، جمپ سٹارٹ چاہیے', inferredIssue: 'Roadside Battery Jumpstart & Alternator Test', costImpactPercent: -10, isEmergency: true },
      { label: 'Tyre puncture / flat tyre on road', labelUrdu: 'ٹائر پنکچر ہو گیا ہے', inferredIssue: 'Emergency Tubeless Tyre Puncture & Stepney Change', costImpactPercent: -30, isEmergency: true },
      { label: 'Engine overheating / radiator coolant steaming', labelUrdu: 'گاڑی گرم ہو رہی ہے، ریڈی ایٹر سے دھواں', inferredIssue: 'Radiator Hose & Coolant Flush Service', costImpactPercent: 20, isEmergency: true },
    ]
  }
};

export const VoiceAssistantModal: React.FC = () => {
  const {
    voiceModalOpen,
    setVoiceModalOpen,
    processVoiceOrTextAI,
    isProcessingAI,
    lastAIResult,
    providers,
    setBookingModalProvider,
    setBookingIsEmergency,
    currency,
    language
  } = useApp();

  // Assistant Mode: 'live' (gemini-3.1-flash-live-preview) vs 'diagnostic' (guided tree)
  const [activeMode, setActiveMode] = useState<'live' | 'diagnostic'>('live');

  // Selected Pakistani operating city
  const [selectedCity, setSelectedCity] = useState<string>('karachi');

  // Live API Hook integration
  const live = useGeminiLive();
  const [liveTextInput, setLiveTextInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Diagnostic mode states
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoSpeakResponse, setAutoSpeakResponse] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customText, setCustomText] = useState('');
  const [selectedDiagnosisOption, setSelectedDiagnosisOption] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);

  // Sample prompt chips in English & Urdu/Roman Urdu
  const promptSuggestions = [
    { label: '⚡ Emergency Plumber (Pipe leak / Nal burst)', query: 'Mujhe emergency plumber chahiye kitchen pipe burst ho gaya hai pani beh raha hai' },
    { label: '🔌 Short circuit MCB breaker trip', query: 'Short circuit hua hai MCB trip ho rahi hai jaldi electrician bhejo' },
    { label: '❄️ AC cooling nahi kar raha gas leak', query: 'AC cooling nahi kar raha hai gas refill aur master service chahiye' },
    { label: '🚗 Car battery dead jumpstart', query: 'Car battery dead ho gayi hai roadside mechanic jumpstart chahiye' },
    { label: '🧹 Deep home & sofa shampoo cleaning', query: 'I want a deep home and sofa shampoo wash service in Karachi' },
    { label: '🛡️ Fixora Escrow payment security', query: 'Fixora Escrow payment security kaise kaam karti hai?' },
  ];

  // Auto-scroll chat feed in live mode
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [live.messages, live.currentModelTurnText]);

  // Clean up when modal closes
  useEffect(() => {
    if (!voiceModalOpen) {
      if (live.status === 'connected' || live.status === 'connecting') {
        live.disconnect();
      }
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [voiceModalOpen, live, isListening, isSpeaking]);

  // Initialize Web Speech API for diagnostic fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Accepts Urdu/Hindi/English accents smoothly

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
          setCustomText(current);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Text to speech playback helper for diagnostic mode
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setCustomText('');
      setSelectedDiagnosisOption(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleExecuteAI = async (queryToRun?: string) => {
    const q = queryToRun || customText || transcript;
    if (!q.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSelectedDiagnosisOption(null);
    const currentCityObj = PAKISTAN_CITIES.find(c => c.id === selectedCity);
    const result = await processVoiceOrTextAI(q, currentCityObj?.name || 'Karachi');

    if (result && autoSpeakResponse && result.spokenResponse) {
      speakText(result.spokenResponse);
    }
  };

  // Find Top verified providers matching the category & city
  const getMatchedProviders = (category?: CategoryId): ProviderProfile[] => {
    const cat = category || lastAIResult?.category || 'plumbing';
    const candidates = providers
      .filter(p => p.categoryId === cat)
      .sort((a, b) => {
        if (lastAIResult?.urgency === 'emergency') {
          if (a.emergencyReady && !b.emergencyReady) return -1;
          if (!a.emergencyReady && b.emergencyReady) return 1;
        }
        return b.rating - a.rating;
      });

    return candidates.slice(0, 3);
  };

  const handleDirectBookTechnician = (provider: ProviderProfile, isEmergency: boolean = false) => {
    setBookingIsEmergency(isEmergency);
    setBookingModalProvider(provider);
    setVoiceModalOpen(false);
  };

  // Detect likely category from live messages for smart pro dispatch
  const detectLiveCategory = (): CategoryId => {
    const fullConversation = live.messages.map(m => m.text).join(' ') + ' ' + live.currentModelTurnText;
    const lower = fullConversation.toLowerCase();
    if (lower.includes('ac') || lower.includes('cooling') || lower.includes('compressor') || lower.includes('gas')) return 'ac_repair';
    if (lower.includes('plumb') || lower.includes('leak') || lower.includes('pipe') || lower.includes('water') || lower.includes('tap') || lower.includes('motor')) return 'plumbing';
    if (lower.includes('electric') || lower.includes('short') || lower.includes('breaker') || lower.includes('spark') || lower.includes('ups') || lower.includes('wire')) return 'electrical';
    if (lower.includes('car') || lower.includes('battery') || lower.includes('tyre') || lower.includes('jumpstart') || lower.includes('puncture') || lower.includes('mechanic')) return 'mechanic';
    if (lower.includes('clean') || lower.includes('sofa') || lower.includes('wash') || lower.includes('carpet')) return 'cleaning';
    if (lower.includes('fridge') || lower.includes('washing machine') || lower.includes('microwave') || lower.includes('appliance')) return 'appliance_repair';
    return (lastAIResult?.category as CategoryId) || 'plumbing';
  };

  if (!voiceModalOpen) return null;

  const activeCity = PAKISTAN_CITIES.find(c => c.id === selectedCity) || PAKISTAN_CITIES[0];
  const matchedPros = getMatchedProviders();
  const benchmarkRate = lastAIResult ? getLocalizedBenchmark(lastAIResult.category, selectedCity) : null;
  const activeDiagTree = lastAIResult ? DIAGNOSTIC_TREES[lastAIResult.category] : null;

  let displayedCostRange = lastAIResult?.estimatedCostRange || (benchmarkRate ? benchmarkRate.formattedRangePkr : '₨ 1,500 - ₨ 3,000');
  let refinedTitle = lastAIResult?.problemTitle;
  let isRefinedEmergency = lastAIResult?.urgency === 'emergency';

  if (activeDiagTree && selectedDiagnosisOption !== null) {
    const opt = activeDiagTree.options[selectedDiagnosisOption];
    if (opt) {
      refinedTitle = opt.inferredIssue;
      if (opt.isEmergency !== undefined) {
        isRefinedEmergency = opt.isEmergency;
      }
      if (benchmarkRate) {
        const mult = 1 + (opt.costImpactPercent || 0) / 100;
        const adjMin = Math.round(((benchmarkRate.minPkr || 0) * mult) / 100) * 100;
        const adjMax = Math.round(((benchmarkRate.maxPkr || 0) * mult) / 100) * 100;
        displayedCostRange = `₨ ${(adjMin || 0).toLocaleString()} - ₨ ${(adjMax || 0).toLocaleString()}`;
      }
    }
  }

  const liveCategory = detectLiveCategory();
  const liveMatchedPros = getMatchedProviders(liveCategory);

  return (
    <div id="voice-assistant-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Radio className="w-5 h-5 animate-pulse text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Fixora Live Voice Assistant
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  gemini-3.1-flash-live-preview
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time two-way voice conversations with Live API (Urdu, Roman Urdu & English)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="close-voice-modal-btn"
              onClick={() => {
                live.disconnect();
                if (isListening && recognitionRef.current) recognitionRef.current.stop();
                if (isSpeaking) window.speechSynthesis?.cancel();
                setVoiceModalOpen(false);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            id="tab-live-voice"
            type="button"
            onClick={() => setActiveMode('live')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'live'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${live.status === 'connected' ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${live.status === 'connected' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
            </span>
            <span>Live Voice Call (Gemini 3.1 Flash)</span>
          </button>

          <button
            id="tab-diagnostic-tree"
            type="button"
            onClick={() => setActiveMode('diagnostic')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'diagnostic'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Diagnostic & Rate Triage</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Operating City Selector */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-bold">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Location Hub:</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {PAKISTAN_CITIES.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedCity(city.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    selectedCity === city.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {city.name} ({city.averageEtaMinutes}m ETA)
                </button>
              ))}
            </div>
          </div>

          {/* ==================== MODE 1: LIVE VOICE CONVERSATION ==================== */}
          {activeMode === 'live' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Live Status & Audio Visualizer Canvas Container */}
              <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden border border-slate-800 shadow-xl">
                
                {/* Background ambient glow according to speaking state */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                  {live.isModelSpeaking ? (
                    <div className="w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
                  ) : live.status === 'connected' && !live.isMicMuted ? (
                    <div className="w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl" />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-blue-600/10 blur-2xl" />
                  )}
                </div>

                {/* Connection Status Badge */}
                <div className="z-10 flex items-center gap-2 mb-4">
                  {live.status === 'connected' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>LIVE STREAMING ACTIVE (16kHz in / 24kHz out)</span>
                    </span>
                  ) : live.status === 'connecting' ? (
                    <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                      <span>CONNECTING TO GEMINI 3.1 FLASH LIVE...</span>
                    </span>
                  ) : live.status === 'error' ? (
                    <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>CONNECTION ERROR</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-indigo-400" />
                      <span>LIVE VOICE READY • TAP START TO TALK</span>
                    </span>
                  )}
                </div>

                {/* Main Interactive Circle / Waveform */}
                <div className="z-10 my-2 flex flex-col items-center">
                  {live.status === 'connected' ? (
                    <div className="flex flex-col items-center space-y-4">
                      {/* Responsive Audio Wave Bars */}
                      <div className="flex items-center justify-center gap-1.5 h-20 px-6 py-2 bg-slate-950/60 rounded-2xl border border-slate-800 backdrop-blur-md">
                        {[35, 55, 80, 45, 95, 60, 100, 70, 85, 40, 65, 50].map((baseHeight, i) => {
                          const level = live.isModelSpeaking ? live.modelLevel : live.micLevel;
                          const dynamicHeight = Math.max(12, Math.min(100, (baseHeight * (level || 20)) / 45));
                          const barColor = live.isModelSpeaking
                            ? 'bg-gradient-to-t from-indigo-500 to-cyan-400'
                            : live.isMicMuted
                            ? 'bg-slate-700'
                            : 'bg-gradient-to-t from-emerald-500 to-teal-300';

                          return (
                            <div
                              key={i}
                              className={`w-1.5 rounded-full transition-all duration-75 ${barColor}`}
                              style={{
                                height: `${dynamicHeight}%`,
                                minHeight: '8px'
                              }}
                            />
                          );
                        })}
                      </div>

                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-200">
                          {live.isModelSpeaking
                            ? '🔊 Gemini 3.1 Flash is speaking...'
                            : live.isMicMuted
                            ? '🔇 Microphone is muted'
                            : '🎙️ Listening... Speak naturally in English or Urdu'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Natural interruption supported • Say anything to interrupt
                        </p>
                      </div>

                      {/* Live Call Control Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          id="live-mute-btn"
                          type="button"
                          onClick={live.toggleMicMute}
                          className={`p-3 rounded-2xl transition font-bold text-xs flex items-center gap-2 cursor-pointer ${
                            live.isMicMuted
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                          title={live.isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                        >
                          {live.isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                          <span>{live.isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                        </button>

                        {live.isModelSpeaking && (
                          <button
                            id="live-stop-audio-btn"
                            type="button"
                            onClick={live.stopAllPlayback}
                            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-bold text-xs flex items-center gap-2 cursor-pointer"
                            title="Interrupt / Stop AI Speech"
                          >
                            <VolumeX className="w-4 h-4 text-amber-400" />
                            <span>Interrupt AI</span>
                          </button>
                        )}

                        <button
                          id="live-end-call-btn"
                          type="button"
                          onClick={live.disconnect}
                          className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
                          title="End Conversation"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span>End Call</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-3">
                      <button
                        id="start-live-voice-btn"
                        type="button"
                        onClick={live.connect}
                        disabled={live.status === 'connecting'}
                        className="w-20 h-20 rounded-3xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-indigo-500/30"
                      >
                        {live.status === 'connecting' ? (
                          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Mic className="w-9 h-9" />
                        )}
                      </button>

                      <div>
                        <span className="text-sm font-extrabold text-white block">
                          Start Live Voice Call
                        </span>
                        <span className="text-xs text-slate-400 max-w-sm block mt-1">
                          Have a direct, real-time voice conversation with Gemini 3.1 Flash Live about any home repair, plumbing leak, AC gas, or electrical emergency.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {live.errorMessage && (
                  <div className="z-10 mt-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-center">
                    {live.errorMessage}
                  </div>
                )}
              </div>

              {/* Spoken Prompts Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tap to speak / ask Gemini Live:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {promptSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      id={`live-prompt-chip-${idx}`}
                      onClick={() => {
                        if (live.status !== 'connected') {
                          live.connect();
                        }
                        live.sendTextMessage(item.query);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Subtitles & Conversation Transcript */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Live Conversation Transcript</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Model: gemini-3.1-flash-live-preview
                  </span>
                </div>

                <div
                  ref={chatScrollRef}
                  className="max-h-48 overflow-y-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs"
                >
                  {live.messages.length === 0 && !live.currentModelTurnText && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      {live.status === 'connected'
                        ? 'Listening for your voice... Say hello or describe your issue.'
                        : 'Tap "Start Live Voice Call" above to begin voice conversation.'}
                    </div>
                  )}

                  {live.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        <span className="font-bold">
                          {msg.role === 'user' ? 'You' : msg.role === 'model' ? 'Gemini 3.1 Flash' : 'System'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div
                        className={`p-2.5 rounded-2xl max-w-[85%] ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : msg.role === 'model'
                            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] rounded-lg'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Streaming live turn from Gemini */}
                  {live.currentModelTurnText && (
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-indigo-500 font-bold">
                        <span>Gemini 3.1 Flash (Speaking...)</span>
                      </div>
                      <div className="p-2.5 rounded-2xl max-w-[85%] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-indigo-400/40 rounded-bl-xs shadow-xs animate-pulse">
                        {live.currentModelTurnText}
                      </div>
                    </div>
                  )}
                </div>

                {/* Companion Text Input for Dual Voice & Text Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="live-text-input"
                    type="text"
                    value={liveTextInput}
                    onChange={e => setLiveTextInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && liveTextInput.trim()) {
                        if (live.status !== 'connected') live.connect();
                        live.sendTextMessage(liveTextInput);
                        setLiveTextInput('');
                      }
                    }}
                    placeholder={
                      live.status === 'connected'
                        ? 'Type a message to Gemini Live (or just speak)...'
                        : 'Type here or click Start Live Voice above...'
                    }
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <button
                    id="send-live-text-btn"
                    type="button"
                    onClick={() => {
                      if (liveTextInput.trim()) {
                        if (live.status !== 'connected') live.connect();
                        live.sendTextMessage(liveTextInput);
                        setLiveTextInput('');
                      }
                    }}
                    disabled={!liveTextInput.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Matched Verified Technicians in Live View */}
              {liveMatchedPros.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Available Technicians ({activeCity.name})</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      1-Click Escrow Booking
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {liveMatchedPros.slice(0, 2).map(pro => (
                      <div
                        key={pro.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={pro.avatar}
                            alt={pro.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{pro.name}</p>
                            <p className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500" />
                              {pro.rating} • {formatPrice(pro.hourlyRate, currency)}/hr
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          id={`live-book-pro-${pro.id}`}
                          onClick={() => handleDirectBookTechnician(pro, false)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shrink-0 transition cursor-pointer shadow-xs"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== MODE 2: DIAGNOSTIC TREE & BENCHMARKS ==================== */}
          {activeMode === 'diagnostic' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Microphone Interactive Zone */}
              <div className="flex flex-col items-center justify-center py-5 bg-slate-50 dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                {isListening && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-36 rounded-full bg-indigo-500/20 animate-ping opacity-60" />
                    <div className="w-52 h-52 rounded-full bg-indigo-400/20 animate-pulse" />
                  </div>
                )}

                <button
                  id="mic-record-btn"
                  onClick={toggleListening}
                  className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-rose-600/50 scale-105 ring-4 ring-rose-400/40 animate-pulse'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
                >
                  <Mic className="w-7 h-7" />
                </button>

                <div className="mt-3 text-center z-10">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {isListening ? 'Listening to your voice... Speak now in Urdu / English' : 'Tap Microphone to Speak or Describe Issue'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    AI will identify problem category, ask diagnostic follow-ups, and match verified pros in {activeCity.name}
                  </span>
                </div>

                {isListening && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {[40, 70, 90, 60, 100, 75, 45, 85, 95, 50, 80, 60].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-indigo-500 rounded-full animate-pulse"
                        style={{ height: `${h}%`, minHeight: `${(i % 5 + 1) * 8}px`, animationDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Text Input / Live Transcript */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    id="voice-text-input"
                    type="text"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleExecuteAI()}
                    placeholder="e.g. Bathroom pipe burst ho gaya hai emergency plumber chahiye..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <button
                    id="submit-ai-query-btn"
                    disabled={isProcessingAI || !customText.trim()}
                    onClick={() => handleExecuteAI()}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/20"
                  >
                    {isProcessingAI ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Diagnosing...</span>
                      </>
                    ) : (
                      <>
                        <span>Diagnose & Match</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preset Prompts Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Pakistani Voice Examples
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {promptSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      id={`prompt-chip-${idx}`}
                      onClick={() => {
                        setCustomText(item.query);
                        handleExecuteAI(item.query);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Result & Automated Provider Match Cards */}
              {lastAIResult && (
                <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  
                  {/* Diagnosis Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400">
                          Fixora AI Diagnosis
                        </span>
                        {isRefinedEmergency ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-rose-600" />
                            <span>15-Min Priority Dispatch</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Verified Pro Match
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {refinedTitle || `Service for ${lastAIResult.category}`}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Est. Market Rate ({activeCity.name})</span>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        {displayedCostRange}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Follow-up Diagnostic Questions Tree */}
                  {activeDiagTree && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-indigo-200 dark:border-indigo-900/70 space-y-2">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {activeDiagTree.question}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {activeDiagTree.questionUrdu}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {activeDiagTree.options.map((option, optIdx) => {
                          const isSelected = selectedDiagnosisOption === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              id={`diag-opt-${optIdx}`}
                              onClick={() => {
                                setSelectedDiagnosisOption(isSelected ? null : optIdx);
                                if (!isSelected && autoSpeakResponse) {
                                  speakText(`Refined issue to ${option.inferredIssue}. Estimated price updated.`);
                                }
                              }}
                              className={`p-2 rounded-xl text-left transition cursor-pointer border flex items-start gap-2 ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-400'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold block leading-tight">
                                  {option.label}
                                </span>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                  {option.labelUrdu}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Safety & Practical Advice */}
                  {lastAIResult.advice && (
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block mb-0.5">100% Price Protection & Safety Advice:</span>
                        <span className="text-[11px]">{lastAIResult.advice} Zero hidden fees guaranteed under Fixora Escrow.</span>
                      </div>
                    </div>
                  )}

                  {/* Top 3 Verified Nearby Technicians List with 1-Click Action */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Top 3 Verified Technicians in {activeCity.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Ranked by Distance, Rating & Response Time
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {matchedPros.map((pro, index) => (
                        <div
                          key={pro.id}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-indigo-400 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={pro.avatar}
                              alt={pro.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {pro.name}
                                </h4>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                                  CNIC Verified
                                </span>
                                {index === 0 && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold flex items-center gap-0.5">
                                    <Flame className="w-2.5 h-2.5 fill-amber-600" />
                                    Fastest Arrival
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  {pro.rating} ({pro.completedJobs}+ jobs)
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-bold">
                                  <Clock className="w-3 h-3" />
                                  {pro.etaMinutes || activeCity.averageEtaMinutes} mins ETA
                                </span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                                  {pro.experienceYears}y exp
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right hidden sm:block">
                              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono block">
                                {formatPrice(pro.hourlyRate, currency)}/hr
                              </span>
                              <span className="text-[10px] text-slate-400">Inspection: ₨ 500</span>
                            </div>

                            <button
                              type="button"
                              id={`book-pro-ai-btn-${pro.id}`}
                              onClick={() => handleDirectBookTechnician(pro, isRefinedEmergency)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer transition ${
                                isRefinedEmergency
                                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                              }`}
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>{isRefinedEmergency ? '15-Min Dispatch' : 'Book Pro'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retry button */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      id="ai-retry-btn"
                      onClick={() => {
                        setCustomText('');
                        setTranscript('');
                        setSelectedDiagnosisOption(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ask Another Query</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
