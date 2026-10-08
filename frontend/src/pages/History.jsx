import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { StuckTypeBadge } from '../components/StuckTypeBadge';
import { DomainBadge } from '../components/DomainBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Compass,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const History = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (domainFilter) params.append('domain', domainFilter);
      params.append('page', page);
      params.append('limit', 12);

      const { data } = await api.get(`/sessions?${params.toString()}`);
      if (data.success) {
        setSessions(data.sessions);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch sessions history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [search, statusFilter, domainFilter, page]);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this session?')) {
      try {
        await api.delete(`/sessions/${sessionId}`);
        fetchSessions();
      } catch (err) {
        alert('Failed to delete session');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Session Archive & Reflection History
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Review past blockers, verified solutions, and post-mortem notes.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { label: 'All', value: '' },
            { label: 'Pending Clarification', value: 'QUESTIONS_PENDING' },
            { label: 'Plan Ready', value: 'PLAN_READY' },
            { label: 'Resolved', value: 'RESOLVED' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === filter.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Compass className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center">
          <p className="text-sm text-slate-400">No sessions match your active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session._id}
              onClick={() => navigate(`/stuck/${session._id}`)}
              className="cursor-pointer p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-brand-500/40 hover:bg-slate-900 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StatusBadge status={session.status} />
                  <DomainBadge domain={session.domain} />
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                  {session.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {session.diagnosis?.rootCauseSummary || session.problemStatement?.whatHappeningInstead}
                </p>

                {session.tags && session.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {session.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <StuckTypeBadge type={session.diagnosis?.stuckType} size="sm" />

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(e, session._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="p-1.5 text-brand-400 group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
