import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReviewModal: React.FC = () => {
  const { reviewModalBooking, setReviewModalBooking, submitReview } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [satisfactionTags, setSatisfactionTags] = useState<string[]>([
    'Fast 15-Min Arrival',
    'Fair & Transparent Pricing',
    'Cleaned Up Work Area'
  ]);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Fast 15-Min Arrival']);

  if (!reviewModalBooking) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert('Please add a short comment regarding the service experience.');
      return;
    }

    submitReview(
      reviewModalBooking.id,
      rating,
      comment.trim(),
      selectedTags.join(', ') || reviewModalBooking.serviceTitle
    );

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // ignore
    }
  };

  return (
    <div id="review-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/80 bg-white/70">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>Rate & Review Service</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </h2>
            <p className="text-xs text-gray-500">
              Booking #{reviewModalBooking.id} • {reviewModalBooking.provider.name}
            </p>
          </div>

          <button
            onClick={() => setReviewModalBooking(null)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Star Rating Interactive Bar */}
          <div className="flex flex-col items-center justify-center p-5 rounded-3xl bg-white/60 border border-white/80 shadow-xs">
            <span className="text-xs font-bold text-gray-600 mb-3">
              How would you rate the service quality?
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(starValue => (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  className="p-1.5 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      starValue <= rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 mt-2">
              {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Outstanding & Professional'}
              {rating === 4 && '⭐️⭐️⭐️⭐️ Great Service'}
              {rating === 3 && '⭐️⭐️⭐️ Satisfactory Work'}
              {rating === 2 && '⭐️⭐️ Needs Improvement'}
              {rating === 1 && '⭐️ Poor Experience'}
            </span>
          </div>

          {/* Quick Satisfaction Tags */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">
              What went well?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Fast 15-Min Arrival',
                'Fair & Transparent Pricing',
                'Polite & Courteous',
                'Cleaned Up Work Area',
                'Genuine Spare Parts Used',
                'Expert Diagnostics'
              ].map((tag, idx) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white/80 border-white/90 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Review */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Write your detailed review
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Describe your experience with the technician (punctuality, tools, resolution)..."
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-gray-800 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/80 bg-white/70 flex items-center justify-end gap-3">
          <button
            onClick={() => setReviewModalBooking(null)}
            className="py-2.5 px-4 rounded-xl text-gray-500 hover:text-gray-900 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="submit-review-btn"
            onClick={handleSubmit}
            className="py-2.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Publish Verified Review
          </button>
        </div>
      </div>
    </div>
  );
};
