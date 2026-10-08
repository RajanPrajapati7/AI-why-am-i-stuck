import React, { useState } from 'react';
import { X, CheckCircle2, Star, Sparkles } from 'lucide-react';

export const PostMortemModal = ({ isOpen, onClose, onResolve, isSubmitting }) => {
  const [whatActuallyFixedIt, setWhatActuallyFixedIt] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!whatActuallyFixedIt.trim()) {
      setError('Please provide a brief note on what actually fixed the problem.');
      return;
    }
    setError('');
    onResolve({
      whatActuallyFixedIt: whatActuallyFixedIt.trim(),
      reflectionNotes: reflectionNotes.trim(),
      userHelpfulnessRating: rating,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Mark Problem as Resolved
            </h2>
            <p className="text-xs text-slate-400">
              Capturing this post-mortem updates your cognitive profile to prevent future blockers.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              What actually fixed it? <span className="text-emerald-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Added credentials: true to the axios config and replaced wildcard origin with the exact frontend localhost URL."
              value={whatActuallyFixedIt}
              onChange={(e) => setWhatActuallyFixedIt(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Personal Reflection / Key Takeaway (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What mental model will you remember next time so you don't get stuck here again?"
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Diagnostic Helpfulness Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-500 hover:text-amber-400 transition-colors focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-2 font-mono">
                {rating === 5
                  ? '🎯 Highly accurate root cause'
                  : rating >= 4
                  ? '👍 Very helpful'
                  : 'Needs tuning'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all hover:shadow-emerald-500/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Record Resolution & Update Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
