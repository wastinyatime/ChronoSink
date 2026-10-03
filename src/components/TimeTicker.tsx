import React, { useMemo } from 'react';
import { Clock, BarChart3 } from 'lucide-react';

interface TimeTickerProps {
  seconds: number;
  totalClicks: number;
  showChart?: boolean;
  onToggleChart?: () => void;
}

export const TimeTicker: React.FC<TimeTickerProps> = ({
  seconds,
  totalClicks,
  showChart,
  onToggleChart,
}) => {
  const formattedTime = useMemo(() => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${hrs > 0 ? `${pad(hrs)}:` : ''}${pad(mins)}:${pad(secs)}.${ms}`;
  }, [seconds]);

  // Humorous equivalents based on elapsed time
  const equivalent = useMemo(() => {
    const s = Math.max(1, seconds);
    if (s < 15) {
      return 'Barely begun. Your responsibilities are still waiting politely.';
    }
    if (s < 45) {
      return `Equivalent to reading ${(s * 3.8).toFixed(0)} words of terms and conditions nobody reads.`;
    }
    if (s < 90) {
      return `You could have washed ${(s / 40).toFixed(1)} coffee mugs instead.`;
    }
    if (s < 180) {
      return `Roughly ${(s / 120).toFixed(1)} microwave burritos thoroughly heated.`;
    }
    if (s < 300) {
      return `In this time, ${(s / 18).toFixed(0)} unnecessary corporate Slack messages were typed.`;
    }
    if (s < 600) {
      return `Equivalent to ${(s / 240).toFixed(1)} pop songs listened to on repeat.`;
    }
    if (s < 1200) {
      return `You could have walked ${(s * 1.4).toFixed(0)} steps you will never take back.`;
    }
    return `Grandmaster tier. ${(s / 1320).toFixed(1)} episodes of a 90s sitcom squandered.`;
  }, [seconds]);

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-900/40 px-4 py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        {/* Wasted time display */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300 font-medium">Time Squandered:</span>
          <span className="font-mono text-sm font-bold text-amber-400 tabular-nums tracking-tight">
            {formattedTime}
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">
            <span className="font-mono font-semibold text-slate-200 tabular-nums">{totalClicks}</span> futile clicks
          </span>
        </div>

        {/* Humorous conversion without pill enclosure & Chart toggle */}
        <div className="flex items-center gap-3 text-slate-400">
          <span className="text-slate-500 hidden sm:inline">Equivalence:</span>
          <span className="italic text-slate-300 truncate max-w-sm">{equivalent}</span>

          {onToggleChart && (
            <button
              onClick={onToggleChart}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors whitespace-nowrap"
              title="Toggle 7-day D3 metrics chart"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{showChart ? 'Hide D3 Chart' : '7D D3 Chart'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
