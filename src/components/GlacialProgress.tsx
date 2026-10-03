import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../services/sound';
import { Sparkles, Hourglass, Zap, HelpCircle } from 'lucide-react';

interface GlacialProgressProps {
  onMeaninglessMilestone?: () => void;
  onFutileClick?: () => void;
}

const GLACIAL_PHASES = [
  'Allocating unused memory buffers for nothing in particular...',
  'Re-verifying pointless algorithmic invariants...',
  'Calibrating cosmic background apathy...',
  'Negotiating non-aggression pact with entropy...',
  'Simulating human patience coefficient...',
  'Buffering existential sighs...',
  'Synchronizing clock with a sundial on Pluto...',
  'Compressing zero into slightly smaller zeros...',
  'Generating profound anti-productivity momentum...',
  'Converting wasted moments into digital lint...',
  'Polishing inactive pixels...',
  'Calculating the exact mass of one thought...',
  'Confirming that nothing was done, successfully...',
];

export const GlacialProgress: React.FC<GlacialProgressProps> = ({
  onMeaninglessMilestone,
  onFutileClick,
}) => {
  // Glacial progress from 0.0000% to 100.0000%
  const [percent, setPercent] = useState<number>(() => {
    const saved = localStorage.getItem('chronosink_glacial_progress');
    return saved ? parseFloat(saved) : 14.8219;
  });

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [milestonePopup, setMilestonePopup] = useState<string | null>(null);
  const [turboCount, setTurboCount] = useState(0);
  const [turboWarning, setTurboWarning] = useState<string | null>(null);
  const cycleCountRef = useRef(0);

  // Glacial progress increment loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        // Very slow increment: ~0.004% every 400ms = ~1% every 100 seconds
        const delta = 0.0035 + Math.random() * 0.0025;
        let next = prev + delta;

        // Check for 100% rollover or 50% anticlimax
        if (next >= 100) {
          next = 0.0001;
          cycleCountRef.current += 1;
          sounds.playFanfare();
          setMilestonePopup(
            'The Meaningless Event has arrived! After infinite anticipation, absolutely nothing occurred. Progress reset to 0%.'
          );
          if (onMeaninglessMilestone) onMeaninglessMilestone();
        }

        localStorage.setItem('chronosink_glacial_progress', next.toFixed(4));
        return next;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onMeaninglessMilestone]);

  // Phase message rotation
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % GLACIAL_PHASES.length);
    }, 9000);
    return () => clearInterval(msgInterval);
  }, []);

  const handleFutileBoost = () => {
    sounds.playPop(1.4);
    if (onFutileClick) onFutileClick();

    setTurboCount((c) => c + 1);
    setPercent((p) => Math.min(99.9999, p + 0.012));

    const warnings = [
      'Glacial boost: +0.012% achieved at great personal cost.',
      'Manual acceleration detected. The universe remains indifferent.',
      'Warning: Aggressive waiting violates the spirit of pure idleness.',
      'You sped up this meaningless bar by 0.4 seconds. Proud of yourself?',
      'Careful, the hamsters running this progress bar need their sleep.',
    ];
    setTurboWarning(warnings[turboCount % warnings.length]);
    setTimeout(() => setTurboWarning(null), 3500);
  };

  const estimatedHoursRemaining = Math.max(0.1, ((100 - percent) * 1.6) / 60);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Glacial Operation in Progress
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-xs text-slate-400">
            Meaningless Event #{(cycleCountRef.current + 1)}
          </span>
        </div>

        {/* Glacial Percentage */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Status:</span>
          <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
            {percent.toFixed(4)}%
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5 shadow-inner">
        {/* Fill */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] relative overflow-hidden"
          style={{ width: `${Math.max(1.5, Math.min(100, percent))}%` }}
        >
          {/* Subtle slow creeping shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-full h-full animate-shimmer" />
        </div>
      </div>

      {/* Subtext, phase narrative & accelerator */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-start gap-1.5 min-w-0">
          <span className="text-amber-500 shrink-0">▸</span>
          <span className="truncate italic text-slate-300">
            {GLACIAL_PHASES[phaseIndex]}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="text-[11px] text-slate-500 tabular-nums">
            Est. meaningless arrival: ~{estimatedHoursRemaining.toFixed(1)}h
          </span>

          <button
            onClick={handleFutileBoost}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-all active:scale-95 whitespace-nowrap"
            title="Accelerate the glacial bar by an imperceptible fraction"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Futile Tap (+0.01%)</span>
          </button>
        </div>
      </div>

      {/* Micro warning feedback */}
      {turboWarning && (
        <div className="mt-2 text-[11px] text-amber-400/90 italic animate-fade-in flex items-center gap-1.5">
          <HelpCircle className="w-3 h-3 shrink-0" />
          <span>{turboWarning}</span>
        </div>
      )}

      {/* Milestone Modal Announcement */}
      {milestonePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">
              100% Meaningless Climax Reached!
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {milestonePopup}
            </p>
            <button
              onClick={() => setMilestonePopup(null)}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              Resume Glacial Waiting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
