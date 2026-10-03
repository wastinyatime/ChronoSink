import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Volume2, ChevronDown, Check, Sparkles } from 'lucide-react';
import { ambientSound, AMBIENT_TRACKS, AmbientTrack } from '../services/ambient';
import { sounds } from '../services/sound';

export const AmbientNoiseControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(ambientSound.getIsPlaying());
  const [activeTrack, setActiveTrack] = useState<AmbientTrack>(ambientSound.getActiveTrack());
  const [volume, setVolume] = useState<number>(ambientSound.getVolume());
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Restore saved track preference
  useEffect(() => {
    const savedTrack = localStorage.getItem('chronosink_ambient_track') as AmbientTrack | null;
    if (savedTrack && AMBIENT_TRACKS.some((t) => t.id === savedTrack)) {
      setActiveTrack(savedTrack);
      ambientSound.setTrack(savedTrack);
    }
    const savedVol = localStorage.getItem('chronosink_ambient_vol');
    if (savedVol) {
      const v = parseFloat(savedVol);
      if (!isNaN(v)) {
        setVolume(v);
        ambientSound.setVolume(v);
      }
    }
  }, []);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    const playing = ambientSound.toggle();
    setIsPlaying(playing);
    sounds.playPop(playing ? 1.3 : 0.8);
  };

  const handleSelectTrack = (trackId: AmbientTrack) => {
    setActiveTrack(trackId);
    ambientSound.setTrack(trackId);
    if (!isPlaying) {
      ambientSound.start(trackId);
      setIsPlaying(true);
    }
    sounds.playPop(1.1);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  const currentTrackInfo = AMBIENT_TRACKS.find((t) => t.id === activeTrack) || AMBIENT_TRACKS[0];

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Header Button Group */}
      <div className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 shadow-xs">
        {/* Toggle Sound Button */}
        <button
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all rounded-l-lg ${
            isPlaying
              ? 'text-sky-300 bg-sky-500/15 border-r border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-r border-slate-800'
          }`}
          title={isPlaying ? `Ambient Sound Active: ${currentTrackInfo.label} (Click to mute)` : 'Turn on Ambient Background Noise'}
        >
          <Headphones className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-sky-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden sm:inline whitespace-nowrap">
            {isPlaying ? currentTrackInfo.label : 'Ambient'}
          </span>
          {isPlaying && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping shrink-0" />
          )}
        </button>

        {/* Dropdown chevron trigger */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`p-1.5 text-xs rounded-r-lg transition-colors ${
            isOpen
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
          title="Choose atmospheric noise environment"
          aria-expanded={isOpen}
          aria-label="Ambient sound settings"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Atmosphere Settings Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md z-50 text-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-sky-400" />
              <span>Ambient Noise Generator</span>
            </span>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${isPlaying ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isPlaying ? 'Playing' : 'Muted'}
            </span>
          </div>

          {/* Track Selection List */}
          <div className="space-y-1.5">
            {AMBIENT_TRACKS.map((track) => {
              const isSelected = activeTrack === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-sky-500/50 bg-sky-500/10 text-white shadow-xs'
                      : 'border-slate-800/60 bg-slate-950/40 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base shrink-0 leading-none pt-0.5">{track.icon}</span>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs truncate">{track.label}</span>
                      {isSelected && isPlaying && (
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {track.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-slate-400" />
                <span>Volume</span>
              </span>
              <span className="font-mono tabular-nums text-slate-300">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Master quick toggle inside popover */}
          <button
            onClick={handleToggle}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              isPlaying
                ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
            }`}
          >
            {isPlaying ? 'Mute Atmosphere' : 'Play Atmosphere'}
          </button>
        </div>
      )}
    </div>
  );
};
