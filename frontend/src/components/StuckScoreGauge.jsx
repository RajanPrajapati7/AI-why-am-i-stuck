import React from 'react';
import { Gauge, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';

// ─────────────────────────────────────────────
// Severity config — colours + labels + icon
// ─────────────────────────────────────────────
export const SEVERITY_CONFIG = {
  MILD_BLOCKER: {
    label: 'Mild Blocker',
    description: 'A fast, mechanical fix. The path forward is clear.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    barColor: 'bg-emerald-500',
    trackColor: 'bg-emerald-500/15',
    icon: ShieldCheck,
    stroke: '#34d399',   // emerald-400
  },
  MODERATE_IMPASSE: {
    label: 'Moderate Impasse',
    description: 'A conceptual or mental-model adjustment is needed. Work through the action plan.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    barColor: 'bg-amber-500',
    trackColor: 'bg-amber-500/15',
    icon: Zap,
    stroke: '#fbbf24',   // amber-400
  },
  CRITICAL_DEADLOCK: {
    label: 'Critical Deadlock',
    description: 'Structural or scope issue. Decompose into atomic slices before proceeding.',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    barColor: 'bg-rose-500',
    trackColor: 'bg-rose-500/15',
    icon: ShieldAlert,
    stroke: '#f87171',   // rose-400
  },
};

const getSeverityFromScore = (score) => {
  if (score <= 35) return 'MILD_BLOCKER';
  if (score <= 65) return 'MODERATE_IMPASSE';
  return 'CRITICAL_DEADLOCK';
};

// ─────────────────────────────────────────────
// SeverityBadge — inline pill
// ─────────────────────────────────────────────
export const SeverityBadge = ({ severityLevel, score }) => {
  const key = severityLevel || getSeverityFromScore(score ?? 50);
  const cfg = SEVERITY_CONFIG[key] || SEVERITY_CONFIG.MODERATE_IMPASSE;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider
        ${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────
// StuckScoreArc — SVG arc gauge for Workspace
// ─────────────────────────────────────────────
export const StuckScoreArc = ({ score, severityLevel }) => {
  const safeScore = typeof score === 'number' ? Math.min(100, Math.max(0, score)) : null;
  const key = severityLevel || (safeScore !== null ? getSeverityFromScore(safeScore) : 'MODERATE_IMPASSE');
  const cfg = SEVERITY_CONFIG[key] || SEVERITY_CONFIG.MODERATE_IMPASSE;

  // Arc maths — half-circle, radius 38, centre 50,54
  const r = 38;
  const cx = 50;
  const cy = 54;
  const circumference = Math.PI * r;           // half-circle arc length
  const progress = safeScore !== null ? safeScore / 100 : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Arc SVG */}
      <div className="relative w-28 h-16">
        <svg viewBox="0 0 100 58" className="w-full h-full overflow-visible">
          {/* Track arc */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
            fill="none"
            stroke={cfg.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Score number centred below the arc apex */}
        <div className="absolute inset-0 flex items-end justify-center pb-0">
          <span className={`text-2xl font-extrabold leading-none ${cfg.color}`}>
            {safeScore !== null ? safeScore : '—'}
          </span>
        </div>
      </div>

      {/* /100 label */}
      <span className="text-[10px] font-mono text-slate-500 -mt-1">/ 100</span>
    </div>
  );
};

// ─────────────────────────────────────────────
// StuckScoreBar — compact horizontal bar for cards
// ─────────────────────────────────────────────
export const StuckScoreBar = ({ score, severityLevel, showLabel = true }) => {
  const safeScore = typeof score === 'number' ? Math.min(100, Math.max(0, score)) : null;
  const key = severityLevel || (safeScore !== null ? getSeverityFromScore(safeScore) : 'MODERATE_IMPASSE');
  const cfg = SEVERITY_CONFIG[key] || SEVERITY_CONFIG.MODERATE_IMPASSE;

  if (safeScore === null) return null;

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Stuck Score
          </span>
          <span className={`text-[11px] font-bold font-mono ${cfg.color}`}>
            {safeScore}
            <span className="text-slate-600">/100</span>
          </span>
        </div>
      )}
      <div className={`h-1.5 w-full rounded-full ${cfg.trackColor}`}>
        <div
          className={`h-1.5 rounded-full ${cfg.barColor} transition-all duration-500`}
          style={{ width: `${safeScore}%` }}
        />
      </div>
      {showLabel && (
        <SeverityBadge severityLevel={key} />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// StuckScorePanel — full card for Workspace Stage 1
// ─────────────────────────────────────────────
export const StuckScorePanel = ({ score, severityLevel, isLoading = false }) => {
  const isNumeric = typeof score === 'number' && !isNaN(score);
  const safeScore = isNumeric ? Math.min(100, Math.max(0, Math.round(score))) : null;
  const key = severityLevel || (safeScore !== null ? getSeverityFromScore(safeScore) : 'MODERATE_IMPASSE');
  const cfg = SEVERITY_CONFIG[key] || SEVERITY_CONFIG.MODERATE_IMPASSE;

  return (
    <div
      className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 transition-all
        ${cfg.bgColor} ${cfg.borderColor}`}
    >
      {/* Arc gauge */}
      <div className="flex-shrink-0">
        <StuckScoreArc score={safeScore} severityLevel={key} />
      </div>

      {/* Text explanation */}
      <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cognitive Stuck Score
          </span>
          <SeverityBadge severityLevel={key} score={safeScore} />
        </div>
        <p className={`text-sm font-semibold ${cfg.color}`}>
          {cfg.label} {safeScore !== null ? `(${safeScore}/100)` : ''}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
          {safeScore !== null ? cfg.description : 'Calculating impasse severity and cognitive friction...'}
        </p>
        {/* Mini track bar */}
        <div className={`h-1.5 w-full rounded-full ${cfg.trackColor}`}>
          <div
            className={`h-1.5 rounded-full ${cfg.barColor} transition-all duration-700`}
            style={{ width: `${safeScore !== null ? safeScore : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};
