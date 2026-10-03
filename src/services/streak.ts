import { MeaninglessBadge, StreakData } from '../types';

export const MEANINGLESS_BADGES: MeaninglessBadge[] = [
  {
    id: 'badge-1',
    name: 'Bronze Paperclip of Inactivity',
    rankTitle: 'Novice Loiterer',
    requiredDays: 1,
    icon: '📎',
    meaninglessBenefit: '+0.00% boost to daily cognitive clarity',
    flavor: 'You arrived, you accomplished nothing, and you left with pride.',
  },
  {
    id: 'badge-2',
    name: 'Silver Snore Insignia',
    rankTitle: 'Apprentice Idler',
    requiredDays: 2,
    icon: '💤',
    meaninglessBenefit: 'Allows you to sigh 4% louder at upcoming deadlines',
    flavor: 'Two consecutive days of steadfastly ignoring what actually matters.',
  },
  {
    id: 'badge-3',
    name: 'Golden Unopened Envelope',
    rankTitle: 'Journeyman Slacker',
    requiredDays: 3,
    icon: '✉️',
    meaninglessBenefit: 'Your unread email counter looks 12% more aesthetic',
    flavor: 'The seal remains unbroken. Important correspondence has been avoided.',
  },
  {
    id: 'badge-4',
    name: 'Medal of Unfinished Business',
    rankTitle: 'Master of Avoidance',
    requiredDays: 5,
    icon: '🎖️',
    meaninglessBenefit: 'Spontaneously invents 3 new reasons to start next Monday',
    flavor: 'Five straight days of discipline—specifically, the discipline of non-action.',
  },
  {
    id: 'badge-5',
    name: 'Crown of Pure Stasis',
    rankTitle: 'One-Week Stagnator',
    requiredDays: 7,
    icon: '👑',
    meaninglessBenefit: 'Your chair mold now permanently mirrors your spine',
    flavor: 'A full solar week of pure, unadulterated time dissipation.',
  },
  {
    id: 'badge-6',
    name: 'Diamond Paperweight',
    rankTitle: 'Grand Duke of Lethargy',
    requiredDays: 14,
    icon: '💎',
    meaninglessBenefit: 'Guaranteed to hold down papers you will never read',
    flavor: 'A fortnight of glorious unproductivity. Scholars are bewildered.',
  },
  {
    id: 'badge-7',
    name: 'Cosmic Lint Trophy',
    rankTitle: 'Supreme Voidwalker',
    requiredDays: 30,
    icon: '🌌',
    meaninglessBenefit: 'Transmutes wasted hours into infinite cosmic nothingness',
    flavor: 'One entire month. Responsibilities have accepted defeat and moved away.',
  },
  {
    id: 'badge-8',
    name: 'Transcendental Sundial',
    rankTitle: 'Mythic Entity of Non-Action',
    requiredDays: 100,
    icon: '⚡',
    meaninglessBenefit: 'Bends the flow of spacetime to make 5 minutes feel like 4 hours',
    flavor: 'You do not merely procrastinate; you are the living embodiment of procrastination.',
  },
];

const STORAGE_KEY = 'chronosink_streak_data';

export function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadStreakData(): StreakData {
  const today = getTodayDateStr();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data: StreakData = JSON.parse(raw);
      // Check date diff with last visit
      const last = data.lastVisitDate;
      if (last === today) {
        return data;
      }

      // Check if last visit was yesterday
      const lastDate = new Date(last);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // Consecutive visit!
        data.currentStreak += 1;
        data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
        data.lastVisitDate = today;
        data.claimedRewardToday = false;
        if (!data.history.includes(today)) {
          data.history.push(today);
        }
      } else if (diffDays > 1) {
        // Streak broken, reset to 1
        data.currentStreak = 1;
        data.lastVisitDate = today;
        data.claimedRewardToday = false;
        if (!data.history.includes(today)) {
          data.history.push(today);
        }
      }

      saveStreakData(data);
      return data;
    } catch {
      // fallback
    }
  }

  // Initial fresh user
  const initial: StreakData = {
    currentStreak: 1,
    longestStreak: 1,
    lastVisitDate: today,
    history: [today],
    claimedRewardToday: false,
  };
  saveStreakData(initial);
  return initial;
}

export function saveStreakData(data: StreakData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCurrentRank(currentStreak: number): MeaninglessBadge {
  // Find highest badge unlocked
  const unlocked = MEANINGLESS_BADGES.filter((b) => currentStreak >= b.requiredDays);
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : MEANINGLESS_BADGES[0];
}

export function getNextMilestoneBadge(currentStreak: number): MeaninglessBadge | null {
  const next = MEANINGLESS_BADGES.find((b) => currentStreak < b.requiredDays);
  return next || null;
}

export const USELESS_DAILY_REWARDS = [
  'Virtual Pocket Lint (Collector\'s Edition)',
  'A completely static 1x1 invisible PNG file',
  'Certificate of Having Kept Your Eyes Open',
  '0.0001 grams of simulated anti-ambition',
  'A complimentary deep exhale (Expires in 5s)',
  'Exclusive rights to say "I\'ll do it tomorrow"',
  'One free pass to ignore a low-priority notification',
];
