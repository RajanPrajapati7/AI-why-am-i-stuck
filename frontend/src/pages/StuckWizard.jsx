import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ArrowRight,
  Code2,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileCode,
  Layers,
  Wand2,
} from 'lucide-react';
import { DOMAIN_CONFIG } from '../components/DomainBadge';

const PRESET_TEMPLATES = [
  {
    name: 'React useEffect Infinite Re-render',
    domain: 'CODING_DEBUGGING',
    whatTryingToDo: 'Fetch user profile data and sync it into local state whenever the userId prop updates.',
    whatHappeningInstead: 'The component immediately enters a continuous re-render loop, freezing the browser tab with "Maximum update depth exceeded" error.',
    whatAlreadyTried: 'Added [userId] to the dependency array, then tried passing an inline userConfig object { id: userId }, which made the loop worse.',
    codeSnippetOrLogs: `useEffect(() => {\n  const config = { id: userId, timestamp: Date.now() };\n  fetchUser(config).then(res => setUser(res.data));\n}, [config]);`,
    techStackContext: ['React', 'JavaScript', 'Vite'],
  },
  {
    name: 'CORS & HTTP-only Cookie Block',
    domain: 'TOOLING_ENVIRONMENT',
    whatTryingToDo: 'Send a JWT authentication cookie from frontend (port 5173) to backend Express server (port 5000) during login.',
    whatHappeningInstead: 'Browser Network tab shows status 200 on login, but the Set-Cookie header is blocked with "This Set-Cookie was blocked because its domain had no dot prefix / Cross-Origin". Subsequent requests have no cookie.',
    whatAlreadyTried: 'Set cors({ origin: "*" }) on the Express server, added withCredentials: true on axios, but then Chrome gave an error: "The value of Access-Control-Allow-Origin must not be the wildcard * when the request credentials mode is include".',
    codeSnippetOrLogs: `// Express Server\napp.use(cors({ origin: "*" }));\n\n// React Client\naxios.post('/api/login', credentials, { withCredentials: true });`,
    techStackContext: ['Node.js', 'Express', 'React', 'CORS'],
  },
  {
    name: 'Async Mongoose Race Condition',
    domain: 'CODING_DEBUGGING',
    whatTryingToDo: 'Update user karma points and immediately calculate top leaderboard ranks in a single API call.',
    whatHappeningInstead: 'The returned leaderboard occasionally displays stale points from the previous state, even though the update query was called right before it.',
    whatAlreadyTried: 'Chained then() handlers and tried wrapping in setTimeout, but the stale data still surfaces under rapid test clicks.',
    codeSnippetOrLogs: `User.updateOne({ _id: id }, { $inc: { points: 10 } });\nconst top = await User.find().sort({ points: -1 }).limit(5);\nres.json(top);`,
    techStackContext: ['Node.js', 'MongoDB', 'Mongoose'],
  },
];

export const StuckWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [domain, setDomain] = useState('CODING_DEBUGGING');
  const [whatTryingToDo, setWhatTryingToDo] = useState('');
  const [whatHappeningInstead, setWhatHappeningInstead] = useState('');
  const [whatAlreadyTried, setWhatAlreadyTried] = useState('');
  const [codeSnippetOrLogs, setCodeSnippetOrLogs] = useState('');
  const [techStackContext, setTechStackContext] = useState(user?.primaryTechStack || ['React', 'Node.js']);
  const [tagInput, setTagInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyTemplate = (tpl) => {
    setDomain(tpl.domain);
    setWhatTryingToDo(tpl.whatTryingToDo);
    setWhatHappeningInstead(tpl.whatHappeningInstead);
    setWhatAlreadyTried(tpl.whatAlreadyTried);
    setCodeSnippetOrLogs(tpl.codeSnippetOrLogs);
    setTechStackContext(tpl.techStackContext);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/,/g, '');
      if (val && !techStackContext.includes(val)) {
        setTechStackContext([...techStackContext, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTechStackContext(techStackContext.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!whatTryingToDo.trim() || !whatHappeningInstead.trim() || !whatAlreadyTried.trim()) {
      setError('Please fill in all required problem description fields.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/sessions', {
        domain,
        whatTryingToDo: whatTryingToDo.trim(),
        whatHappeningInstead: whatHappeningInstead.trim(),
        whatAlreadyTried: whatAlreadyTried.trim(),
        codeSnippetOrLogs: codeSnippetOrLogs.trim(),
        techStackContext,
      });

      if (data.success && data.session?._id) {
        navigate(`/stuck/${data.session._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to initialize stuck diagnosis. Please verify your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 1: Cognitive Problem Intake</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Why Am I Stuck?
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Decompose your blocker into explicit invariants. This structured intake enables the AI to
          classify your stuck taxonomy rather than guessing.
        </p>
      </div>

      {/* Preset Quick-Fill Templates */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
          <Wand2 className="w-3.5 h-3.5 text-brand-400" />
          <span>Quick-Fill Real Engineering Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-brand-600/30 border border-slate-700/80 hover:border-brand-500/50 text-xs font-medium text-slate-200 transition-all text-left"
            >
              ⚡ {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Intake Form */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Domain Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Problem Domain <span className="text-brand-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(DOMAIN_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = domain === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDomain(key)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What trying to do */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              1. What are you trying to accomplish? <span className="text-brand-400">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              State the goal or invariant you want to establish. Avoid stating your attempted solution.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Authenticate user sessions across client port 5173 and backend port 5000 using HTTP-only cookies without storing tokens in localStorage."
              value={whatTryingToDo}
              onChange={(e) => setWhatTryingToDo(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* What happening instead */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              2. What is happening instead? <span className="text-brand-400">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Describe the unexpected behavior, error output, or frozen state.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Browser reports CORS origin mismatch error; the cookie is returned with Set-Cookie in DevTools, but subsequent requests omit it."
              value={whatHappeningInstead}
              onChange={(e) => setWhatHappeningInstead(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* What already tried */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              3. What have you already tried? <span className="text-brand-400">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Crucial: Tells the assistant which hypotheses to rule out so it doesn't give you answers you already know.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Tried setting cors({ origin: '*' }), tried passing withCredentials: true on axios, but that triggered a wildcard credential error."
              value={whatAlreadyTried}
              onChange={(e) => setWhatAlreadyTried(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Code snippet or logs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              4. Relevant Code Snippet or Error Logs (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="// Paste minimal snippet of the call site or console error stack trace"
              value={codeSnippetOrLogs}
              onChange={(e) => setCodeSnippetOrLogs(e.target.value)}
              className="w-full font-mono rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Tech Context Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              5. Relevant Technologies / Context Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {techStackContext.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type technology (e.g. Redux, Mongoose) and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-600/30 disabled:opacity-50 transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>
                {loading ? 'Analyzing Blocker & Diagnosing Stuck Type...' : 'Run Cognitive Diagnosis'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
