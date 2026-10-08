import React from 'react';
import {
  AlertTriangle,
  HelpCircle,
  BrainCircuit,
  SlidersHorizontal,
  GitFork,
  Maximize2,
  EyeOff,
} from 'lucide-react';

export const STUCK_TYPE_CONFIG = {
  SYNTAX_OR_RUNTIME_DEFECT: {
    label: 'Syntax / Runtime Defect',
    icon: AlertTriangle,
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/25',
    description: 'Concrete runtime exception, null dereference, or syntax failure.',
  },
  CONCEPTUAL_GAP: {
    label: 'Conceptual Gap',
    icon: HelpCircle,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/25',
    description: 'Missing foundational knowledge of library, protocol, or lifecycle.',
  },
  MENTAL_MODEL_DISTORTION: {
    label: 'Mental Model Distortion',
    icon: BrainCircuit,
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/25',
    description: 'Operating under an incorrect assumption about how the runtime executes.',
  },
  ENVIRONMENT_OR_CONFIG_DRIFT: {
    label: 'Environment / Config Drift',
    icon: SlidersHorizontal,
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/25',
    description: 'CORS, port conflicts, missing variables, or version mismatch.',
  },
  ARCHITECTURAL_DEADLOCK: {
    label: 'Architectural Deadlock',
    icon: GitFork,
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/25',
    description: 'Circular dependencies, tight coupling, or unviable component tree.',
  },
  SCOPE_PARALYSIS: {
    label: 'Scope Paralysis',
    icon: Maximize2,
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/25',
    description: 'Trying to solve too many things at once without atomic decomposition.',
  },
  EDGE_CASE_BLINDSPOT: {
    label: 'Edge Case Blindspot',
    icon: EyeOff,
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/25',
    description: 'Boundary condition, race condition, or unhandled data edge case.',
  },
};

export const StuckTypeBadge = ({ type, showIcon = true, size = 'md' }) => {
  const config = STUCK_TYPE_CONFIG[type] || {
    label: type || 'Diagnosing...',
    icon: HelpCircle,
    bgColor: 'bg-slate-800',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-700',
  };

  const Icon = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
