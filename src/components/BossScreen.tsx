import React, { useState, useEffect } from 'react';
import { Table, Terminal, FileSpreadsheet, Check, ArrowLeft } from 'lucide-react';

interface BossScreenProps {
  onDismiss: () => void;
}

export const BossScreen: React.FC<BossScreenProps> = ({ onDismiss }) => {
  const [typedBuffer, setTypedBuffer] = useState('');
  const [activeTab, setActiveTab] = useState<'excel' | 'terminal'>('excel');

  const corporateJargon = [
    'Leveraging holistic synergies across multi-tenant Q3 microservices...',
    'Refactoring legacy EBITDA pipeline for non-blocking asynchronous dividends...',
    'Aligning cross-functional stakeholder paradigms with vertical growth loops...',
    'Conducting deep-dive bandwidth audit on enterprise deliverables...',
    'Optimizing quarterly ROI metrics through strategic agile pivot vectors...',
    'Validating zero-trust compliance protocols in scalable cloud clusters...',
  ];

  // Any key press types corporate jargon!
  useEffect(() => {
    let jargonIdx = 0;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
        onDismiss();
        return;
      }
      jargonIdx = (jargonIdx + 1) % corporateJargon.length;
      setTypedBuffer((prev) => `${prev}\n> [COMMIT] ${corporateJargon[jargonIdx]}`);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDismiss, corporateJargon]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1f242d] text-slate-200 font-sans select-none flex flex-col">
      {/* Top Windows/Mac office bar */}
      <div className="bg-[#181c24] border-b border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 cursor-pointer" onClick={onDismiss} />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 cursor-pointer" onClick={onDismiss} />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 cursor-pointer" onClick={onDismiss} />
          </div>
          <span className="font-semibold text-slate-200">
            Enterprise_Q3_Strategic_Projections_v4.2.xlsx [Read-Only]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'excel' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Financial Matrix
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'terminal' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deployment CLI
          </button>

          <button
            onClick={onDismiss}
            className="ml-4 inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Boss Left (Resume Fun)</span>
          </button>
        </div>
      </div>

      {/* Main Content: Excel Mock */}
      {activeTab === 'excel' && (
        <div className="flex-1 flex flex-col overflow-auto bg-[#1a1e26] text-xs">
          {/* Formula bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#232834] border-b border-slate-700 text-slate-400 font-mono text-[11px]">
            <span className="font-bold text-emerald-400">fx</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200">=SUMIFS(Revenue_Q3!C2:C104, FY26_Actuals, "&gt;0") * 1.184</span>
          </div>

          {/* Spreadsheet Table */}
          <table className="w-full border-collapse font-mono text-left text-[11px] text-slate-300">
            <thead>
              <tr className="bg-[#2a303d] text-slate-400">
                <th className="p-2 border border-slate-700 w-12 text-center">#</th>
                <th className="p-2 border border-slate-700">Cost Center</th>
                <th className="p-2 border border-slate-700">Q1 Actuals</th>
                <th className="p-2 border border-slate-700">Q2 Budget</th>
                <th className="p-2 border border-slate-700">Q3 Projected</th>
                <th className="p-2 border border-slate-700">Variance (%)</th>
                <th className="p-2 border border-slate-700">Strategic Priority</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 1, center: 'Infrastructure & Cloud Scale', q1: '$420,500', q2: '$440,000', q3: '$485,200', v: '+10.2%', p: 'Critical' },
                { id: 2, center: 'Enterprise Synergistic Marketing', q1: '$184,200', q2: '$190,000', q3: '$210,000', v: '+8.4%', p: 'High' },
                { id: 3, center: 'Cross-Functional Agile Alignment', q1: '$92,000', q2: '$95,000', q3: '$105,400', v: '+4.1%', p: 'Medium' },
                { id: 4, center: 'Customer Acquisition Optimization', q1: '$312,000', q2: '$325,000', q3: '$360,000', v: '+11.8%', p: 'Critical' },
                { id: 5, center: 'Machine Learning Model Ops', q1: '$240,000', q2: '$260,000', q3: '$290,000', v: '+12.5%', p: 'Critical' },
                { id: 6, center: 'Compliance & Data Integrity', q1: '$65,000', q2: '$68,000', q3: '$72,000', v: '+2.8%', p: 'High' },
                { id: 7, center: 'R&D Exploration Pipeline', q1: '$140,000', q2: '$150,000', q3: '$175,000', v: '+16.6%', p: 'Very High' },
              ].map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/60 border-b border-slate-800">
                  <td className="p-2 border border-slate-700 text-center text-slate-500">{row.id}</td>
                  <td className="p-2 border border-slate-700 font-sans font-medium text-white">{row.center}</td>
                  <td className="p-2 border border-slate-700 tabular-nums">{row.q1}</td>
                  <td className="p-2 border border-slate-700 tabular-nums">{row.q2}</td>
                  <td className="p-2 border border-slate-700 tabular-nums text-emerald-400 font-bold">{row.q3}</td>
                  <td className="p-2 border border-slate-700 tabular-nums text-amber-400">{row.v}</td>
                  <td className="p-2 border border-slate-700 text-slate-400">{row.p}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Typing interactive note */}
          <div className="p-4 mt-auto border-t border-slate-800 bg-[#161a22] text-slate-400 text-xs flex items-center justify-between">
            <span>Tip: Type any keys to look hyper-productive, or press Esc / Boss Left to exit disguise.</span>
            <span className="text-emerald-400 font-mono">STATUS: 100% OPERATIONAL WORKLOAD</span>
          </div>
        </div>
      )}

      {/* Terminal Mock */}
      {activeTab === 'terminal' && (
        <div className="flex-1 bg-[#0f1117] p-4 font-mono text-xs text-emerald-400 overflow-auto whitespace-pre-wrap leading-relaxed">
          <p className="text-slate-400">ChronoSink Enterprise Microservice Gateway v9.8.1 (x86_64-pc-linux-gnu)</p>
          <p className="text-slate-500">Type on your keyboard to generate authentic-looking deployment telemetry.</p>
          <p className="mt-2 text-white font-bold">&gt; Initializing zero-friction deployment daemon...</p>
          <p className="text-emerald-400">&gt; Cluster sync verified. Invariants: OK. Memory leak mitigation: ACTIVE.</p>
          {typedBuffer}
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1 align-middle" />
        </div>
      )}
    </div>
  );
};
