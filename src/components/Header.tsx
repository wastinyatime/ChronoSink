import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Flame } from 'lucide-react';
import { TabId, StreakData } from '../types';
import { getCurrentRank } from '../services/streak';
import { AmbientNoiseControl } from './AmbientNoiseControl';

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerBossMode: () => void;
  onOpenCertificate: () => void;
  streakData: StreakData;
  onOpenStreak: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  onTriggerBossMode,
  onOpenCertificate,
  streakData,
  onOpenStreak,
}) => {
  const currentRank = getCurrentRank(streakData.currentStreak);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'feed', label: 'The Void Scroll' },
    { id: 'pulse', label: 'Orbit Tap' },
    { id: 'button', label: 'The Button' },
    { id: 'bubble', label: 'Bubble Wrap' },
    { id: 'sand', label: 'Sand Zen' },
    { id: 'slice', label: 'Precision Slice' },
    { id: 'oracle', label: 'The Oracle' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('feed')}
          className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors shrink-0 font-sans"
        >
          ChronoSink
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`whitespace-nowrap transition-colors py-1 ${
                  isActive
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Daily Procrastination Streak Counter */}
          <button
            onClick={onOpenStreak}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/50 hover:text-white transition-all shadow-xs whitespace-nowrap active:scale-95"
            title={`Daily Procrastination Streak: ${streakData.currentStreak} consecutive days (${currentRank.rankTitle}). Click to view badges & rewards.`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-400 shrink-0" />
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              {streakData.currentStreak}d
            </span>
            <span className="hidden lg:inline text-slate-400">· {currentRank.rankTitle}</span>
          </button>

          <button
            onClick={onOpenCertificate}
            className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
            title="Generate your official Procrastination Certificate"
          >
            Diploma
          </button>

          {/* Ambient Background Noise Control */}
          <AmbientNoiseControl />

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title={isMuted ? 'Sound is off' : 'Sound is on'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onTriggerBossMode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap"
            title="Emergency disguise! Shortcut: Press Esc or B"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Boss Key</span>
          </button>
        </div>
      </div>

      {/* Mobile nav carousel */}
      <div className="flex md:hidden items-center gap-3 overflow-x-auto pt-2.5 scrollbar-none border-t border-slate-900 mt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`text-xs whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
