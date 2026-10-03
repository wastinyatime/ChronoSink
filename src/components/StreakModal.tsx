import React, { useState } from 'react';
import { X, Flame, Sparkles, Check, Gift, FastForward, Award, Shield } from 'lucide-react';
import { StreakData, MeaninglessBadge } from '../types';
import { MEANINGLESS_BADGES, getCurrentRank, getNextMilestoneBadge, USELESS_DAILY_REWARDS, saveStreakData } from '../services/streak';
import { sounds } from '../services/sound';

interface StreakModalProps {
  streakData: StreakData;
  onUpdateStreak: (updated: StreakData) => void;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  streakData,
  onUpdateStreak,
  onClose,
}) => {
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  const currentRank = getCurrentRank(streakData.currentStreak);
  const nextBadge = getNextMilestoneBadge(streakData.currentStreak);

  const handleClaimReward = () => {
    if (streakData.claimedRewardToday) return;
    sounds.playFanfare();
    const item = USELESS_DAILY_REWARDS[Math.floor(Math.random() * USELESS_DAILY_REWARDS.length)];
    setRewardMsg(`Claimed: "${item}"! Added to your collection of zero accomplishments.`);

    const updated: StreakData = {
      ...streakData,
      claimedRewardToday: true,
    };
    saveStreakData(updated);
    onUpdateStreak(updated);
  };

  const handleSimulateNextDay = () => {
    sounds.playPop(1.5);
    const updated: StreakData = {
      ...streakData,
      currentStreak: streakData.currentStreak + 1,
      longestStreak: Math.max(streakData.longestStreak, streakData.currentStreak + 1),
      claimedRewardToday: false,
    };
    saveStreakData(updated);
    onUpdateStreak(updated);
    setRewardMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-inner">
            <Flame className="w-8 h-8 fill-amber-500 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              <span className="font-mono text-amber-400">{streakData.currentStreak}</span> Day Procrastination Streak
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>Current Meaningless Rank:</span>
              <span className="text-amber-300 font-semibold">{currentRank.rankTitle}</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>Longest: <strong className="font-mono text-slate-200">{streakData.longestStreak} days</strong></span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto italic">
            "{currentRank.flavor}"
          </p>
        </div>

        {/* Milestone Bar to next badge */}
        {nextBadge && (
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Next Rank: <strong className="text-white font-medium">{nextBadge.rankTitle}</strong>
              </span>
              <span className="font-mono text-amber-400 tabular-nums">
                {nextBadge.requiredDays - streakData.currentStreak} days to unlock
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((streakData.currentStreak / nextBadge.requiredDays) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Claim Daily Useless Reward Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-800/40 to-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white">Daily Stagnation Reward</div>
              <div className="text-[11px] text-slate-400">
                {streakData.claimedRewardToday
                  ? 'Today\'s pointless reward has been claimed.'
                  : 'Claim your daily dose of zero-value digital memorabilia.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleClaimReward}
            disabled={streakData.claimedRewardToday}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              streakData.claimedRewardToday
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95 shadow-md shadow-amber-500/20'
            }`}
          >
            {streakData.claimedRewardToday ? 'Claimed Today' : 'Claim Reward'}
          </button>
        </div>

        {rewardMsg && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200 text-center animate-fade-in font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{rewardMsg}</span>
          </div>
        )}

        {/* Badges Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hall of Meaningless Digital Badges
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {MEANINGLESS_BADGES.filter((b) => streakData.currentStreak >= b.requiredDays).length} / {MEANINGLESS_BADGES.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {MEANINGLESS_BADGES.map((badge) => {
              const isUnlocked = streakData.currentStreak >= badge.requiredDays;

              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border transition-all text-left flex items-start gap-3 ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/30 border-slate-800/60 opacity-50'
                  }`}
                >
                  <div className="text-2xl shrink-0 p-1 bg-slate-900 rounded-lg border border-slate-800">
                    {badge.icon}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate">
                        {badge.name}
                      </span>
                      {isUnlocked && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <div className="text-[11px] font-medium text-amber-400/90 font-mono">
                      Rank: {badge.rankTitle} ({badge.requiredDays}d)
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {badge.meaninglessBenefit}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulation tool for instant verification */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Procrastinated every day without fail.</span>
          <button
            onClick={handleSimulateNextDay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-[11px]"
            title="Fast-forward one calendar day to see the next badge/rank"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Tomorrow (+1 Day)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
