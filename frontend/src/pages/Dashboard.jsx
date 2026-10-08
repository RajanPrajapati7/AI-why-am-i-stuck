import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { StuckTypeBadge } from '../components/StuckTypeBadge';
import { DomainBadge } from '../components/DomainBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Compass,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, patternsRes] = await Promise.all([
        api.get('/sessions?limit=6'),
        api.get('/analytics/patterns'),
      ]);

      if (sessionsRes.data.success) {
        setSessions(sessionsRes.data.sessions);
      }
      if (patternsRes.data.success) {
        setPatterns(patternsRes.data.patterns);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeSessions = sessions.filter((s) => s.status !== 'RESOLVED' && s.status !== 'ABANDONED');
  const resolvedSessions = sessions.filter((s) => s.status === 'RESOLVED');

  const topStuckType = patterns?.stuckTypeFrequencies
    ? Object.entries(patterns.stuckTypeFrequencies).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cognitive Workspace Calibrated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Currently debugging as an <span className="text-brand-300 font-semibold">{user?.experienceLevel}</span> engineer.
              Whenever code or architecture feels locked, begin an atomic diagnostic sequence.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {user?.primaryTechStack?.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/stuck/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>I'm Stuck Right Now</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Diagnostic Sessions</span>
            <Brain className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {patterns?.totalSessionsCount || sessions.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Cognitive problem intakes</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Blockers Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {patterns?.resolvedSessionsCount || resolvedSessions.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Unstuck with verified actions</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Time to Unstuck</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {patterns?.averageTimeToUnstuckMinutes ? `${patterns.averageTimeToUnstuckMinutes}m` : '15m'}
          </div>
          <div className="text-xs text-slate-400 mt-1">From diagnosis to solution</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Top Stuck Pattern</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-semibold text-amber-300 truncate mt-1">
            {topStuckType && topStuckType[1] > 0 ? topStuckType[0].replace(/_/g, ' ') : 'None Detected'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {topStuckType && topStuckType[1] > 0 ? `${topStuckType[1]} occurrences` : 'Start diagnosing to identify'}
          </div>
        </div>
      </div>

      {/* Active Stuck Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Active Stuck Sessions ({activeSessions.length})
            </h2>
            <span className="text-xs text-slate-400">Needs clarification or action</span>
          </div>
          {activeSessions.length > 0 && (
            <Link to="/history" className="text-xs text-brand-400 hover:underline">
              View all
            </Link>
          )}
        </div>

        {activeSessions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
            <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No active stuck blockers!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Whenever you hit an ambiguous bug, architectural doubt, or concept gap, launch a diagnostic session.
            </p>
            <Link
              to="/stuck/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Launch First Diagnosis</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <div
                key={session._id}
                onClick={() => navigate(`/stuck/${session._id}`)}
                className="cursor-pointer p-5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-brand-500/40 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StatusBadge status={session.status} />
                  <DomainBadge domain={session.domain} />
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                  {session.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {session.diagnosis?.rootCauseSummary || session.problemStatement?.whatHappeningInstead}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <StuckTypeBadge type={session.diagnosis?.stuckType} size="sm" />
                  <span className="inline-flex items-center gap-1 text-xs text-brand-400 font-medium group-hover:translate-x-1 transition-transform">
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Resolutions */}
      {resolvedSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Resolutions</h2>
              <span className="text-xs text-slate-400">Captured post-mortems</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedSessions.slice(0, 4).map((session) => (
              <div
                key={session._id}
                onClick={() => navigate(`/stuck/${session._id}`)}
                className="cursor-pointer p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <StuckTypeBadge type={session.diagnosis?.stuckType} size="sm" />
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unstuck in {session.resolution?.timeToUnstuckMinutes || 15}m</span>
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white line-clamp-1 mt-1">
                  {session.title}
                </h3>

                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
                  <span className="text-emerald-400 font-semibold block mb-0.5">What fixed it:</span>
                  <span className="text-slate-400 line-clamp-2">
                    {session.resolution?.whatActuallyFixedIt || 'Completed action items'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
