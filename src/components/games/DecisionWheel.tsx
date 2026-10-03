import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../../services/sound';
import { Compass, RotateCw, Sparkles, HelpCircle } from 'lucide-react';

const EXCUSES = [
  'Clean desk for 45 minutes',
  'Watch a 3-hour video essay on a show you dislike',
  'Stare at the ceiling and sigh deeply',
  'Inspect refrigerator door shelves (5th time)',
  'Research vintage items you will never afford',
  'Reorganize playlists by emotional temperature',
  'Browse Wikipedia rabbit hole on obscure wars',
  'Pretend to read a work email very intensely',
];

interface DecisionWheelProps {
  onSpin: () => void;
}

export const DecisionWheel: React.FC<DecisionWheelProps> = ({ onSpin }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedExcuse, setSelectedExcuse] = useState<string | null>(null);

  // Coin toss state
  const [coinResult, setCoinResult] = useState<'HEADS (Do Nothing)' | 'TAILS (Do Nothing Later)' | null>(null);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);

  // 8-Ball state
  const [eightBallAnswer, setEightBallAnswer] = useState<string | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedExcuse(null);
    onSpin();

    // Wheel ticks
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sounds.playWheelTick();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 110);

    const randomAngle = 1440 + Math.floor(Math.random() * 360);
    const finalRot = rotation + randomAngle;
    setRotation(finalRot);

    setTimeout(() => {
      setIsSpinning(false);
      clearInterval(tickInterval);

      // Calculate slice
      const actualAngle = (360 - (finalRot % 360)) % 360;
      const sliceSize = 360 / EXCUSES.length;
      const index = Math.floor(actualAngle / sliceSize);
      setSelectedExcuse(EXCUSES[index % EXCUSES.length]);
      sounds.playFanfare();
    }, 3200);
  };

  const flipCoin = () => {
    if (isCoinFlipping) return;
    setIsCoinFlipping(true);
    setCoinResult(null);
    sounds.playCoinFlip();
    onSpin();

    setTimeout(() => {
      const res = Math.random() > 0.5 ? 'HEADS (Do Nothing)' : 'TAILS (Do Nothing Later)';
      setCoinResult(res);
      setIsCoinFlipping(false);
      sounds.playPop(1.5);
    }, 1200);
  };

  const shakeEightBall = () => {
    onSpin();
    sounds.playPop(0.9);
    const answers = [
      'Outlook bleak. Better take a nap.',
      'Signs point to checking social media again.',
      'Without a doubt: do not begin that task.',
      'As I see it, tomorrow is much better suited.',
      'Cannot predict now. Close your eyes and daydream.',
      'Reply hazy. Go make another cup of coffee.',
      'My sources say your bed misses you.',
    ];
    setEightBallAnswer(answers[Math.floor(Math.random() * answers.length)]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full select-none space-y-8">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          The Oracle of Procrastination
        </h2>
        <p className="text-xs text-slate-400">
          When paralyzed by responsibility, let fate choose your next unproductive distraction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl items-center">
        {/* The Wheel */}
        <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Wheel of Substandard Excuses
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Top pointer marker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-amber-400 drop-shadow-md" />

            {/* Spinning Wheel */}
            <div
              className="w-full h-full rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl relative"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3.2s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none',
              }}
            >
              {/* Slices rendered with conic gradient */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
                    #f59e0b 0deg 45deg,
                    #0ea5e9 45deg 90deg,
                    #ec4899 90deg 135deg,
                    #8b5cf6 135deg 180deg,
                    #10b981 180deg 225deg,
                    #f97316 225deg 270deg,
                    #6366f1 270deg 315deg,
                    #14b8a6 315deg 360deg
                  )`,
                }}
              />
              {/* Wheel center hub */}
              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-400 shadow-md">
                SPIN
              </div>
            </div>
          </div>

          {/* Wheel Result */}
          {selectedExcuse && (
            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 animate-fade-in font-medium max-w-xs">
              Oracle Command: <strong className="text-amber-400">{selectedExcuse}</strong>
            </div>
          )}

          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Consulting Destiny...' : 'Spin the Wheel'}</span>
          </button>
        </div>

        {/* The Coin Flipper & 8-Ball */}
        <div className="space-y-6">
          {/* Coin Toss Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              The Coin of Indecision
            </div>

            <div className="flex flex-col items-center justify-center min-h-[90px]">
              <button
                onClick={flipCoin}
                disabled={isCoinFlipping}
                className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-2 border-amber-200 shadow-[0_6px_15px_rgba(245,158,11,0.3)] flex items-center justify-center text-xs font-black text-amber-950 uppercase tracking-wider transition-transform ${
                  isCoinFlipping ? 'animate-bounce scale-110' : 'hover:scale-105 active:scale-95'
                }`}
              >
                {coinResult ? (coinResult.includes('HEADS') ? 'HEADS' : 'TAILS') : 'FLIP ME'}
              </button>
            </div>

            {coinResult && (
              <p className="text-xs font-semibold text-amber-300 animate-fade-in">
                {coinResult}
              </p>
            )}

            <button
              onClick={flipCoin}
              disabled={isCoinFlipping}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              {isCoinFlipping ? 'Flipping...' : 'Toss Coin'}
            </button>
          </div>

          {/* Sarcastic 8-Ball */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sarcastic 8-Ball of Stagnation
            </div>
            {eightBallAnswer ? (
              <p className="text-xs italic text-indigo-300 min-h-[32px] flex items-center justify-center">
                "{eightBallAnswer}"
              </p>
            ) : (
              <p className="text-xs text-slate-500 min-h-[32px] flex items-center justify-center">
                Ask a yes/no question about being productive...
              </p>
            )}
            <button
              onClick={shakeEightBall}
              className="w-full py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg transition-colors"
            >
              Consult 8-Ball
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
