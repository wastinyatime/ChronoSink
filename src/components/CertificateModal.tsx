import React, { useState } from 'react';
import { Award, X, Printer, Check, Sparkles } from 'lucide-react';
import { sounds } from '../services/sound';

interface CertificateModalProps {
  secondsSquandered: number;
  totalClicks: number;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  secondsSquandered,
  totalClicks,
  onClose,
}) => {
  const [recipientName, setRecipientName] = useState('Distinguished Slacker');
  const [copied, setCopied] = useState(false);

  const minutes = Math.max(1, Math.round(secondsSquandered / 60));

  const handlePrint = () => {
    sounds.playPop(1.2);
    window.print();
  };

  const handleCopy = () => {
    sounds.playFanfare();
    const text = `I officially squandered ${minutes} minutes and ${totalClicks} futile clicks at ChronoSink without achieving a single productive outcome.`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Frame */}
        <div className="border-4 border-double border-amber-400/40 p-6 sm:p-8 rounded-xl bg-slate-950/60 relative space-y-4">
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xs font-semibold tracking-widest text-amber-500 uppercase">
              Official Certification of Temporal Waste
            </h2>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
              Diploma of Procrastination
            </h1>
          </div>

          <p className="text-xs text-slate-400 italic">
            This solemn document hereby verifies that
          </p>

          {/* Editable Name */}
          <div className="inline-block border-b-2 border-amber-400/80 px-4 py-1">
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="bg-transparent text-center font-bold text-lg sm:text-xl text-amber-300 focus:outline-none w-64"
              placeholder="Enter your name"
            />
          </div>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            has willingly and joyfully squandered{' '}
            <strong className="text-amber-400 font-mono">{minutes} minutes</strong> of finite human existence,
            performing <strong className="text-amber-400 font-mono">{totalClicks} futile clicks</strong>,
            actively evading duties, chores, and professional growth in pursuit of pure digital idleness.
          </p>

          {/* Seal & Signature */}
          <div className="pt-6 flex items-center justify-around text-xs text-slate-400 border-t border-slate-800">
            <div>
              <div className="font-serif italic text-sm text-slate-200">The Void</div>
              <div className="text-[10px] text-slate-500 uppercase">Supreme Authority</div>
            </div>

            {/* Gold Seal Graphic */}
            <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-500/10 flex flex-col items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-tighter">100% IDLE</span>
            </div>

            <div>
              <div className="font-serif italic text-sm text-slate-200">Entropy</div>
              <div className="text-[10px] text-slate-500 uppercase">Witness of Stagnation</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Award className="w-3.5 h-3.5" />}
            <span>{copied ? 'Boast Copied to Clipboard!' : 'Copy Brag'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Diploma</span>
          </button>
        </div>
      </div>
    </div>
  );
};
