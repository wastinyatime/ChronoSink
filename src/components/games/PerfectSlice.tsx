import React, { useRef, useState, useEffect } from 'react';
import { sounds } from '../../services/sound';
import { Scissors, RotateCcw, Award } from 'lucide-react';

interface Shape {
  name: string;
  color: string;
  borderColor: string;
  width: number;
  height: number;
}

const SHAPES: Shape[] = [
  { name: 'Silken Tofu', color: '#fef08a', borderColor: '#eab308', width: 220, height: 160 },
  { name: 'Red Velvet Cake', color: '#e11d48', borderColor: '#9f1239', width: 200, height: 200 },
  { name: '24K Gold Ingot', color: '#f59e0b', borderColor: '#d97706', width: 240, height: 120 },
  { name: 'Aged Cheddar', color: '#fb923c', borderColor: '#ea580c', width: 210, height: 170 },
  { name: 'Watermelon Slab', color: '#10b981', borderColor: '#047857', width: 230, height: 150 },
];

interface PerfectSliceProps {
  onSliceAttempt: () => void;
}

export const PerfectSlice: React.FC<PerfectSliceProps> = ({ onSliceAttempt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [sliceResult, setSliceResult] = useState<{
    ratioA: number;
    ratioB: number;
    rating: string;
    score: number;
  } | null>(null);

  const [bestScore, setBestScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('chronosink_best_slice') || '0', 10);
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragCurrentRef = useRef<{ x: number; y: number } | null>(null);

  const currentShape = SHAPES[shapeIndex];

  // Draw scene
  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const hw = currentShape.width / 2;
    const hh = currentShape.height / 2;

    // Draw Shape
    ctx.save();
    ctx.fillStyle = currentShape.color;
    ctx.strokeStyle = currentShape.borderColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    // Rounded rectangle shape
    const r = 12;
    ctx.beginPath();
    ctx.roundRect(cx - hw, cy - hh, currentShape.width, currentShape.height, r);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.stroke();

    // Subtle inner highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - hw + 4, cy - hh + 4, currentShape.width - 8, currentShape.height - 8, r - 2);
    ctx.stroke();
    ctx.restore();

    // Draw active slice drag line
    if (isDraggingRef.current && dragStartRef.current && dragCurrentRef.current) {
      const p1 = dragStartRef.current;
      const p2 = dragCurrentRef.current;

      ctx.save();
      // Laser glow
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f87171';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Blade inner white hot core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.restore();
    }
  };

  useEffect(() => {
    drawScene();
  }, [shapeIndex, currentShape]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDraggingRef.current = true;
    dragStartRef.current = { x, y };
    dragCurrentRef.current = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dragCurrentRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    drawScene();
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || !dragStartRef.current || !dragCurrentRef.current) {
      isDraggingRef.current = false;
      return;
    }

    const p1 = dragStartRef.current;
    const p2 = dragCurrentRef.current;
    isDraggingRef.current = false;

    // Minimum stroke length
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (dist < 40) {
      drawScene();
      return;
    }

    // Play blade whoosh sound
    sounds.playSlice();
    onSliceAttempt();

    // Calculate cut intersection with shape center
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Line equation from p1 to p2: A*x + B*y + C = 0
    const A = p2.y - p1.y;
    const B = p1.x - p2.x;
    const C = p2.x * p1.y - p1.x * p2.y;

    // Distance from center of shape to line
    const denom = Math.hypot(A, B);
    const distanceToCenter = Math.abs(A * cx + B * cy + C) / (denom || 1);

    // Max effective radius of the shape
    const maxRadius = Math.hypot(currentShape.width, currentShape.height) / 2;
    // Ratio deviation from center
    const deviation = Math.min(1, distanceToCenter / (maxRadius * 0.75));

    // Area distribution estimation
    const largerPortion = 50 + deviation * 48;
    const smallerPortion = 100 - largerPortion;

    const diff = largerPortion - 50;
    let rating = 'Catastrophic Asymmetry';
    let score = 50;

    if (diff < 0.8) {
      rating = 'Divine 50/50 Perfection!';
      score = 1000;
      sounds.playFanfare();
    } else if (diff < 2.5) {
      rating = 'Master Artisan Slice';
      score = 850;
    } else if (diff < 6) {
      rating = 'Satisfyingly Balanced';
      score = 650;
    } else if (diff < 14) {
      rating = 'Noticeably Lopsided';
      score = 350;
    }

    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('chronosink_best_slice', score.toString());
    }

    setSliceResult({
      ratioA: Math.round(smallerPortion * 10) / 10,
      ratioB: Math.round(largerPortion * 10) / 10,
      rating,
      score,
    });

    drawScene();
  };

  const handleNextShape = () => {
    setShapeIndex((prev) => (prev + 1) % SHAPES.length);
    setSliceResult(null);
    sounds.playPop(1.2);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full select-none">
      {/* Header */}
      <div className="mb-4 text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Perfect 50/50 Precision Slicer
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Target: <strong className="text-amber-400">{currentShape.name}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Drag your blade across to slice exactly in half</span>
          <span aria-hidden="true">·</span>
          <span>Best: <strong className="font-mono text-emerald-400 tabular-nums">{bestScore} pts</strong></span>
        </div>
      </div>

      {/* Slicing Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 w-full max-w-lg aspect-[4/3]">
        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Slice Result Overlay */}
        {sliceResult && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fade-in">
            <Award className="w-10 h-10 text-amber-400" />
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
              {sliceResult.ratioA}% / {sliceResult.ratioB}%
            </div>
            <p className="text-sm font-semibold text-amber-300">
              {sliceResult.rating}
            </p>
            <div className="text-xs text-slate-400">
              Score: <strong className="text-white font-mono">{sliceResult.score} pts</strong>
            </div>
            <button
              onClick={handleNextShape}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors uppercase tracking-wider"
            >
              <span>Next Object</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <button
          onClick={handleNextShape}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Switch Shape</span>
        </button>
      </div>
    </div>
  );
};
