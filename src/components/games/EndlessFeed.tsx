import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../services/sound';
import { Heart, MessageSquare, Share2, Compass, Sparkles, CheckCircle2 } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'fact' | 'shower_thought' | 'poll' | 'loop_visual' | 'observation';
  title?: string;
  author: string;
  handle: string;
  content: string;
  visualType?: 'pendulum' | 'bouncing_box' | 'spirograph' | 'sine_wave';
  pollOptions?: { label: string; votes: number }[];
  selectedPollOption?: number;
  likes: number;
  isLiked?: boolean;
  timeAgo: string;
}

const INITIAL_SNIPPETS: Omit<FeedItem, 'id' | 'likes' | 'timeAgo'>[] = [
  {
    type: 'fact',
    author: 'Archivist of Trivia',
    handle: '@useless_knowledge',
    content: 'Wombats are the only known animal in the universe whose poop is completely cubic. They produce up to 100 little cubes per day so it does not roll off rocks.',
  },
  {
    type: 'loop_visual',
    visualType: 'pendulum',
    author: 'Kinetic Hypnosis',
    handle: '@mesmer_loops',
    content: 'A simulated 12-harmonic phase pendulum wave. Watching this for 3 minutes has been clinically proven to solve zero of your actual problems.',
  },
  {
    type: 'shower_thought',
    author: 'Ceiling Contemplator',
    handle: '@shower_wisdom',
    content: 'If you buy a significantly larger bed, you have noticeably more bed room, but significantly less bedroom.',
  },
  {
    type: 'poll',
    author: 'Pointless Arbiter',
    handle: '@debates_that_matter_not',
    content: 'Settle this once and for all: Is cold tap water noticeably pointier than room temperature tap water?',
    pollOptions: [
      { label: 'Yes, cold water is sharp and pointy', votes: 1420 },
      { label: 'No, water has no edges (you need sleep)', votes: 310 },
      { label: 'Room temp water is round', votes: 940 },
    ],
  },
  {
    type: 'loop_visual',
    visualType: 'bouncing_box',
    author: 'Retro Nostalgia',
    handle: '@corner_seeker',
    content: 'The bouncing rectangle that grazes the corner of the frame. Will it hit the exact corner this time? There is only one way to find out: keep watching.',
  },
  {
    type: 'fact',
    author: 'Cosmic Perspective',
    handle: '@pale_blue_dot',
    content: 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza. Oxford University is also older than the Aztec Empire.',
  },
  {
    type: 'observation',
    author: 'Productivity Denier',
    handle: '@slacker_manifesto',
    content: 'Never put off until tomorrow what you can avoid doing altogether. You have currently scrolled past 32 paragraphs of text you will forget in 5 minutes.',
  },
  {
    type: 'loop_visual',
    visualType: 'spirograph',
    author: 'Sacred Curves',
    handle: '@math_art_zen',
    content: 'Parametric hypotrochoid drawing loop. No pixels were harmed in the generation of this mesmerizing mathematical daydream.',
  },
  {
    type: 'shower_thought',
    author: 'Existential Wanderer',
    handle: '@midnight_ponder',
    content: 'Water is not actually wet by itself. Wetness is merely the sensation of a liquid adhering to a solid. Therefore, fish are technically never wet.',
  },
  {
    type: 'poll',
    author: 'Snack Philosopher',
    handle: '@carb_theology',
    content: 'Philosophical inquiry: Is a hot dog technically a sandwich, a taco, or an edible meat canoe?',
    pollOptions: [
      { label: 'Sub-category of sandwich', votes: 530 },
      { label: 'Structurally a taco (3 closed sides)', votes: 1240 },
      { label: 'Meat canoe', votes: 2190 },
    ],
  },
];

interface EndlessFeedProps {
  onScrollItem: () => void;
}

