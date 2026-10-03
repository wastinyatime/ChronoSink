import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/sound';
import { Sparkles, Trophy, Zap, RefreshCw } from 'lucide-react';

interface OrbitTapProps {
  onHit: () => void;
}

export const OrbitTap: React.FC<OrbitTapProps> = ({ onHit }) => {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    return parseInt(localStorage.getItem('chronosink_best_streak') || '0', 10);
  });
  const [feedback, setFeedback] = useState<string>('Tap Space or click when the orb hits the zone');
  const [feedbackColor, setFeedbackColor] = useState<string>('text-slate-400');

  // Physics & Game state stored in refs for 60fps canvas loop
  const angleRef = useRef(0); // Current orb angle in radians
  const targetAngleRef = useRef(Math.PI * 0.5); // Target sector center angle
  const targetArcRef = useRef(0.42); // Arc half-width in radians
  const speedRef = useRef(0.04); // Angular velocity
  const isClockwiseRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streakRef = useRef(0);

  // Play ascending pentatonic tones for streaks
  const playHarmonicChime = (currentStreak: number) => {
    // Pentatonic scale multipliers
    const scale = [1.0, 1.125, 1.25, 1.5, 1.667, 2.0, 2.25, 2.5, 3.0];
    const pitch = scale[currentStreak % scale.length];
    sounds.playPop(pitch);
  };

  const relocateTarget = useCallback(() => {
    // Move target at least 1 radian away
    const current = targetAngleRef.current;
    const offset = (Math.PI * 0.5) + Math.random() * (Math.PI * 1.0);
    const newAngle = (current + offset) % (Math.PI * 2);
    targetAngleRef.current = newAngle;

    // Subtle speed variation to maintain interest without frustrating
    const baseSpeed = 0.038;
    const speedBonus = Math.min(0.02, (streakRef.current % 15) * 0.001);
    speedRef.current = baseSpeed + speedBonus;
  }, []);

  const handleAction = useCallback(() => {
    onHit();
    // Normalize angles to [0, 2PI)
    const twoPi = Math.PI * 2;
    const orb = ((angleRef.current % twoPi) + twoPi) % twoPi;
    const target = ((targetAngleRef.current % twoPi) + twoPi) % twoPi;

    // Shortest angular distance
    let diff = Math.abs(orb - target);
    if (diff > Math.PI) {
      diff = twoPi - diff;
    }

    const arc = targetArcRef.current;

    if (diff <= arc) {
      // SUCCESS HIT!
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      setStreak(newStreak);

      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem('chronosink_best_streak', newStreak.toString());
      }

      playHarmonicChime(newStreak);

      const isPerfect = diff <= arc * 0.35;
      if (isPerfect) {
        setFeedback('PERFECT! +1');
        setFeedbackColor('text-amber-400');
      } else {
        setFeedback('GOOD! +1');
        setFeedbackColor('text-emerald-400');
      }

      // Slightly reverse direction occasionally for delightful brain tickle
      if (newStreak > 4 && Math.random() < 0.25) {
        isClockwiseRef.current = !isClockwiseRef.current;
      }

      relocateTarget();
    } else {
      // MISS: Gentle reset, zero harsh stopping!
      streakRef.current = 0;
      setStreak(0);
      sounds.playClick(0.7);
      setFeedback('Missed! Keep rhythm...');
      setFeedbackColor('text-rose-400');
    }
  }, [bestStreak, onHit, relocateTarget]);

  // Keyboard handler (Space or Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  // 60fps Canvas Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Update orb position
      const dir = isClockwiseRef.current ? 1 : -1;
      angleRef.current += speedRef.current * dir;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = 120;

      // 1. Draw outer guide track
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw Target Arc Sector
      const tAngle = targetAngleRef.current;
      const tArc = targetArcRef.current;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, tAngle - tArc, tAngle + tArc);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Draw Orbiting Runner Orb
      const oAngle = angleRef.current;
      const ox = cx + Math.cos(oAngle) * radius;
      const oy = cy + Math.sin(oAngle) * radius;

      // Orb glow
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(ox, oy, 11, 0, Math.PI * 2);
      ctx.fill();

      // White inner core
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full select-none">
      {/* Title & Stats */}
      <div className="mb-4 text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Orbit Tap · The Infinite Zen Pulse
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Streak: <strong className="font-mono text-amber-400 tabular-nums text-sm">{streak}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Best Streak: <strong className="font-mono text-emerald-400 tabular-nums">{bestStreak}</strong></span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-500">No game overs, just endless flow</span>
        </div>
      </div>

      {/* Main Interactive Circle Area */}
      <div
        onClick={handleAction}
        className="relative cursor-pointer flex items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-2xl hover:border-slate-700 transition-colors w-full max-w-sm aspect-square"
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-full h-full block"
        />

        {/* Center Prompt / Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
            {streak}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">
            {streak > 20 ? 'Transcendence' : streak > 10 ? 'Hypnotized' : streak > 0 ? 'Flow State' : 'Tap Space / Click'}
          </span>
        </div>
      </div>

      {/* Status & Feedback message */}
      <div className="mt-5 text-center">
        <p className={`text-xs font-semibold tracking-wide transition-colors ${feedbackColor}`}>
          {feedback}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Pro-tip: Tap anywhere on the screen or press the Spacebar.
        </p>
      </div>
    </div>
  );
};
