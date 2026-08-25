import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Code,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Layers,
} from 'lucide-react';

export const DeveloperPortalPage: React.FC = () => {
  const { activeUser } = useStore();
  const [buttonLabel, setButtonLabel] = useState('Connect on Nexus');
  const [buttonTheme, setButtonTheme] = useState<'teal' | 'dark' | 'light'>('teal');
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const profileUrl = `${window.location.origin}/#/p/${activeUser.slug}`;

  const getEmbedCode = (type: 'react' | 'html' | 'link') => {
    if (type === 'react') {
      return `<a
  href="${profileUrl}"
  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="..."/></svg>
  <span>${buttonLabel}</span>
</a>`;
    }
    if (type === 'html') {
      return `<a href="${profileUrl}" target="_blank" class="nexus-connect-btn" style="background:#0f766e;color:#fff;padding:8px 16px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:12px;display:inline-flex;align-items:center;gap:6px;">
  <span>${buttonLabel}</span>
</a>`;
    }
    return profileUrl;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  return (
    <div id="developer-portal-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Code className="w-6 h-6 text-teal-700" />
          <span>Nexus Developer API & Embeds</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Integrate NexusConnect buttons, event registration hooks, and relationship graph endpoints into your web apps.
        </p>
      </div>

      {/* Interactive Embed Builder */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-900">
          Embeddable "Connect on Nexus" Button Builder
        </h2>

        {/* Customization Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Button Text</label>
            <input
              type="text"
              value={buttonLabel}
              onChange={e => setButtonLabel(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Theme</label>
            <select
              value={buttonTheme}
              onChange={e => setButtonTheme(e.target.value as any)}
              className="w-full border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-teal-600 focus:outline-none font-semibold text-slate-700"
            >
              <option value="teal">Nexus Teal</option>
              <option value="dark">Slate Dark</option>
              <option value="light">Minimal Light</option>
            </select>
          </div>
        </div>

        {/* Live Preview */}
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block">Live Button Preview:</span>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 ${
              buttonTheme === 'teal'
                ? 'bg-teal-700 hover:bg-teal-800 text-white'
                : buttonTheme === 'dark'
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
            }`}
          >
            <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[10px]">N</div>
            <span>{buttonLabel}</span>
          </a>
        </div>

        {/* Code Snippets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">HTML / Markdown Snippet</span>
            <button
              type="button"
              onClick={() => copyToClipboard(getEmbedCode('html'), 'html')}
              className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              {isCopied === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied === 'html' ? 'Copied' : 'Copy HTML'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-[11px] font-mono overflow-x-auto">
            {getEmbedCode('html')}
          </pre>
        </div>
      </div>

      {/* REST API Endpoints Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-teal-700" />
          <span>Core REST API Endpoints</span>
        </h2>

        <div className="space-y-3 text-xs">
          {[
            {
              method: 'POST',
              endpoint: '/api/ai/match-reasoning',
              desc: 'Compute complementary match score and reasoned opportunity between two profiles using Gemini.',
            },
            {
              method: 'POST',
              endpoint: '/api/ai/structure-memory',
              desc: 'Extract structured topics, context, commitments, and next steps from raw private notes.',
            },
            {
              method: 'POST',
              endpoint: '/api/ai/generate-followup',
              desc: 'Draft tailored follow-up messages across 8 professional tones.',
            },
            {
              method: 'POST',
              endpoint: '/api/ai/agent-query',
              desc: 'Execute privacy-grounded natural language search across relationship graph and room directory.',
            },
            {
              method: 'GET',
              endpoint: '/api/contact/:profileId.vcf',
              desc: 'Dynamically generate standard vCard format (.vcf) reflecting only mutual consented contact channels.',
            },
          ].map(api => (
            <div key={api.endpoint} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-teal-100 text-teal-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                  {api.method}
                </span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">{api.endpoint}</span>
              </div>
              <p className="text-slate-600 text-[11px]">{api.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
