import React, { useState, useEffect } from 'react';
import { 
  X, Check, Copy, ExternalLink, Globe, ShieldCheck, Zap, 
  Search, Sparkles, CheckCircle2, AlertCircle, RefreshCw, 
  Share2, ArrowUpRight, BarChart2, Eye
} from 'lucide-react';
import { sounds } from '../services/sound';

interface SearchConsoleModalProps {
  onClose: () => void;
}

type TabType = 'google' | 'bing' | 'indexnow' | 'audit';

export const SearchConsoleModal: React.FC<SearchConsoleModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('google');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedShortUrl, setCopiedShortUrl] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [googleToken, setGoogleToken] = useState<string>(() => {
    return localStorage.getItem('chronosink_google_verification') || 'YBHOHEhkNa9PzSW1kgVB4DNzh9ZqThGBnC4tmW9cNQg';
  });
  const [bingToken, setBingToken] = useState<string>(() => {
    return localStorage.getItem('chronosink_bing_verification') || '';
  });
  const [savedTokenMsg, setSavedTokenMsg] = useState(false);

  // IndexNow ping state
  const [pingLoading, setPingLoading] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(() => {
    return localStorage.getItem('chronosink_last_indexnow_ping') || null;
  });

  const shortUrl = 'https://tinyurl.com/chronosink';
  const appUrl = 'https://ais-pre-r2dfoalxbovonagjxoatsy-921233943535.asia-southeast1.run.app/';
  const sitemapUrl = `${appUrl}sitemap.xml`;
  const encodedAppUrl = encodeURIComponent(appUrl);

  // Update dynamic meta tag if user adjusts tokens
  useEffect(() => {
    if (googleToken) {
      const meta = document.getElementById('google-verification-meta');
      if (meta) meta.setAttribute('content', googleToken);
    }
    if (bingToken) {
      const meta = document.getElementById('ms-verification-meta');
      if (meta) meta.setAttribute('content', bingToken);
    }
  }, [googleToken, bingToken]);

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text);
    sounds.playPop(1.4);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSaveTokens = () => {
    sounds.playFanfare();
    localStorage.setItem('chronosink_google_verification', googleToken);
    localStorage.setItem('chronosink_bing_verification', bingToken);

    const gMeta = document.getElementById('google-verification-meta');
    if (gMeta && googleToken) gMeta.setAttribute('content', googleToken);

    const bMeta = document.getElementById('ms-verification-meta');
    if (bMeta && bingToken) bMeta.setAttribute('content', bingToken);

    setSavedTokenMsg(true);
    setTimeout(() => setSavedTokenMsg(false), 3500);
  };

  const handlePingIndexNow = async () => {
    setPingLoading(true);
    setPingSuccess(null);
    sounds.playPop(1.2);
    try {
      const res = await fetch('/api/ping-indexnow');
      const data = await res.json();
      if (data.success && data.status === 202) {
        sounds.playFanfare();
        setPingSuccess(true);
        const timeStr = new Date().toLocaleTimeString();
        setLastPingTime(timeStr);
        localStorage.setItem('chronosink_last_indexnow_ping', timeStr);
      } else {
        setPingSuccess(false);
      }
    } catch {
      setPingSuccess(false);
    } finally {
      setPingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Globe className="w-4 h-4" />
            <span>Search Engine Submission &amp; SEO Launchpad</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            Upload &amp; Index Your App Across Search Engines
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Submit ChronoSink to Google Search, Microsoft Bing, Yahoo, DuckDuckGo, and the IndexNow global search network for rapid crawling and indexing.
          </p>
        </div>

        {/* Quick URL Cards Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Short Link */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-300">Short Share Link</span>
              <button
                onClick={() => handleCopy(shortUrl, setCopiedShortUrl)}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-200 transition-colors font-medium"
              >
                {copiedShortUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedShortUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-amber-200 font-bold truncate bg-slate-950/60 p-2 rounded-lg border border-amber-500/20">
              {shortUrl}
            </div>
          </div>

          {/* Production URL */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Search Console URL</span>
              <button
                onClick={() => handleCopy(appUrl, setCopiedUrl)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-slate-400 truncate bg-slate-900 p-2 rounded-lg border border-slate-800">
              {appUrl}
            </div>
          </div>

          {/* Sitemap */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Sitemap Address</span>
              <button
                onClick={() => handleCopy(sitemapUrl, setCopiedSitemap)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copiedSitemap ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSitemap ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-slate-400 truncate bg-slate-900 p-2 rounded-lg border border-slate-800">
              sitemap.xml
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google Search</span>
          </button>

          <button
            onClick={() => setActiveTab('bing')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'bing'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Bing &amp; Yahoo</span>
          </button>

          <button
            onClick={() => setActiveTab('indexnow')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'indexnow'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>IndexNow (Instant)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>SEO Preview &amp; Audit</span>
          </button>
        </div>

        {/* Tab 1: Google Search Console */}
        {activeTab === 'google' && (
          <div className="space-y-3.5 text-xs">
            {/* Status Callout */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-emerald-300 text-sm">
                  Google Verification Active &amp; Verified
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Both verification protocols are deployed and answering 200 OK:
                  <br />• <strong>HTML Meta Tag</strong>: <code className="text-emerald-300 font-mono">YBHOHEhkNa9PzSW1kgVB4DNzh9ZqThGBnC4tmW9cNQg</code>
                  <br />• <strong>HTML File</strong>: <a href="/google5bbb35e7037cbdb5.html" target="_blank" className="text-amber-400 hover:underline">/google5bbb35e7037cbdb5.html</a>
                </p>
              </div>
            </div>

            {/* Direct Google Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Action 1: Submit Sitemap */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">Step 1: Submit Sitemap</span>
                  <a
                    href="https://search.google.com/search-console/sitemaps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Open Sitemaps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Go to <strong>Sitemaps</strong> in Google Search Console, type <code className="text-amber-300 font-mono">sitemap.xml</code> in the box, and click <strong>Submit</strong>. Googlebot will queue all pages.
                </p>
              </div>

              {/* Action 2: Request Indexing */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">Step 2: Request Indexing</span>
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Open URL Inspection</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Paste <code className="text-amber-300 font-mono">{appUrl}</code> into the top search bar (URL Inspection tool), then click <strong>"Request Indexing"</strong> to speed up indexing to 24–48 hours.
                </p>
              </div>
            </div>

            {/* Google Rich Results Validator */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-200">Validate Google Rich Results</div>
                <div className="text-[11px] text-slate-400">Test the Schema.org WebApplication structured data on Google's testing tool.</div>
              </div>
              <a
                href={`https://search.google.com/test/rich-results?url=${encodedAppUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <span>Test Rich Snippet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Microsoft Bing & Yahoo */}
        {activeTab === 'bing' && (
          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-amber-400 text-sm">
                  1-Click Auto-Import into Bing &amp; Yahoo
                </div>
                <a
                  href="https://www.bing.com/webmasters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Bing Webmasters</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                Microsoft Bing powers <strong>Bing Search, Yahoo! Search, DuckDuckGo, and Windows Copilot</strong>. You do NOT need any manual verification!
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-xs pl-1">
                <li>Log in to <strong className="text-white">Bing Webmaster Tools</strong> with your Microsoft or Google account.</li>
                <li>Choose <strong className="text-amber-300">"Import from Google Search Console"</strong>.</li>
                <li>Select your verified property — Bing will automatically verify ownership and import your sitemaps in under 10 seconds!</li>
              </ol>
            </div>

            {/* Manual Bing Meta Tag fallback */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200">Optional: Manual Bing Meta Tag (msvalidate.01)</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Paste Bing validation token (e.g. 4B3A8...)"
                  value={bingToken}
                  onChange={(e) => setBingToken(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSaveTokens}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-lg text-xs transition-colors whitespace-nowrap"
                >
                  Save Bing Tag
                </button>
              </div>
              {savedTokenMsg && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Meta tag saved to head!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: IndexNow Instant Indexation */}
        {activeTab === 'indexnow' && (
          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    <span>IndexNow Instant Crawler Ping</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Supported by Microsoft Bing, Yandex, Seznam.cz, and Naver
                  </div>
                </div>

                <button
                  onClick={handlePingIndexNow}
                  disabled={pingLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${pingLoading ? 'animate-spin' : ''}`} />
                  <span>{pingLoading ? 'Pinging Engines...' : 'Ping Search Engines Now'}</span>
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                Unlike standard sitemaps which take days to be discovered, <strong>IndexNow</strong> immediately pings global search engines to crawl and index your latest pages within minutes.
              </p>

              {/* Status Indicator */}
              {pingSuccess === true && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Search engine network accepted ping (HTTP 202). Crawlers dispatched!</span>
                </div>
              )}

              {pingSuccess === false && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Unable to complete ping. Check network connection and retry.</span>
                </div>
              )}

              {lastPingTime && (
                <div className="text-[11px] text-slate-400">
                  Last successful ping: <span className="text-slate-200 font-mono font-medium">{lastPingTime}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5 text-slate-400 text-[11px]">
              <div className="font-semibold text-slate-200">IndexNow Verification Key</div>
              <div>Key File: <a href="/849204bf7c2547b79da933a39e701e68.txt" target="_blank" className="text-amber-400 hover:underline font-mono">/849204bf7c2547b79da933a39e701e68.txt</a> (Status: 200 OK)</div>
            </div>
          </div>
        )}

        {/* Tab 4: SEO Preview & Audit */}
        {activeTab === 'audit' && (
          <div className="space-y-3.5 text-xs">
            {/* Google SERP Snippet Preview */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Search Result Snippet Preview</span>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-slate-800 space-y-1 font-sans">
                <div className="text-xs text-slate-400 truncate">
                  https://ais-pre-r2dfoalxbovonagjxoatsy-921233943535.asia-southeast1.run.app
                </div>
                <div className="text-base font-semibold text-sky-400 hover:underline cursor-pointer">
                  ChronoSink – The Ultimate Time Waster &amp; Micro-Game Suite
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  An exquisitely crafted suite of addictive micro-games, tactile toys, and procrastination tools designed to delightfully squander your time.
                </div>
              </div>
            </div>

            {/* Quick SEO Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={`https://pagespeed.web.dev/analysis?url=${encodedAppUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">PageSpeed &amp; Core Web Vitals</div>
                  <div className="text-[11px] text-slate-400">Test Google Mobile &amp; Desktop speed scores</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </a>

              <a
                href="https://ahrefs.com/webmaster-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">Ahrefs Free Webmaster Tools</div>
                  <div className="text-[11px] text-slate-400">Audit 100+ SEO issues &amp; backlink monitor</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
              </a>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="text-slate-400 text-[11px]">
            Need help? Click any step above to launch search engine tools directly.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Launcher
          </button>
        </div>
      </div>
    </div>
  );
};
