export type TabId = 'feed' | 'pulse' | 'button' | 'bubble' | 'sand' | 'slice' | 'oracle';

export interface TimeWasteStats {
  secondsSquandered: number;
  totalClicks: number;
  bubblesPopped: number;
  buttonPresses: number;
  slicesAttempted: number;
  pulseHits: number;
  feedItemsScrolled: number;
  glacialBoosts: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface MeaninglessBadge {
  id: string;
  name: string;
  rankTitle: string;
  requiredDays: number;
  icon: string;
  meaninglessBenefit: string;
  flavor: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
  history: string[];
  claimedRewardToday: boolean;
}
