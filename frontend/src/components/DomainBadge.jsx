import React from 'react';
import { Code2, Network, Terminal, BookOpen, Cpu } from 'lucide-react';

export const DOMAIN_CONFIG = {
  CODING_DEBUGGING: {
    label: 'Coding & Debugging',
    icon: Code2,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  ARCHITECTURE_DESIGN: {
    label: 'Architecture & Design',
    icon: Network,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  TOOLING_ENVIRONMENT: {
    label: 'Tooling & Config',
    icon: Terminal,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  CONCEPTUAL_LEARNING: {
    label: 'Conceptual Learning',
    icon: BookOpen,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  ALGORITHMS_LOGIC: {
    label: 'Algorithms & Logic',
    icon: Cpu,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
};

export const DomainBadge = ({ domain }) => {
  const config = DOMAIN_CONFIG[domain] || {
    label: domain,
    icon: Code2,
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