export const EndlessFeed: React.FC<EndlessFeedProps> = ({ onScrollItem }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [scrolledMeters, setScrolledMeters] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  // Generate unique item
  const generateFeedItem = useCallback((index: number): FeedItem => {
    const template = INITIAL_SNIPPETS[index % INITIAL_SNIPPETS.length];
    return {
      ...template,
      id: `item-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      likes: 120 + Math.floor(Math.random() * 850),
      timeAgo: `${(index % 12) + 1}m ago`,
    };
  }, []);

  // Initialize feed
  useEffect(() => {
    const initial: FeedItem[] = [];
    for (let i = 0; i < 6; i++) {
      initial.push(generateFeedItem(i));
    }
    setItems(initial);
  }, [generateFeedItem]);

  // Infinite scroll trigger
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    // Track scrolled meters (approx 1 meter per 350px of scroll)
    const meters = Math.floor(el.scrollTop / 350);
    setScrolledMeters(meters);

    if (el.scrollHeight - el.scrollTop - el.clientHeight < 600 && !loadingMoreRef.current) {
      loadingMoreRef.current = true;
      onScrollItem();

      // Append more items smoothly
      setTimeout(() => {
        setItems((prev) => {
          const nextBatch: FeedItem[] = [];
          for (let i = 0; i < 4; i++) {
            nextBatch.push(generateFeedItem(prev.length + i));
          }
          return [...prev, ...nextBatch];
        });
        loadingMoreRef.current = false;
      }, 200);
    }
  };

  const handleLike = (id: string) => {
    sounds.playPop(1.3);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
              isLiked: !item.isLiked,
            }
          : item
      )
    );
  };

  const handleVote = (itemId: string, optionIndex: number) => {
    sounds.playPop(1.5);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.pollOptions && item.selectedPollOption === undefined) {
          const updated = item.pollOptions.map((opt, i) =>
            i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...item,
            pollOptions: updated,
            selectedPollOption: optionIndex,
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 max-w-2xl mx-auto w-full select-none">
      {/* Feed Sub-header */}
      <div className="mb-4 text-center space-y-1 w-full">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          The Void Scroll · Infinite Mild Intrigue
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Depth: <strong className="font-mono text-amber-400 tabular-nums">{scrolledMeters} meters</strong></span>
          <span aria-hidden="true">·</span>
          <span>Feed items viewed: <strong className="font-mono text-slate-200 tabular-nums">{items.length}</strong></span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-500">Scroll endlessly into the digital ether</span>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-h-[72vh] overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="w-full rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg space-y-3 transition-colors hover:border-slate-700/80"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    {item.author}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {item.handle}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {item.timeAgo}
              </div>
            </div>

            {/* Post Text Content */}
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {item.content}
            </p>

            {/* Looping Canvas Visuals */}
            {item.type === 'loop_visual' && item.visualType && (
              <div className="w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 aspect-video flex items-center justify-center relative">
                <LoopCanvas type={item.visualType} />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Looping 60FPS
                </div>
              </div>
            )}

            {/* Interactive Polls */}
            {item.type === 'poll' && item.pollOptions && (
              <div className="space-y-2 pt-1">
                {(() => {
                  const totalVotes = item.pollOptions.reduce((acc, opt) => acc + opt.votes, 0);
                  const isVoted = item.selectedPollOption !== undefined;

                  return item.pollOptions.map((opt, optIdx) => {
                    const percentage = Math.round((opt.votes / (totalVotes || 1)) * 100);
                    const isSelected = item.selectedPollOption === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleVote(item.id, optIdx)}
                        disabled={isVoted}
                        className={`relative w-full text-left p-3 rounded-lg border text-xs font-medium overflow-hidden transition-all ${
                          isSelected
                            ? 'border-amber-400/80 text-white font-semibold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {/* Vote percentage bar fill */}
                        {isVoted && (
                          <div
                            className="absolute inset-y-0 left-0 bg-amber-500/15 border-r border-amber-500/30 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between z-10">
                          <span className="flex items-center gap-2">
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{opt.label}</span>
                          </span>
                          {isVoted && (
                            <span className="font-mono text-slate-400 font-semibold tabular-nums">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            )}

            {/* Social footer reactions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs text-slate-400">
              <button
                onClick={() => handleLike(item.id)}
                className={`flex items-center gap-1.5 transition-colors ${
                  item.isLiked ? 'text-rose-400 font-semibold' : 'hover:text-rose-400'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-rose-400' : ''}`} />
                <span className="font-mono tabular-nums">{item.likes}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playPop(1.1);
                  alert('Comment sent directly to the cosmic void. It will remain unanswered for eternity.');
                }}
                className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ponder</span>
              </button>

              <button
                onClick={() => {
                  sounds.playPop(1.6);
                  alert('Copied meaningless link to nowhere. Send it to a friend who is also avoiding responsibilities.');
                }}
                className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Void</span>
              </button>
            </div>
          </article>
        ))}

        {/* Endless indicator */}
        <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>Generating fresh meaningless moments ahead...</span>
        </div>
      </div>
    </div>
  );
};

// Canvas Looping Visualizer Component
interface LoopCanvasProps {
  type: 'pendulum' | 'bouncing_box' | 'spirograph' | 'sine_wave';
}

const LoopCanvas: React.FC<LoopCanvasProps> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    // Bouncing box state
    let boxX = 40;
    let boxY = 40;
    let vx = 2.4;
    let vy = 1.8;
    const boxSize = 28;

    const render = () => {
      t += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      if (type === 'pendulum') {
        const count = 12;
        const spacing = w / (count + 1);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;

        for (let i = 0; i < count; i++) {
          const freq = 1.0 + i * 0.08;
          const angle = Math.sin(t * freq) * 0.8;
          const originX = (i + 1) * spacing;
          const originY = 20;
          const length = 110;
          const bobX = originX + Math.sin(angle) * length;
          const bobY = originY + Math.cos(angle) * length;

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(bobX, bobY);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(bobX, bobY, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === 'bouncing_box') {
        boxX += vx;
        boxY += vy;

        if (boxX <= 0 || boxX + boxSize >= w) {
          vx = -vx;
        }
        if (boxY <= 0 || boxY + boxSize >= h) {
          vy = -vy;
        }

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxSize, boxSize, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VOID', boxX + boxSize / 2, boxY + boxSize / 2);
      } else if (type === 'spirograph') {
        const cx = w / 2;
        const cy = h / 2;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        const R = 60;
        const r = 24;
        const p = 40;

        for (let theta = 0; theta < Math.PI * 8; theta += 0.05) {
          const x = (R - r) * Math.cos(theta + t * 0.2) + p * Math.cos((R - r) * (theta + t * 0.2) / r);
          const y = (R - r) * Math.sin(theta + t * 0.2) - p * Math.sin((R - r) * (theta + t * 0.2) / r);
          if (theta === 0) ctx.moveTo(cx + x, cy + y);
          else ctx.lineTo(cx + x, cy + y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={225}
      className="w-full h-full block"
    />
  );
};
