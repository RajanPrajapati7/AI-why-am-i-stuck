import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  BrainCircuit,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  SplitSquareVertical,
  SlidersHorizontal,
} from 'lucide-react';
import { STUCK_TYPE_CONFIG } from '../components/StuckTypeBadge';

export const Landing = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <SparklesIcon className="w-4 h-4" />
          <span>The Anti-Chatbot Cognitive Debugger</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Stop getting answers that{' '}
          <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
            miss the real problem
          </span>
          . Identify <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">why you're stuck</span>.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Generic AI chatbots dump code snippets that fix symptoms. This assistant isolates your 
          <strong className="text-slate-200"> cognitive blindspots</strong>, diagnoses your 
          <strong className="text-slate-200"> root cause</strong>, asks targeted Socratic questions, 
          and tracks your long-term engineering growth.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-600/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all"
          >
            <span>Start Cognitive Session</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800/80 transition-colors"
          >
            <span>Sign In to Your Workspace</span>
          </Link>
        </div>
      </section>

      {/* Comparison: Generic Chatbot vs. Cognitive Debugger */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Generic Chatbots Fail Technical Problem Solvers
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            When you're stuck, the bottleneck is almost never a lack of code syntax.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generic Chatbot */}
          <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 relative">
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Generic AI Chatbot (ChatGPT / Copilot)
            </div>
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Falls for the XY Problem:</strong> Blindly solves your stated sub-task instead of the real dilemma.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Code dump deluge:</strong> Spits out 80 lines of refactored code without pinpointing the broken invariant.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Zero metacognition:</strong> Forgets your blindspots; you make the same conceptual mistake next week.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Passive agreement:</strong> Validates flawed assumptions rather than challenging false premises.</span>
              </li>
            </ul>
          </div>

          {/* AI Why Am I Stuck Assistant */}
          <div className="p-6 rounded-2xl border border-brand-500/30 bg-brand-500/5 relative shadow-xl shadow-brand-500/5">
            <div className="flex items-center gap-2 text-brand-400 text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
              AI Why Am I Stuck Assistant
            </div>
            <ul className="space-y-3.5 text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 font-bold">✓</span>
                <span><strong>Stuck Type Taxonomy:</strong> Classifies whether it's a mental model bug, config drift, or conceptual gap.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 font-bold">✓</span>
                <span><strong>Socratic Clarification:</strong> Asks 1-3 targeted questions to test assumptions before prescribing any fix.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 font-bold">✓</span>
                <span><strong>Actionable Checklist:</strong> Step-by-step verification checklist with concrete tests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-400 font-bold">✓</span>
                <span><strong>Long-Term Pattern Tracking:</strong> Aggregates historical post-mortems into personalized learning analytics.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The 7 Stuck Taxonomy Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The 7 Cognitive Stuck Types
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Every technical obstacle stems from one of seven fundamental failure modes:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(STUCK_TYPE_CONFIG).map(([key, item]) => {
            const Icon = item.icon;
            return (
              <div
                key={key}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bgColor} border ${item.borderColor} flex items-center justify-center ${item.textColor} mb-3.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">{item.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Ready to break the cycle of recurring blockers?
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Experience structured cognitive debugging and turn every stuck session into long-term technical mastery.
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

function SparklesIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
