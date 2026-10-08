import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { STUCK_TYPE_CONFIG, StuckTypeBadge } from '../components/StuckTypeBadge';
import {
  Compass,
  BarChart3,
  TrendingUp,
  Brain,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Clock,
  Tag,
  Sparkles,
} from 'lucide-react';

export const Analytics = () => {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/analytics/patterns');
      if (data.success) {
        setPatterns(data.patterns);
      }
    } catch (err) {
      console.error('Failed to load patterns', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.post('/analytics/refresh');
      if (data.success) {
        setPatterns(data.patterns);
      }
    } catch (err) {
      alert('Failed to refresh patterns.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Compass className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-slate-400 text-sm font-mono">
          Synthesizing cognitive growth patterns...
        </p>
      </div>
    );
  }

  const totalSessions = patterns?.totalSessionsCount || 0;
  const resolvedSessions = patterns?.resolvedSessionsCount || 0;
  const resolutionRate = totalSessions > 0 ? Math.round((resolvedSessions / totalSessions) * 100) : 0;
  const avgTime = patterns?.averageTimeToUnstuckMinutes || 15;

  const frequencies = patterns?.stuckTypeFrequencies || {};
  const maxFreq = Math.max(...Object.values(frequencies), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Meta-Learning Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Long-Term Learning Pattern Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Uncover the systemic reasons you get stuck. Track your cognitive blindspots over time.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Analyzing History...' : 'Re-synthesize Patterns'}</span>
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
            Total Problem Intakes
          </div>
          <div className="text-3xl font-extrabold text-white">{totalSessions}</div>
          <div className="text-xs text-slate-500 mt-1">Stuck sessions recorded</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
            Resolution Success Rate
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{resolutionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {resolvedSessions} of {totalSessions} completed with verified fix
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
            Avg Time to Resolution
          </div>
          <div className="text-3xl font-extrabold text-brand-400">{avgTime}m</div>
          <div className="text-xs text-slate-500 mt-1">Measured from diagnosis to fix</div>
        </div>
      </div>

      {/* Stuck Type Frequency Distribution */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Distribution of Stuck Types
            </h2>
          </div>
          <span className="text-xs text-slate-400">Taxonomy breakdown</span>
        </div>

        <div className="space-y-4">
          {Object.entries(STUCK_TYPE_CONFIG).map(([typeKey, config]) => {
            const count = frequencies[typeKey] || 0;
            const percentage = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
            const barWidth = Math.max(4, Math.round((count / maxFreq) * 100));

            return (
              <div key={typeKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <StuckTypeBadge type={typeKey} size="sm" />
                  </div>
                  <span className="font-mono text-slate-400">
                    <strong className="text-white">{count}</strong> ({percentage}%)
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      count > 0 ? 'bg-gradient-to-r from-brand-600 to-indigo-500' : 'bg-transparent'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI-Identified Recurring Blindspots & Recommendations */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            AI-Identified Cognitive Blindspots & Meta-Coaching
          </h2>
        </div>

        {(!patterns?.identifiedBlindspots || patterns.identifiedBlindspots.length === 0) ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No recurring blindspots detected yet. Record more stuck sessions to establish statistical patterns.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.identifiedBlindspots.map((blindspot, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Recurring Blindspot</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Frequency: {blindspot.frequency}x
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">
                  {blindspot.category}
                </h3>

                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{blindspot.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Technical Tags */}
      {patterns?.recurringTags && patterns.recurringTags.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
            <Tag className="w-4 h-4 text-brand-400" />
            <span>Most Frequent Problem Context Tags</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {patterns.recurringTags.map((t) => (
              <span
                key={t.tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
              >
                <span>#{t.tag}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-brand-300">
                  {t.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
