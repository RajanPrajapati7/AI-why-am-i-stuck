import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, Sparkles, Terminal } from 'lucide-react';

export const StillStuckModal = ({ isOpen, onClose, onRediagnose, isSubmitting }) => {
  const [whatHappenedWhenTried, setWhatHappenedWhenTried] = useState('');
  const [whatExpectedToHappen, setWhatExpectedToHappen] = useState('');
  const [whatActuallyHappened, setWhatActuallyHappened] = useState('');
  const [newErrorOrLogs, setNewErrorOrLogs] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!whatHappenedWhenTried.trim()) {
      setError('Please describe what happened when you tried the recommended steps.');
      return;
    }
    if (!whatExpectedToHappen.trim()) {
      setError('Please state what you expected to happen.');
      return;
    }
    if (!whatActuallyHappened.trim()) {
      setError('Please describe what actually happened instead.');
      return;
    }

    setError('');
    onRediagnose({
      whatHappenedWhenTried: whatHappenedWhenTried.trim(),
      whatExpectedToHappen: whatExpectedToHappen.trim(),
      whatActuallyHappened: whatActuallyHappened.trim(),
      newErrorOrLogs: newErrorOrLogs.trim(),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="still-stuck-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-brand-500/10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 id="still-stuck-title" className="text-xl font-bold text-white tracking-tight">
              I'm Still Stuck — Re-evaluate Hypothesis
            </h2>
            <p className="text-xs text-amber-300/90 font-medium mt-0.5">
              Let's re-evaluate the problem using what you discovered.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          In cognitive debugging, a failed initial attempt provides critical empirical evidence.
          The assistant will challenge its previous assumptions, revise the stuck type if necessary, and formulate a targeted second-layer action plan.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="field-what-happened"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              1. What happened when you tried the recommended steps? <span className="text-amber-400">*</span>
            </label>
            <textarea
              id="field-what-happened"
              rows={2}
              required
              disabled={isSubmitting}
              placeholder="e.g. I moved the config object out of render and into state, but now the component triggers a network timeout error..."
              value={whatHappenedWhenTried}
              onChange={(e) => setWhatHappenedWhenTried(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="field-what-expected"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                2. What did you expect to happen? <span className="text-amber-400">*</span>
              </label>
              <textarea
                id="field-what-expected"
                rows={2}
                required
                disabled={isSubmitting}
                placeholder="e.g. Expected the effect to run once on mount and receive user data."
                value={whatExpectedToHappen}
                onChange={(e) => setWhatExpectedToHappen(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="field-what-actually"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                3. What actually happened? <span className="text-amber-400">*</span>
              </label>
              <textarea
                id="field-what-actually"
                rows={2}
                required
                disabled={isSubmitting}
                placeholder="e.g. The loop stopped, but the promise rejected with status 401 Unauthorized."
                value={whatActuallyHappened}
                onChange={(e) => setWhatActuallyHappened(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="field-new-logs"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              4. New Error Logs / Output / Observations (Optional)
            </label>
            <div className="relative">
              <Terminal className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <textarea
                id="field-new-logs"
                rows={3}
                disabled={isSubmitting}
                placeholder="Paste any new console error messages, stack trace, or network response codes..."
                value={newErrorOrLogs}
                onChange={(e) => setNewErrorOrLogs(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 font-mono rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all hover:shadow-amber-500/30"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>{isSubmitting ? 'Re-evaluating Hypothesis...' : 'Re-diagnose Blocker'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
