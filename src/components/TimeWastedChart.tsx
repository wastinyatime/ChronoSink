import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BarChart3, TrendingUp, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { sounds } from '../services/sound';

export interface DayMetric {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue", etc.
  minutes: number;
  clicks: number;
  rating: string;
}

interface TimeWastedChartProps {
  todaySeconds: number;
  todayClicks: number;
}

export const TimeWastedChart: React.FC<TimeWastedChartProps> = ({
  todaySeconds,
  todayClicks,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [metricMode, setMetricMode] = useState<'minutes' | 'clicks'>('minutes');
  const [hoveredDay, setHoveredDay] = useState<DayMetric | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Generate or retrieve 7 days of metrics
  const data: DayMetric[] = useMemo(() => {
    const list: DayMetric[] = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const ratings = [
      'Acceptable Loitering',
      'Solid Procrastination',
      'Heroic Inactivity',
      'Stellar Time Waste',
      'Grandmaster Sloth',
    ];

    // Read stored historical data if exists
    let stored: Record<string, { minutes: number; clicks: number }> = {};
    const raw = localStorage.getItem('chronosink_7d_metrics');
    if (raw) {
      try {
        stored = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = i === 0 ? 'Today' : dayNames[d.getDay()];

      let mins: number;
      let clicks: number;

      if (i === 0) {
        // Today is live
        mins = Math.max(0.5, Math.round((todaySeconds / 60) * 10) / 10);
        clicks = todayClicks;
      } else if (stored[key]) {
        mins = stored[key].minutes;
        clicks = stored[key].clicks;
      } else {
        // Seed realistic baseline metrics for past 6 days
        // Pseudo-random based on day number to remain stable
        const seed = (d.getDate() * 7 + d.getMonth() * 13) % 25;
        mins = 8.5 + seed * 1.2;
        clicks = Math.floor(mins * 18 + seed * 9);
      }

      list.push({
        dateStr: key,
        dayLabel,
        minutes: mins,
        clicks,
        rating: ratings[Math.floor(mins) % ratings.length],
      });
    }

    return list;
  }, [todaySeconds, todayClicks]);

  // Total and average calculations
  const totalMinutes = useMemo(() => data.reduce((acc, d) => acc + d.minutes, 0), [data]);
  const avgMinutes = useMemo(() => Math.round((totalMinutes / 7) * 10) / 10, [totalMinutes]);
  const totalClicks = useMemo(() => data.reduce((acc, d) => acc + d.clicks, 0), [data]);

  // Render D3 Chart
  useEffect(() => {
    if (!isExpanded) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 220;
    const margin = { top: 25, right: 30, bottom: 35, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definitions
    const defs = svg.append('defs');

    // Area fill gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'time-wasted-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.45);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.0);

    // Line stroke gradient
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'time-wasted-line-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#fbbf24');

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.dayLabel))
      .range([0, innerWidth])
      .padding(0.2);

    const yMax = d3.max(data, (d) => (metricMode === 'minutes' ? d.minutes : d.clicks)) || 10;
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.2])
      .range([innerHeight, 0])
      .nice();

    // Subtle horizontal gridlines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(4);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-dasharray', '3 3');

    g.select('.grid .domain').remove();

    // Area generator
    const areaGen = d3
      .area<DayMetric>()
      .x((d) => xScale(d.dayLabel) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(metricMode === 'minutes' ? d.minutes : d.clicks))
      .curve(d3.curveMonotoneX);

    // Line generator
    const lineGen = d3
      .line<DayMetric>()
      .x((d) => xScale(d.dayLabel) || 0)
      .y((d) => yScale(metricMode === 'minutes' ? d.minutes : d.clicks))
      .curve(d3.curveMonotoneX);

    // Draw Area
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#time-wasted-area-grad)')
      .attr('d', areaGen);

    // Draw Line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#time-wasted-line-grad)')
      .attr('stroke-width', 3)
      .attr('d', lineGen);

    // Draw Data Point Circles with hover interactions
    const pointsGroup = g.append('g').attr('class', 'points');

    data.forEach((d) => {
      const cx = xScale(d.dayLabel) || 0;
      const cy = yScale(metricMode === 'minutes' ? d.minutes : d.clicks);

      // Outer glow circle
      pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', d.dayLabel === 'Today' ? 7 : 5)
        .attr('fill', '#f59e0b')
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 2)
        .attr('class', 'cursor-pointer transition-all hover:scale-125')
        .on('mouseenter', () => {
          sounds.playPop(1.4);
          setHoveredDay(d);
        });

      // Inner dot
      pointsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 2.5)
        .attr('fill', '#ffffff')
        .style('pointer-events', 'none');
    });

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-weight', (d) => (d === 'Today' ? '700' : '500'));

    g.select('.domain').attr('stroke', '#334155');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((v) => (metricMode === 'minutes' ? `${v}m` : `${v}`));

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Benchmark guideline: "15m Minimum Sloth Baseline"
    if (metricMode === 'minutes') {
      const targetY = yScale(15);
      if (targetY >= 0 && targetY <= innerHeight) {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', targetY)
          .attr('y2', targetY)
          .attr('stroke', '#ef4444')
          .attr('stroke-dasharray', '4 4')
          .attr('stroke-opacity', 0.6);

        g.append('text')
          .attr('x', innerWidth - 4)
          .attr('y', targetY - 4)
          .attr('text-anchor', 'end')
          .attr('fill', '#ef4444')
          .attr('font-size', '9px')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text('15m Daily Sloth Target');
      }
    }
  }, [data, metricMode, isExpanded]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm space-y-4"
    >
      {/* Header & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>7-Day Temporal Dissipation Analytics</span>
              <span className="text-[10px] font-mono font-normal text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                D3 Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Measuring the glorious decline of your weekly productivity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => {
                setMetricMode('minutes');
                sounds.playPop(1.1);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                metricMode === 'minutes'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Minutes
            </button>
            <button
              onClick={() => {
                setMetricMode('clicks');
                sounds.playPop(1.1);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                metricMode === 'clicks'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Futile Clicks
            </button>
          </div>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse chart' : 'Expand chart'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-slate-400">7-Day Squandered</span>
              <div className="font-mono text-base font-bold text-amber-400 tabular-nums">
                {Math.floor(totalMinutes / 60)}h {Math.round(totalMinutes % 60)}m
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-slate-400">Daily Average</span>
              <div className="font-mono text-base font-bold text-slate-200 tabular-nums">
                {avgMinutes} mins
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-slate-400">Total Futile Clicks</span>
              <div className="font-mono text-base font-bold text-sky-400 tabular-nums">
                {totalClicks}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-slate-400">Current Rating</span>
              <div className="text-emerald-400 font-semibold truncate">
                {data[data.length - 1].rating}
              </div>
            </div>
          </div>

          {/* D3 SVG Canvas Container */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              <svg
                ref={svgRef}
                viewBox="0 0 640 220"
                className="w-full h-auto block select-none"
              />
            </div>
          </div>

          {/* Hover Details readout */}
          {hoveredDay && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>{hoveredDay.dayLabel} ({hoveredDay.dateStr})</strong>: Squandered{' '}
                  <strong className="font-mono text-white">{hoveredDay.minutes} mins</strong> and{' '}
                  <strong className="font-mono text-white">{hoveredDay.clicks} futile clicks</strong>.
                </span>
              </div>
              <span className="text-[11px] italic text-amber-300 font-medium">
                "{hoveredDay.rating}"
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
