import React from 'react';
import { Clock, HelpCircle, CheckCircle2, Play, CheckCheck, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  SUBMITTED: {
    label: 'Submitted',
    icon: Clock,
    color: 'text-slate-400 bg-slate-800/80 border-slate-700',
  },
  DIAGNOSING: {
    label: 'Diagnosing',
    icon: HelpCircle,
    color: 'text-brand-400 bg-brand-500/10 border-brand-500/20 animate-pulse',
  },
  QUESTIONS_PENDING: {
    label: 'Clarification Needed',
    icon: HelpCircle,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  PLAN_READY: {
    label: 'Plan Ready',
    icon: Play,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Play,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  RESOLVED: {
    label: 'Resolved',
    icon: CheckCheck,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  ABANDONED: {
    label: 'Paused / Abandoned',
    icon: XCircle,
    color: 'text-slate-500 bg-slate-900 border-slate-800',
  },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: Clock,
    color: 'text-slate-400 bg-slate-800 border-slate-700',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
