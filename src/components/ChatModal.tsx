import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  Image as ImageIcon,
  Mic,
  Phone,
  CheckCheck,
  Paperclip,
  Smile,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
  Wallet,
  Info,
  HandCoins
} from 'lucide-react';
import { detectAndMaskContactInfo, CHAT_UNLOCK_FEE_PKR } from '../utils/antiBypass';
import { USD_TO_PKR_RATE } from '../utils/currency';

export const ChatModal: React.FC = () => {
  const {
    chatModalBooking,
    setChatModalBooking,
    chatMessages,
    sendChatMessage,
    currentUser,
    unlockedChatThreads,
    unlockChatThread,
    isChatUnlocked,
    setWalletModalOpen,
    setBargainingModalBooking,
    language
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [liveWarning, setLiveWarning] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [quickReplies] = useState([
    'Main gate par wait kar raha hoon.',
    'Please spare parts & tools sath le kar aaiye ga.',
    'Aap kitni der mein pohanch rahe hain?',
    'Main power switch off kar diya hai.',
    'Neeche pohanch kar call kar dein.'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!chatModalBooking || !currentUser) return null;

  const currentBookingId = chatModalBooking.id;
  const currentProviderId = chatModalBooking.providerId;
  const threadKey = currentBookingId || currentProviderId;

  const filteredMessages = chatMessages.filter(
    m => m.bookingId === currentBookingId || m.providerId === currentProviderId
  );

  // Count messages sent by this customer
  const customerMessagesSent = filteredMessages.filter(
    m => m.senderId === currentUser.id
  ).length;

  const isUnlocked = isChatUnlocked(threadKey) || isChatUnlocked(currentProviderId) || isChatUnlocked(currentBookingId);
  const isFirstMessageFree = customerMessagesSent === 0;
  const requiresUnlock = !isUnlocked && !isFirstMessageFree;

  const handleInputChange = (val: string) => {
    setMessageText(val);
    const detection = detectAndMaskContactInfo(val);
    if (detection.containsContact) {
      setLiveWarning(detection.warningMessage);
    } else {
      setLiveWarning(null);
    }
  };

  const handleSend = () => {
    if (!messageText.trim()) return;

    if (requiresUnlock) {
      // Must unlock first
      const res = unlockChatThread(threadKey);
      if (!res.success) {
        return;
      }
    }

    sendChatMessage(
      chatModalBooking.id,
      chatModalBooking.providerId,
      messageText.trim()
    );
    setMessageText('');
    setLiveWarning(null);
  };

  const handleQuickReply = (text: string) => {
    if (requiresUnlock) {
      const res = unlockChatThread(threadKey);
      if (!res.success) return;
    }
    sendChatMessage(
      chatModalBooking.id,
      chatModalBooking.providerId,
      text
    );
  };

  const handleSendSimulatedAudio = () => {
    if (requiresUnlock) {
      const res = unlockChatThread(threadKey);
      if (!res.success) return;
    }
    sendChatMessage(
      chatModalBooking.id,
      chatModalBooking.providerId,
      '🎙️ Voice Note (0:14) - "Please enter building B elevator directly"',
      undefined,
      true
    );
  };

  const handleUnlockClick = () => {
    setIsUnlocking(true);
    const res = unlockChatThread(threadKey);
    setIsUnlocking(false);
  };

  const userBalancePKR = Math.round((currentUser.walletBalance || 0) * USD_TO_PKR_RATE);

  return (
    <div id="chat-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A0F1D]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E1726] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] text-slate-100">
        
        {/* Top Header - Fixora Blue & Deep Black theme */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0A0F1D]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={chatModalBooking.provider.avatar}
                alt={chatModalBooking.provider.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-[#1565D8]/40 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A0F1D] shadow-xs" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">{chatModalBooking.provider.name}</h3>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1565D8]/20 text-[#3B82F6] border border-[#1565D8]/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {chatModalBooking.provider.title} • <span className="text-emerald-400 font-semibold">Ready to Assist</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => alert(`Calling ${chatModalBooking.provider.name} via Fixora VoIP Direct line.`)}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Fixora VoIP Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChatModalBooking(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Service Task Title ("Kaam Ka Naam") & Price Bargaining Bar */}
        <div className="bg-[#101F38] px-4 py-2.5 border-b border-slate-700/80 flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 block truncate">
              {language === 'ur'
                ? 'کام کا نام (Service Task)'
                : language === 'hi'
                ? 'सक्रिय कार्य (Active Task)'
                : 'Active Task'}
            </span>
            <span className="font-bold text-white text-xs truncate block">
              {chatModalBooking.serviceTitle}
            </span>
          </div>

          <button
            type="button"
            id="chat-open-bargaining-btn"
            onClick={() => setBargainingModalBooking(chatModalBooking)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition"
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>
              {language === 'ur'
                ? 'ریٹ کم کرائیں (Bargain)'
                : language === 'hi'
                ? 'मूलभाव करें (Bargain)'
                : 'Bargain Fare'}
            </span>
          </button>
        </div>

        {/* Anti-Bypass & Security Protection Notice Banner */}
        <div className="bg-[#0B2A4A]/70 px-4 py-2 border-b border-[#1565D8]/30 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-blue-200">
            <ShieldCheck className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>
              <strong>Fixora Escrow Shield:</strong> Direct phone/WhatsApp exchange is blocked for warranty safety.
            </span>
          </div>

          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] border border-emerald-500/40 shrink-0">
              <Unlock className="w-3 h-3" />
              Chat Unlocked
            </span>
          ) : isFirstMessageFree ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/40 shrink-0">
              🆓 1st Msg Free
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold text-[10px] border border-rose-500/40 shrink-0">
              <Lock className="w-3 h-3" />
              Unlock Required
            </span>
          )}
        </div>

        {/* Live Anti-Bypass Detection Alert Warning */}
        {liveWarning && (
          <div className="bg-amber-950/80 border-b border-amber-600/50 px-4 py-2 text-[11px] text-amber-200 flex items-center gap-2 animate-in slide-in-from-top-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="flex-1 leading-tight">{liveWarning}</p>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0A0F1D]/40 text-xs">
          {/* Security Notice */}
          <div className="text-center my-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full bg-slate-900/90 text-slate-400 border border-slate-800 shadow-sm">
              <Lock className="w-3 h-3 text-[#1565D8]" />
              End-to-End Escrow Protected Conversation
            </span>
          </div>

          {filteredMessages.map(msg => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    isMe
                      ? 'bg-[#1565D8] text-white rounded-tr-none shadow-md'
                      : 'bg-[#1E293B] text-slate-100 rounded-tl-none border border-slate-700/60 shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Monetization Lock Banner (After 1st Free Message) */}
        {requiresUnlock && (
          <div className="p-3.5 bg-gradient-to-r from-[#0B2A4A] to-[#14213D] border-t border-[#1565D8]/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1565D8]/30 flex items-center justify-center border border-[#1565D8]/50">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Unlock Unlimited Chat Thread</h4>
                  <p className="text-[11px] text-slate-300">
                    Pay once <strong>PKR {CHAT_UNLOCK_FEE_PKR}</strong> to chat freely with {chatModalBooking.provider.name}.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-400">PKR {CHAT_UNLOCK_FEE_PKR}</span>
                <span className="block text-[10px] text-slate-400">From Fixora Wallet</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleUnlockClick}
                disabled={isUnlocking}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1565D8] hover:bg-[#1255b8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1565D8]/30 transition cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isUnlocking ? 'Unlocking...' : `Unlock for PKR ${CHAT_UNLOCK_FEE_PKR}`}</span>
              </button>

              <button
                onClick={() => setWalletModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                <span>Balance: PKR {userBalancePKR}</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Prompts Bar */}
        <div className="px-3 py-2 bg-[#0A0F1D] border-t border-slate-800 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(qr)}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition-colors cursor-pointer"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-[#0A0F1D] flex items-center gap-2">
          <button
            onClick={handleSendSimulatedAudio}
            title="Send audio note"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={
              requiresUnlock
                ? `1st msg used. Type & send to unlock for PKR ${CHAT_UNLOCK_FEE_PKR}...`
                : isFirstMessageFree
                ? 'Type your free first message...'
                : 'Type instructions or problem details...'
            }
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#1E293B] border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#1565D8] shadow-xs"
          />

          <button
            id="send-chat-msg-btn"
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="p-2.5 rounded-2xl bg-[#1565D8] hover:bg-[#1255b8] disabled:opacity-50 text-white font-bold transition-all cursor-pointer shrink-0 shadow-md shadow-[#1565D8]/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
