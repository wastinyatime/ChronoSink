import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sounds } from '../../services/sound';
import { Trash2, ArrowUpDown } from 'lucide-react';

type ElementType = 'sand' | 'water' | 'fire' | 'plant' | 'rock' | 'eraser';

interface ElementDef {
  id: ElementType;
  label: string;
  color: string;
  colorCode: number; // Hex encoded or palette
}

const ELEMENTS: ElementDef[] = [
  { id: 'sand', label: 'Golden Sand', color: 'bg-amber-400', colorCode: 0xf59e0b },
  { id: 'water', label: 'Ocean Water', color: 'bg-sky-500', colorCode: 0x0284c7 },
  { id: 'fire', label: 'Blaze / Lava', color: 'bg-rose-500', colorCode: 0xef4444 },
  { id: 'plant', label: 'Living Moss', color: 'bg-emerald-500', colorCode: 0x10b981 },
  { id: 'rock', label: 'Bedrock', color: 'bg-slate-400', colorCode: 0x94a3b8 },
  { id: 'eraser', label: 'Void Eraser', color: 'bg-slate-800', colorCode: 0x000000 },
];

const WIDTH = 140;
const HEIGHT = 90;

interface SandPhysicsProps {
  onInteract: () => void;
}

export const SandPhysics: React.FC<SandPhysicsProps> = ({ onInteract }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedElement, setSelectedElement] = useState<ElementType>('sand');
  const [brushSize, setBrushSize] = useState<number>(2);
  const [invertedGravity, setInvertedGravity] = useState<boolean>(false);
  const [particleCount, setParticleCount] = useState<number>(0);

  // Grid storage: 0 = empty, otherwise contains element ID or color index
  const gridRef = useRef<Uint8Array>(new Uint8Array(WIDTH * HEIGHT));
  const isMouseDownRef = useRef<boolean>(false);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Element ID to numerical representation:
  // 0: Empty, 1: Sand, 2: Water, 3: Fire, 4: Plant, 5: Rock
  const typeToId: Record<ElementType, number> = {
    eraser: 0,
    sand: 1,
    water: 2,
    fire: 3,
    plant: 4,
    rock: 5,
  };

  const colors = [
    [15, 23, 42],   // 0: background slate-900
    [245, 158, 11], // 1: sand
    [14, 165, 233], // 2: water
    [239, 68, 68],  // 3: fire
    [16, 185, 129], // 4: plant
    [148, 163, 184] // 5: rock
  ];

  // Clear canvas
  const handleClear = () => {
    gridRef.current.fill(0);
    setParticleCount(0);
    sounds.playPop(0.8);
  };

  // Stamp brush onto grid
  const applyBrush = useCallback(
    (gridX: number, gridY: number, elem: ElementType, size: number) => {
      const grid = gridRef.current;
      const elemVal = typeToId[elem];
      let placed = 0;

      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          if (dx * dx + dy * dy <= size * size) {
            const x = gridX + dx;
            const y = gridY + dy;
            if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
              const idx = y * WIDTH + x;
              if (elem === 'eraser' || grid[idx] === 0 || elem === 'rock') {
                grid[idx] = elemVal;
                placed++;
              }
            }
          }
        }
      }
      if (placed > 0) {
        onInteract();
      }
    },
    [onInteract]
  );

  // Simulation step
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(WIDTH, HEIGHT);
    const data = imgData.data;

    const updatePhysics = () => {
      const grid = gridRef.current;
      const dir = invertedGravity ? -1 : 1;
      const startY = invertedGravity ? 0 : HEIGHT - 1;
      const endY = invertedGravity ? HEIGHT : -1;
      const stepY = invertedGravity ? 1 : -1;

      // Mouse drag application
      if (isMouseDownRef.current && mousePosRef.current) {
        const { x, y } = mousePosRef.current;
        applyBrush(x, y, selectedElement, brushSize);
      }

      let count = 0;

      // Process grid cells
      for (let y = startY; y !== endY; y += stepY) {
        // Randomize row sweep to avoid directional bias
        const leftToRight = Math.random() > 0.5;
        const startX = leftToRight ? 0 : WIDTH - 1;
        const endX = leftToRight ? WIDTH : -1;
        const stepX = leftToRight ? 1 : -1;

        for (let x = startX; x !== endX; x += stepX) {
          const idx = y * WIDTH + x;
          const val = grid[idx];
          if (val === 0) continue;
          count++;

          const targetY = y + dir;
          const targetInBounds = targetY >= 0 && targetY < HEIGHT;

          // 1: Sand physics
          if (val === 1 && targetInBounds) {
            const below = targetY * WIDTH + x;
            if (grid[below] === 0) {
              grid[below] = 1;
              grid[idx] = 0;
            } else if (grid[below] === 2) {
              // Sand sinks in water!
              grid[below] = 1;
              grid[idx] = 2;
            } else {
              // Diagonal tumble
              const leftFirst = Math.random() > 0.5;
              const d1 = leftFirst ? -1 : 1;
              const d2 = leftFirst ? 1 : -1;

              const diag1X = x + d1;
              const diag1 = targetY * WIDTH + diag1X;
              if (diag1X >= 0 && diag1X < WIDTH && (grid[diag1] === 0 || grid[diag1] === 2)) {
                const swap = grid[diag1];
                grid[diag1] = 1;
                grid[idx] = swap;
              } else {
                const diag2X = x + d2;
                const diag2 = targetY * WIDTH + diag2X;
                if (diag2X >= 0 && diag2X < WIDTH && (grid[diag2] === 0 || grid[diag2] === 2)) {
                  const swap = grid[diag2];
                  grid[diag2] = 1;
                  grid[idx] = swap;
                }
              }
            }
          }
          // 2: Water physics
          else if (val === 2 && targetInBounds) {
            const below = targetY * WIDTH + x;
            if (grid[below] === 0) {
              grid[below] = 2;
              grid[idx] = 0;
            } else {
              // Spread sideways
              const leftFirst = Math.random() > 0.5;
              const d1 = leftFirst ? -1 : 1;
              const d2 = leftFirst ? 1 : -1;

              const side1X = x + d1;
              const side1 = y * WIDTH + side1X;
              if (side1X >= 0 && side1X < WIDTH && grid[side1] === 0) {
                grid[side1] = 2;
                grid[idx] = 0;
              } else {
                const side2X = x + d2;
                const side2 = y * WIDTH + side2X;
                if (side2X >= 0 && side2X < WIDTH && grid[side2] === 0) {
                  grid[side2] = 2;
                  grid[idx] = 0;
                }
              }
            }
          }
          // 3: Fire physics
          else if (val === 3) {
            if (Math.random() < 0.12) {
              grid[idx] = 0; // Burns out
            } else {
              // Burn nearby plant or turn water into steam
              const neighbors = [
                idx - 1, idx + 1, idx - WIDTH, idx + WIDTH
              ];
              for (const n of neighbors) {
                if (n >= 0 && n < WIDTH * HEIGHT) {
                  if (grid[n] === 4) { // Plant
                    grid[n] = 3; // Catch fire
                  } else if (grid[n] === 2) { // Water
                    grid[n] = 0; // Extinguish
                    grid[idx] = 0;
                  }
                }
              }
            }
          }
          // 4: Plant growth
          else if (val === 4) {
            if (Math.random() < 0.003) {
              const offsets = [-WIDTH, -1, 1];
              const off = offsets[Math.floor(Math.random() * offsets.length)];
              const target = idx + off;
              if (target >= 0 && target < WIDTH * HEIGHT && grid[target] === 0) {
                grid[target] = 4;
              }
            }
          }
        }
      }

      setParticleCount(count);

      // Render to image buffer
      let pIdx = 0;
      for (let i = 0; i < WIDTH * HEIGHT; i++) {
        const elemVal = grid[i];
        const [r, g, b] = colors[elemVal];
        data[pIdx] = r;
        data[pIdx + 1] = g;
        data[pIdx + 2] = b;
        data[pIdx + 3] = 255;
        pIdx += 4;
      }

      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [selectedElement, brushSize, invertedGravity, applyBrush]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    updatePointerCoords(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isMouseDownRef.current) {
      updatePointerCoords(e);
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
    mousePosRef.current = null;
  };

  const updatePointerCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    mousePosRef.current = { x, y };
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full select-none">
      {/* Header & Particle count */}
      <div className="mb-4 text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          Hypnotic Sand & Element Cascade
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Active Grains: <strong className="font-mono text-amber-400 tabular-nums">{particleCount}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Click & drag on the canvas to pour</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 w-full max-w-2xl aspect-[14/9]">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-crosshair image-render-pixelated block"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Element Selector Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {ELEMENTS.map((elem) => {
          const isSelected = selectedElement === elem.id;
          return (
            <button
              key={elem.id}
              onClick={() => {
                setSelectedElement(elem.id);
                sounds.playPop(1.1);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${elem.color}`} />
              <span>{elem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Auxiliary tools: Brush size, Gravity, Clear */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Brush:</span>
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              className={`px-2 py-0.5 rounded border ${
                brushSize === s
                  ? 'bg-slate-800 border-slate-600 text-amber-400 font-bold'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {s === 1 ? 'Fine' : s === 2 ? 'Medium' : 'Wide'}
            </button>
          ))}
        </div>

        <span aria-hidden="true" className="text-slate-800">|</span>

        <button
          onClick={() => {
            setInvertedGravity(!invertedGravity);
            sounds.playPop(1.4);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
            invertedGravity
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{invertedGravity ? 'Gravity: Up' : 'Gravity: Down'}</span>
        </button>

        <span aria-hidden="true" className="text-slate-800">|</span>

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Canvas</span>
        </button>
      </div>
    </div>
  );
};
