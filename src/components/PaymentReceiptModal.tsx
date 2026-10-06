import React from 'react';
import { useApp } from '../context/AppContext';
import { formatPrice as utilsFormatPrice, USD_TO_PKR_RATE } from '../utils/currency';
import {
  X,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Building,
  QrCode
} from 'lucide-react';

export const PaymentReceiptModal: React.FC = () => {
  const { receiptModalBooking, setReceiptModalBooking, currency } = useApp();

  if (!receiptModalBooking) return null;

  const handlePrint = () => {
    window.print();
  };

  const bookingCurrency = receiptModalBooking.currency || currency || 'PKR';
  const fmt = (amtUSD: number) => utilsFormatPrice(amtUSD, bookingCurrency, true);

  return (
    <div id="receipt-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Tax Invoice & Receipt</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReceiptModalBooking(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content Printable Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 print:bg-white print:text-black">
          {/* Logo & Status */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-1.5 print:text-black">
                <span>Fixora</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono border border-indigo-200 dark:border-indigo-800">
                  OFFICIAL INVOICE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                NTN / Reg: 8934201-9 • Fixora Global Services
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>{receiptModalBooking.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                Ref: {receiptModalBooking.id}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <span className="text-slate-400 dark:text-slate-500 uppercase font-semibold block text-[10px]">Billed To:</span>
              <span className="font-bold text-slate-900 dark:text-white block">{receiptModalBooking.customerName}</span>
              <span className="text-slate-600 dark:text-slate-300">{receiptModalBooking.customerAddress}</span>
              <span className="text-slate-600 dark:text-slate-300 block">{receiptModalBooking.customerPhone}</span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 uppercase font-semibold block text-[10px]">Service Provider:</span>
              <span className="font-bold text-slate-900 dark:text-white block">{receiptModalBooking.provider.name}</span>
              <span className="text-slate-600 dark:text-slate-300">{receiptModalBooking.provider.title}</span>
              <span className="text-slate-600 dark:text-slate-300 block">License: {receiptModalBooking.provider.licenseNumber}</span>
            </div>
          </div>

          {/* Service Line Items */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/80 dark:bg-slate-800/80 shadow-xs">
            <div className="bg-slate-50 dark:bg-slate-800/90 px-4 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 grid grid-cols-12 border-b border-slate-200 dark:border-slate-700">
              <span className="col-span-8">Description</span>
              <span className="col-span-4 text-right">Amount ({bookingCurrency})</span>
            </div>

            <div className="p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-700/50">
              <div className="grid grid-cols-12 pt-1">
                <div className="col-span-8">
                  <span className="font-bold text-slate-900 dark:text-white block">{receiptModalBooking.serviceTitle}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Standard Labor & Inspection</span>
                </div>
                <div className="col-span-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {fmt(receiptModalBooking.baseFare)}
                </div>
              </div>

              {receiptModalBooking.emergencySurge > 0 && (
                <div className="grid grid-cols-12 pt-2 text-rose-600 dark:text-rose-400">
                  <div className="col-span-8">
                    <span className="font-bold block">⚡ 15-Minute Emergency Priority Dispatch</span>
                  </div>
                  <div className="col-span-4 text-right font-mono font-bold">
                    +{fmt(receiptModalBooking.emergencySurge)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-12 pt-2 text-slate-600 dark:text-slate-400">
                <div className="col-span-8">Govt GST / Service Tax (10%)</div>
                <div className="col-span-4 text-right font-mono font-medium">
                  +{fmt(receiptModalBooking.taxAmount)}
                </div>
              </div>

              {receiptModalBooking.discountAmount > 0 && (
                <div className="grid grid-cols-12 pt-2 text-emerald-600 dark:text-emerald-400">
                  <div className="col-span-8">Promo Discount</div>
                  <div className="col-span-4 text-right font-mono font-bold">
                    -{fmt(receiptModalBooking.discountAmount)}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50/80 dark:bg-slate-800/80 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>Total Amount Paid</span>
              <span className="text-base font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {fmt(receiptModalBooking.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment metadata */}
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 shadow-xs">
            <div>
              <span>Payment Mode: </span>
              <span className="font-bold text-slate-900 dark:text-white uppercase">
                {receiptModalBooking.paymentMethod} {receiptModalBooking.paymentDetails?.accountNumber ? `(${receiptModalBooking.paymentDetails.accountNumber})` : ''}
              </span>
            </div>
            <div>
              <span>Date: </span>
              <span className="font-bold text-slate-900 dark:text-white">{receiptModalBooking.scheduledDate}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/80 bg-white/70 flex items-center justify-between gap-3 print:hidden">
          <span className="text-[11px] text-gray-400">Thank you for choosing ServiSync</span>
          <button
            onClick={() => setReceiptModalBooking(null)}
            className="py-2 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
