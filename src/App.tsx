/**
 * ChronoSink - The Ultimate App to Waste People's Time
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TimeTicker } from './components/TimeTicker';
import { GlacialProgress } from './components/GlacialProgress';
import { OrbitTap } from './components/games/OrbitTap';
import { EndlessFeed } from './components/games/EndlessFeed';
import { ForbiddenButton } from './components/games/ForbiddenButton';
import { BubbleWrap } from './components/games/BubbleWrap';
import { SandPhysics } from './components/games/SandPhysics';
import { PerfectSlice } from './components/games/PerfectSlice';
import { DecisionWheel } from './components/games/DecisionWheel';
import { BossScreen } from './components/BossScreen';
import { CertificateModal } from './components/CertificateModal';
import { StreakModal } from './components/StreakModal';
import { TimeWastedChart } from './components/TimeWastedChart';
import { SearchConsoleModal } from './components/SearchConsoleModal';
import { TabId, TimeWasteStats, StreakData } from './types';
import { sounds } from './services/sound';
import { loadStreakData, saveStreakData } from './services/streak';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isBossMode, setIsBossMode] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showSearchConsole, setShowSearchConsole] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());

  // Time wasted state
  const [secondsSquandered, setSecondsSquandered] = useState<number>(() => {
    const saved = localStorage.getItem('chronosink_seconds');
    return saved ? parseFloat(saved) : 0;
  });

  const [stats, setStats] = useState<TimeWasteStats>(() => {
    const saved = localStorage.getItem('chronosink_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      secondsSquandered: 0,
      totalClicks: 0,
      bubblesPopped: 0,
      buttonPresses: 0,
      slicesAttempted: 0,
      pulseHits: 0,
      feedItemsScrolled: 0,
      glacialBoosts: 0,
    };
  });

  // Ticking time wasted clock
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSquandered((prev) => {
        const next = prev + 0.1;
        if (Math.floor(next) % 5 === 0) {
          localStorage.setItem('chronosink_seconds', next.toFixed(1));
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Save stats periodically
  useEffect(() => {
    localStorage.setItem('chronosink_stats', JSON.stringify(stats));
  }, [stats]);

  // Global Boss key listener: press Esc or B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B' || (e.key === 'Escape' && !isBossMode)) {
        // Ignore if user is typing in an input
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
        setIsBossMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBossMode]);

  const recordClick = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
    }));
  }, []);

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Boss Disguise Mode */}
      {isBossMode && <BossScreen onDismiss={() => setIsBossMode(false)} />}

      {/* Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          secondsSquandered={secondsSquandered}
          totalClicks={stats.totalClicks}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Meaningless Streak & Badges Modal */}
      {showStreakModal && (
        <StreakModal
          streakData={streakData}
          onUpdateStreak={(updated) => setStreakData(updated)}
          onClose={() => setShowStreakModal(false)}
        />
      )}

      {/* Search Console & SEO Deployment Assistant Modal */}
      {showSearchConsole && (
        <SearchConsoleModal
          onClose={() => setShowSearchConsole(false)}
        />
      )}

      {/* Strict 3-Zone Top Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          sounds.playPop(1.1);
          setActiveTab(tab);
          recordClick();
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTriggerBossMode={() => setIsBossMode(true)}
        onOpenCertificate={() => {
          sounds.playPop(1.2);
          setShowCertificate(true);
        }}
        streakData={streakData}
        onOpenStreak={() => {
          sounds.playPop(1.2);
          setShowStreakModal(true);
        }}
      />

      {/* Live Time Ticker & Humorous Equivalents */}
      <TimeTicker
        seconds={secondsSquandered}
        totalClicks={stats.totalClicks}
        showChart={showChart}
        onToggleChart={() => {
          sounds.playPop(1.1);
          setShowChart((prev) => !prev);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* D3 7-Day Time Wasted Chart */}
        {showChart && (
          <section aria-label="7-Day Time Wasted Analytics">
            <TimeWastedChart
              todaySeconds={secondsSquandered}
              todayClicks={stats.totalClicks}
            />
          </section>
        )}

        {/* The Glacial Progress System: Fills at an agonizingly slow pace */}
        <section aria-label="Glacial Progress Protocol">
          <GlacialProgress
            onMeaninglessMilestone={() => {
              setStats((prev) => ({
                ...prev,
                totalClicks: prev.totalClicks + 1,
              }));
            }}
            onFutileClick={() => {
              setStats((prev) => ({
                ...prev,
                totalClicks: prev.totalClicks + 1,
                glacialBoosts: prev.glacialBoosts + 1,
              }));
            }}
          />
        </section>

        {/* Active Time Wasting Mini-Game or Tool */}
        <section className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 sm:p-8 backdrop-blur-sm shadow-xl min-h-[520px]">
          {activeTab === 'feed' && (
            <EndlessFeed
              onScrollItem={() => {
                setStats((prev) => ({
                  ...prev,
                  feedItemsScrolled: prev.feedItemsScrolled + 1,
                }));
              }}
            />
          )}

          {activeTab === 'pulse' && (
            <OrbitTap
              onHit={() => {
                recordClick();
                setStats((prev) => ({
                  ...prev,
                  pulseHits: prev.pulseHits + 1,
                }));
              }}
            />
          )}

          {activeTab === 'button' && (
            <ForbiddenButton
              onPress={() => {
                recordClick();
                setStats((prev) => ({
                  ...prev,
                  buttonPresses: prev.buttonPresses + 1,
                }));
              }}
            />
          )}

          {activeTab === 'bubble' && (
            <BubbleWrap
              onPop={() => {
                recordClick();
                setStats((prev) => ({
                  ...prev,
                  bubblesPopped: prev.bubblesPopped + 1,
                }));
              }}
            />
          )}

          {activeTab === 'sand' && (
            <SandPhysics
              onInteract={() => {
                setStats((prev) => ({
                  ...prev,
                  totalClicks: prev.totalClicks + 1,
                }));
              }}
            />
          )}

          {activeTab === 'slice' && (
            <PerfectSlice
              onSliceAttempt={() => {
                recordClick();
                setStats((prev) => ({
                  ...prev,
                  slicesAttempted: prev.slicesAttempted + 1,
                }));
              }}
            />
          )}

          {activeTab === 'oracle' && (
            <DecisionWheel
              onSpin={() => {
                recordClick();
              }}
            />
          )}
        </section>
      </main>

      {/* Quiet, Anti-Slop Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <span>ChronoSink · Guaranteed 100% devoid of productive value</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sounds.playPop(1.2);
                setShowSearchConsole(true);
              }}
              className="text-amber-400/90 hover:text-amber-300 transition-colors font-medium"
            >
              Search Consoles &amp; SEO
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowCertificate(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Procrastination Diploma
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsBossMode(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Emergency Disguise (Esc)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
