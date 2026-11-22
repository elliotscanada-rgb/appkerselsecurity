import React, { useState } from 'react';
import { FaShieldAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

/**
 * CustodyChainTimeline
 *
 * Fully responsive custody tracking component:
 * - Mobile  : stacked accordion-style cards, tap to expand details
 * - Desktop : classic vertical timeline with connecting line
 *
 * Data comes from admin-defined custody steps on the consignment.
 */

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    label:      'Recorded',
    icon:       <FaCheckCircle />,
    dot:        'bg-green-500 ring-green-400',
    badge:      'bg-green-900/40 text-green-300 border border-green-600/40',
    line:       'bg-green-500',
    text:       'text-green-400',
  },
  pending: {
    label:      'Pending',
    icon:       <FaClock />,
    dot:        'bg-blue-500 ring-blue-400',
    badge:      'bg-blue-900/40 text-blue-300 border border-blue-600/40',
    line:       'bg-blue-500',
    text:       'text-blue-400',
  },
  evidence_required: {
    label:      'Evidence Required',
    icon:       <FaExclamationTriangle />,
    dot:        'bg-orange-500 ring-orange-400',
    badge:      'bg-orange-900/40 text-orange-300 border border-orange-600/40',
    line:       'bg-orange-500',
    text:       'text-orange-400',
  },
  not_established: {
    label:      'Not Established',
    icon:       <FaCircle />,
    dot:        'bg-gray-600 ring-gray-500',
    badge:      'bg-gray-800/60 text-gray-400 border border-gray-600/40',
    line:       'bg-gray-700',
    text:       'text-gray-500',
  },
};

const getConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.not_established;

// ─── Date formatter ───────────────────────────────────────────────────────────

function formatStepDate(raw) {
  if (!raw) return null;
  try {
    const iso = raw.includes('T') ? raw : raw + 'T00:00:00';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return raw;
  }
}

// ─── Single step — mobile card ────────────────────────────────────────────────

const MobileCard = ({ step, isLast }) => {
  const [open, setOpen] = useState(step.status === 'completed' || step.status === 'evidence_required');
  const cfg = getConfig(step.status);
  const date = formatStepDate(step.completion_date);

  return (
    <div className={`rounded-xl border overflow-hidden ${
      step.status === 'completed'
        ? 'border-green-700/40 bg-green-900/10'
        : step.status === 'evidence_required'
        ? 'border-orange-700/40 bg-orange-900/10'
        : step.status === 'pending'
        ? 'border-blue-700/40 bg-blue-900/10'
        : 'border-gray-700/40 bg-gray-800/30'
    }`}>
      {/* Header row — always visible, tappable */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        {/* Step number circle */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ring-2 ring-offset-1 ring-offset-gray-900 ${cfg.dot}`}>
          {step.step_number}
        </div>

        {/* Title + badge */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">{step.title}</p>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* Date + chevron */}
        <div className="flex flex-col items-end shrink-0 gap-1">
          {date && <span className="text-xs text-gray-500">{date}</span>}
          <span className="text-gray-500 text-xs">
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
      </button>

      {/* Expandable detail */}
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-700/40">
          <p className="text-sm text-gray-300 pt-3 leading-relaxed">{step.description}</p>
          {step.evidence_description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-400">Evidence: </span>
              {step.evidence_description}
            </p>
          )}
          {date && (
            <p className={`text-xs font-semibold ${cfg.text}`}>
              ✓ {date}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Single step — desktop timeline row ───────────────────────────────────────

const DesktopStep = ({ step, isLast }) => {
  const cfg = getConfig(step.status);
  const date = formatStepDate(step.completion_date);

  return (
    <div className="flex gap-5">
      {/* Left: dot + connecting line */}
      <div className="flex flex-col items-center w-10 shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-offset-2 ring-offset-gray-900 shadow-lg ${cfg.dot}`}>
          {step.step_number}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-2 min-h-[2.5rem] ${cfg.line} opacity-30`} />
        )}
      </div>

      {/* Right: content card */}
      <div className={`flex-1 mb-6 rounded-xl border p-4 ${
        step.status === 'completed'
          ? 'border-green-700/30 bg-green-900/10'
          : step.status === 'evidence_required'
          ? 'border-orange-700/30 bg-orange-900/10'
          : step.status === 'pending'
          ? 'border-blue-700/30 bg-blue-900/10'
          : 'border-gray-700/30 bg-gray-800/20'
      }`}>
        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <h4 className="text-base font-bold text-white leading-tight">{step.title}</h4>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-2">{step.description}</p>

        {/* Evidence */}
        {step.evidence_description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            <span className="font-semibold text-gray-400">Evidence required: </span>
            {step.evidence_description}
          </p>
        )}

        {/* Completion date */}
        {date && (
          <p className={`text-xs font-semibold ${cfg.text}`}>✓ Completed {date}</p>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const CustodyChainTimeline = ({ consignment }) => {
  const custodySteps = consignment?.custody_steps || [];

  const completedCount = custodySteps.filter(s => s.status === 'completed').length;
  const totalCount     = custodySteps.length;
  const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!custodySteps.length) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex items-center gap-2 mb-1">
          <FaShieldAlt className="text-cyan-400 text-lg" />
          <h3 className="text-base font-bold text-white">Consignment Tracking</h3>
        </div>
        <p className="text-sm text-gray-500">No custody steps defined yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FaShieldAlt className="text-cyan-400 text-lg shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Consignment Tracking
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Evidence-based custody chain
              </p>
            </div>
          </div>
          {/* Progress pill */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400">
              {completedCount}/{totalCount} steps
            </span>
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-cyan-400">{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* ── Mobile layout (< sm) ── */}
      <div className="sm:hidden px-3 py-3 space-y-2">
        {custodySteps.map((step, i) => (
          <MobileCard key={step.id ?? i} step={step} isLast={i === custodySteps.length - 1} />
        ))}
      </div>

      {/* ── Desktop layout (≥ sm) ── */}
      <div className="hidden sm:block px-6 pt-6 pb-2">
        {custodySteps.map((step, i) => (
          <DesktopStep key={step.id ?? i} step={step} isLast={i === custodySteps.length - 1} />
        ))}
      </div>
    </div>
  );
};

export default CustodyChainTimeline;
