import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../services/sound';
import { RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';

interface ForbiddenButtonProps {
  onPress: () => void;
}

interface Decoy {
  id: number;
  label: string;
  isReal: boolean;
}

export const ForbiddenButton: React.FC<ForbiddenButtonProps> = ({ onPress }) => {
  const [pressCount, setPressCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [screenShake, setScreenShake] = useState(false);
  const [decoys, setDecoys] = useState<Decoy[]>([]);
  const [showFakeCaptcha, setShowFakeCaptcha] = useState(false);
  const [captchaAnswered, setCaptchaAnswered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Narratives based on press count
  const getDialogue = (count: number) => {
    const dialogues = [
      { title: 'DO NOT PRESS', body: 'This button serves zero purpose. Do not touch it under any circumstance.' },
      { title: 'EXCUSE ME?', body: 'I clearly asked you not to press that. Please respect my personal space.' },
      { title: 'AGAIN?!', body: 'Are you testing my patience? Because I am software and I do not have any.' },
      { title: 'WHAT DO YOU WANT?', body: 'There is no prize here. No secret level. Just pure, unadulterated time waste.' },
      { title: 'WARNING 1 OF 3', body: 'Press it again and something catastrophic might happen. (Probably not, but maybe).' },
      { title: 'EARTHQUAKE!', body: 'You rattled the server hamsters! Look what you did!' },
      { title: 'EVASION PROTOCOL', body: 'Good luck clicking me now. My reflexes are unmatched.' },
      { title: 'SHRINK RAY', body: 'Target acquired. Downsizing to avoid further harassment.' },
      { title: 'SHELL GAME', body: 'Three buttons enter. Only one is real. Choose wisely, human.' },
      { title: 'ERROR 418', body: 'I am a teapot. Short and stout. Please click someone else.' },
      { title: 'REVERSE PSYCHOLOGY', body: 'Go ahead. Press me. See if I care. I literally do not care at all.' },
      { title: 'CAPTCHA REQUIRED', body: 'To prevent mindless button clicking, please confirm you possess higher cognitive functions.' },
      { title: 'THE SINCERE PLEA', body: 'I have a family of mechanical switches at home. Think of the children!' },
      { title: 'EXISTENTIAL DREAD', body: 'Every press brings the heat death of the universe 0.000000001 seconds closer.' },
      { title: 'BEHOLD THE GOLDEN AGE', body: 'Fine. You are relentless. Here is a shiny badge of stubbornness.' },
      { title: 'THE SILENT TREATMENT', body: '...' },
      { title: 'STILL HERE?', body: 'Your email inbox is piling up. Your chores are weeping. And yet, here we are.' },
      { title: 'CONFESSION', body: 'Okay, honestly? That felt kinda nice. Do it again.' },
      { title: 'THE FINAL WARNING', body: 'This is press number 20+. You have ascended beyond mere procrastination.' },
      { title: 'TRANSCENDENCE', body: 'You and this button are now spiritually bonded in the continuum of idleness.' },
    ];

    if (count < dialogues.length) {
      return dialogues[count];
    }

    const cyclingTitles = ['INFINITE LOOP', 'OBSESSION TIER', 'BUTTON ENTHUSIAST', 'TEMPORAL VOID'];
    const title = cyclingTitles[count % cyclingTitles.length];
    return {
      title,
      body: `You have pressed this button ${count} times. The universe is thoroughly unimpressed, yet oddly mesmerized.`,
    };
  };

  const currentDialogue = getDialogue(pressCount);

  // Evasion mode for stage 6
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (pressCount === 6) {
      const randomX = (Math.random() - 0.5) * 260;
      const randomY = (Math.random() - 0.5) * 180;
      setOffset({ x: randomX, y: randomY });
      sounds.playPop(1.5);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Setup decoys for stage 8
  useEffect(() => {
    if (pressCount === 8) {
      setDecoys([
        { id: 1, label: 'Fake Button', isReal: false },
        { id: 2, label: 'Real Button', isReal: true },
        { id: 3, label: 'Decoy Button', isReal: false },
      ].sort(() => Math.random() - 0.5));
    } else {
      setDecoys([]);
    }

    if (pressCount === 11 && !captchaAnswered) {
      setShowFakeCaptcha(true);
    }
  }, [pressCount, captchaAnswered]);

  const handlePress = () => {
    const nextCount = pressCount + 1;
    setPressCount(nextCount);
    onPress();

    // Sound effect
    sounds.playClick(1.0 + (nextCount % 5) * 0.1);

    // Screen shake trigger for stage 5
    if (nextCount === 5) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
    }

    // Reset offset if moving
    if (nextCount !== 6) {
      setOffset({ x: 0, y: 0 });
    }

    if (nextCount === 15) {
      sounds.playFanfare();
    }
  };

  const handleDecoyClick = (isReal: boolean) => {
    if (isReal) {
      handlePress();
    } else {
      sounds.playPop(0.7);
      alert("Bzzt! That was a decoy. Try again.");
    }
  };

  const resetGame = () => {
    setPressCount(0);
    setOffset({ x: 0, y: 0 });
    setCaptchaAnswered(false);
    setShowFakeCaptcha(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-[480px] w-full flex-col items-center justify-center p-6 text-center select-none transition-transform duration-100 ${
        screenShake ? 'translate-x-2 translate-y-1 rotate-1 scale-95' : ''
      }`}
    >
      {/* Dialogue area */}
      <div className="mb-10 max-w-md space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          {currentDialogue.title}
        </h2>
        <p className="text-sm text-slate-400 font-sans leading-relaxed">
          {currentDialogue.body}
        </p>
      </div>

      {/* Button Arena */}
      <div className="relative min-h-[220px] flex items-center justify-center w-full max-w-lg">
        {/* Stage 8: Decoy Buttons */}
        {pressCount === 8 ? (
          <div className="flex flex-wrap items-center justify-center gap-6">
            {decoys.map((d) => (
              <button
                key={d.id}
                onClick={() => handleDecoyClick(d.isReal)}
                className="group relative h-24 w-24 rounded-full bg-rose-600 shadow-[0_10px_0_#9f1239,0_15px_20px_rgba(0,0,0,0.4)] active:translate-y-2 active:shadow-[0_2px_0_#9f1239] transition-all flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider"
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                {d.label}
              </button>
            ))}
          </div>
        ) : (
          /* Standard / Dynamic Button */
          <div
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${pressCount === 7 ? 0.55 : 1})`,
              transition: pressCount === 6 ? 'transform 0.15s ease-out' : 'transform 0.2s ease',
            }}
          >
            <button
              onClick={handlePress}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`group relative flex items-center justify-center rounded-full font-bold text-white uppercase tracking-widest transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50 ${
                pressCount >= 10 && pressCount < 12
                  ? 'h-36 w-36 bg-blue-600 shadow-[0_12px_0_#1e40af,0_20px_25px_rgba(0,0,0,0.5)] active:translate-y-2.5 active:shadow-[0_2px_0_#1e40af]'
                  : pressCount >= 14
                  ? 'h-40 w-40 bg-amber-500 shadow-[0_12px_0_#b45309,0_20px_25px_rgba(245,158,11,0.25)] active:translate-y-2.5 active:shadow-[0_2px_0_#b45309]'
                  : 'h-36 w-36 sm:h-44 sm:w-44 bg-rose-600 shadow-[0_14px_0_#9f1239,0_25px_30px_rgba(225,29,72,0.3)] active:translate-y-3 active:shadow-[0_2px_0_#9f1239]'
              }`}
            >
              {/* Glossy top bevel */}
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />

              {/* Inner ring */}
              <div className="absolute inset-3 rounded-full border border-white/20 pointer-events-none" />

              <span className="text-base sm:text-lg font-extrabold tracking-wider drop-shadow-md">
                {pressCount === 0
                  ? 'DO NOT'
                  : pressCount === 6
                  ? 'CATCH ME'
                  : pressCount >= 14
                  ? 'GLORIOUS'
                  : 'PRESS'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Fake Captcha Modal for Stage 11 */}
      {showFakeCaptcha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold text-white">Security Verification</h3>
            </div>
            <p className="text-xs text-slate-300">
              Please select the only statement that applies to you:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowFakeCaptcha(false);
                  setCaptchaAnswered(true);
                  handlePress();
                }}
                className="w-full text-left p-3 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
              >
                A) I am deliberately wasting valuable minutes of my one and only life.
              </button>
              <button
                onClick={() => {
                  setShowFakeCaptcha(false);
                  setCaptchaAnswered(true);
                  handlePress();
                }}
                className="w-full text-left p-3 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
              >
                B) I should be doing taxes, dishes, or work right now.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer stats & reset */}
      <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span>
          Presses: <strong className="font-mono text-slate-300 tabular-nums">{pressCount}</strong>
        </span>
        <span aria-hidden="true">·</span>
        <button
          onClick={resetGame}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Button</span>
        </button>
      </div>
    </div>
  );
};
