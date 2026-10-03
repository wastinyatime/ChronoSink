import React, { useState, useEffect, useCallback } from 'react';
import { sounds } from '../../services/sound';
import { RotateCcw, Zap, Sparkles } from 'lucide-react';

interface Bubble {
  id: number;
  popped: boolean;
  type: 'normal' | 'golden' | 'rainbow' | 'mystery';
  fact?: string;
}

const USELESS_FACTS = [
  'Sloths can hold their breath underwater longer than dolphins.',
  'Banging your head against a wall burns 150 calories an hour (not recommended).',
  'A group of flamingos is officially called a "flamboyance".',
  'Pineapples take roughly two years to grow.',
  'Cows have best friends and get stressed when separated.',
  'The inventor of the Pringles can is buried in one.',
  'Sea otters hold hands while sleeping so they do not drift away.',
  'There are more fake flamingos in the world than real ones.',
];

const GRID_SIZE = 48; // 8 x 6

interface BubbleWrapProps {
  onPop: () => void;
}

export const BubbleWrap: React.FC<BubbleWrapProps> = ({ onPop }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [activeFact, setActiveFact] = useState<string | null>(null);

  const initGrid = useCallback(() => {
    const list: Bubble[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const rand = Math.random();
      let type: Bubble['type'] = 'normal';
      let fact: string | undefined;

      if (rand < 0.05) {
        type = 'golden';
      } else if (rand < 0.1) {
        type = 'rainbow';
      } else if (rand < 0.16) {
        type = 'mystery';
        fact = USELESS_FACTS[Math.floor(Math.random() * USELESS_FACTS.length)];
      }

      list.push({ id: i, popped: false, type, fact });
    }
    setBubbles(list);
    setActiveFact(null);
  }, []);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  const popSingleBubble = (id: number) => {
    setBubbles((prev) => {
      const current = prev.find((b) => b.id === id);
      if (!current || current.popped) return prev;

      onPop();

      if (current.type === 'golden') {
        sounds.playFanfare();
      } else {
        const pitch = 0.9 + Math.random() * 0.4;
        sounds.playPop(pitch);
      }

      if (current.fact) {
        setActiveFact(current.fact);
      }

      // Rainbow chain reaction
      if (current.type === 'rainbow') {
        const neighbors = [id - 1, id + 1, id - 8, id + 8];
        setTimeout(() => {
          neighbors.forEach((nId, idx) => {
            if (nId >= 0 && nId < GRID_SIZE) {
              setTimeout(() => {
                setBubbles((inner) =>
                  inner.map((b) => (b.id === nId ? { ...b, popped: true } : b))
                );
                sounds.playPop(1.2 + idx * 0.1);
                onPop();
              }, idx * 60);
            }
          });
        }, 100);
      }

      return prev.map((b) => (b.id === id ? { ...b, popped: true } : b));
    });
  };

  const handleSteamroll = () => {
    bubbles.forEach((b, idx) => {
      if (!b.popped) {
        setTimeout(() => {
          setBubbles((prev) => prev.map((item) => (item.id === b.id ? { ...item, popped: true } : item)));
          sounds.playPop(0.8 + (idx % 8) * 0.08);
          onPop();
        }, idx * 25);
      }
    });
  };

  const poppedCount = bubbles.filter((b) => b.popped).length;
  const progressPercent = Math.round((poppedCount / GRID_SIZE) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full select-none">
      {/* Title & stats header */}
      <div className="mb-6 text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Infinite Bubble Wrap Deluxe
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Popped: <strong className="font-mono text-amber-400 tabular-nums">{poppedCount}/{GRID_SIZE}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Satisfaction: <strong className="font-mono text-emerald-400 tabular-nums">{progressPercent}%</strong></span>
        </div>
      </div>

      {/* Fact reveal banner */}
      {activeFact && (
        <div className="mb-4 w-full max-w-lg p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{activeFact}</span>
        </div>
      )}

      {/* Bubble sheet container */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-sm">
        {/* Subtle grid pattern background */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 sm:gap-4">
          {bubbles.map((bubble) => {
            const isGolden = bubble.type === 'golden';
            const isRainbow = bubble.type === 'rainbow';
            const isMystery = bubble.type === 'mystery';

            return (
              <button
                key={bubble.id}
                onClick={() => popSingleBubble(bubble.id)}
                disabled={bubble.popped}
                className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all duration-150 flex items-center justify-center focus:outline-none ${
                  bubble.popped
                    ? 'scale-90 opacity-40 bg-slate-800/80 border border-slate-700/50 shadow-inner'
                    : isGolden
                    ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.4)] active:scale-95 hover:scale-105 animate-pulse'
                    : isRainbow
                    ? 'bg-gradient-to-br from-pink-500 via-indigo-500 to-emerald-400 shadow-[0_4px_12px_rgba(99,102,241,0.3)] active:scale-95 hover:scale-105'
                    : isMystery
                    ? 'bg-gradient-to-br from-violet-500 to-purple-700 shadow-[0_4px_12px_rgba(139,92,246,0.3)] active:scale-95 hover:scale-105'
                    : 'bg-gradient-to-b from-sky-400/30 to-sky-600/40 border border-sky-300/40 shadow-[0_4px_10px_rgba(56,189,248,0.15)] hover:scale-105 active:scale-95 backdrop-blur-md'
                }`}
                aria-label={`Bubble ${bubble.id + 1} ${bubble.popped ? 'popped' : 'unpopped'}`}
              >
                {!bubble.popped && (
                  <>
                    {/* Gloss reflection highlight */}
                    <div className="absolute top-1.5 left-2.5 w-3.5 h-2 rounded-full bg-white/60 blur-[0.5px] pointer-events-none transform -rotate-12" />
                    {isGolden && <span className="text-[10px] font-bold text-amber-950">★</span>}
                    {isRainbow && <span className="text-[10px] font-bold text-white">✦</span>}
                    {isMystery && <span className="text-[10px] font-bold text-white">?</span>}
                  </>
                )}

                {bubble.popped && (
                  <div className="w-4 h-4 rounded-full border border-slate-600/60 opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={initGrid}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Sheet</span>
        </button>

        <button
          onClick={handleSteamroll}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Steamroller (Pop All)</span>
        </button>
      </div>
    </div>
  );
};
