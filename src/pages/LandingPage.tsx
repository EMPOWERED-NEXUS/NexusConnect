import React from 'react';
import {
  Sparkles,
  QrCode,
  Shield,
  Brain,
  MessageSquare,
  ArrowRight,
  Compass,
  Users,
  CheckCircle2,
  Lock,
  Globe,
  Share2,
  Calendar,
  Building2,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onJoinRoom: (slug: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onJoinRoom }) => {
  const lifecycleSteps = [
    { title: 'Discover', desc: 'Find complementary peers in any room or event based on goals, not random chance.' },
    { title: 'Match', desc: 'AI analyzes needs vs offers to recommend high-synergy collaborations with transparent reasoning.' },
    { title: 'Consent', desc: 'Choose exactly which contact details to disclose for every single connection.' },
    { title: 'Exchange', desc: 'One scan establishes a mutual connection with direct vCard and WhatsApp activation.' },
    { title: 'Remember', desc: 'Privately capture discussions, commitments, and opportunities with structured AI memory.' },
    { title: 'Follow Up', desc: 'Generate context-aware follow-up messages tailored to partnership, investor, or mentor styles.' },
    { title: 'Opportunity', desc: 'Turn your persistent relationship graph into real-world pilots, funding, and partnerships.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 md:py-24 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>The Relationship Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Turn every meeting into <span className="text-teal-700 underline decoration-teal-300 decoration-wavy underline-offset-8">opportunity.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            NexusConnect helps you meet the right people, exchange information with consent, remember every interaction, and turn your network into meaningful opportunities.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              id="hero-btn-create-nexus"
              type="button"
              onClick={onEnterApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm"
            >
              <span>Create Your Nexus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-btn-join-room"
              type="button"
              onClick={() => onJoinRoom('gyls-2026')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-3.5 rounded-xl border border-slate-200 transition text-sm"
            >
              <Compass className="w-4 h-4 text-teal-700" />
              <span>Explore Demo Room</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-teal-600" /> Consent First</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-teal-600" /> Portable Relationship Graph</span>
            <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-teal-600" /> Gemini Intelligence</span>
          </div>
        </div>
      </section>

      {/* The Core Relationship Lifecycle Sequence */}
      <section className="py-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-800">The Complete Solution</h2>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">From First Scan to Active Opportunity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {lifecycleSteps.slice(0, 4).map((step, idx) => (
              <div key={step.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      Phase 0{idx + 1}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {lifecycleSteps.slice(4).map((step, idx) => (
              <div key={step.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      Phase 0{idx + 5}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Complementary NexusMatch</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Recommends people based on synergy (Needs vs Offers), not vanity metrics. Powered by hybrid deterministic scoring + Gemini reasoning.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Granular Consent Engine</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Control exactly what contact details are disclosed for every connection. Never scrape or expose private phone/email without authorization.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Private NexusMemory & Agent</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Record what was discussed and what was promised. Ask your AI agent natural-language queries grounded exclusively in permitted data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Nexus<span className="text-teal-400">Connect</span></span>
            <span className="text-slate-500">&bull;</span>
            <span>Empowered Nexus Global SaaS</span>
          </div>
          <div className="text-slate-400">
            Meet. Connect. Remember. Grow.
          </div>
        </div>
      </footer>
    </div>
  );
};
