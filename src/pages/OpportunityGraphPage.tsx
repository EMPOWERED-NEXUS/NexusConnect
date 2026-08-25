import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Layers,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  Shield,
  Clock,
  Target,
  CheckCircle2,
  TrendingUp,
  Cpu,
  BookOpen,
  DollarSign,
  Building,
} from 'lucide-react';

interface OpportunityGraphPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const OpportunityGraphPage: React.FC<OpportunityGraphPageProps> = ({ onNavigate }) => {
  const { activeUser, connections, memories, availableProfiles, rooms } = useStore();
  const [selectedClusterId, setSelectedClusterId] = useState<string>('cluster-edtech');

  const clusters = [
    {
      id: 'cluster-edtech',
      title: 'School Alliances & Regional Pilots',
      icon: BookOpen,
      count: 2,
      category: 'Education & Distribution',
      opportunitySummary: 'Partnerships to deploy offline learning tablets across 350+ schools in Ghana & Nigeria.',
      suggestedAction: 'Schedule 20-minute briefing with Dr. Sarah Jin to review the Q4 rural pilot protocol.',
      people: [
        availableProfiles.find(p => p.userId === 'usr_sarah_jin'),
        availableProfiles.find(p => p.userId === 'usr_amanda_kwesi'),
      ].filter(Boolean),
    },
    {
      id: 'cluster-hardware',
      title: 'Hardware & IoT Architecture',
      icon: Cpu,
      count: 1,
      category: 'Engineering & Supply Chain',
      opportunitySummary: 'Custom solar charging firmware and offline P2P mesh syncing for rugged school tablets.',
      suggestedAction: 'Send EduReach APK & Hardware Specs to Daniel Obi on WhatsApp.',
      people: [availableProfiles.find(p => p.userId === 'usr_daniel_obi')].filter(Boolean),
    },
    {
      id: 'cluster-funding',
      title: 'Impact Investment & Seed Capital',
      icon: DollarSign,
      count: 1,
      category: 'Capital & Expansion',
      opportunitySummary: '$250k - $750k seed funding for emerging market digital infrastructure.',
      suggestedAction: 'Connect with Elena Rostova at GYLS 2026 to present 6-month retention data.',
      people: [availableProfiles.find(p => p.userId === 'usr_elena_rostova')].filter(Boolean),
    },
    {
      id: 'cluster-policy',
      title: 'Youth Leadership & Policy',
      icon: Building,
      count: 1,
      category: 'Public Sector Alliances',
      opportunitySummary: 'Government accreditation for youth entrepreneurship programs.',
      suggestedAction: 'Share GYLS outcomes summary with room organizers.',
      people: [availableProfiles.find(p => p.userId === 'usr_kofi_mensah')].filter(Boolean),
    },
  ];

  const activeCluster = clusters.find(c => c.id === selectedClusterId) || clusters[0];

  return (
    <div id="opportunity-graph-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-700" />
            <span>Opportunity Graph</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI-synthesized clusters connecting complementary needs, offers, and memories into tangible milestones.
          </p>
        </div>
      </div>

      {/* Cluster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusters.map(cluster => {
          const Icon = cluster.icon;
          const isSelected = cluster.id === selectedClusterId;
          return (
            <div
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition ${
                isSelected
                  ? 'bg-teal-900 text-white border-teal-800 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-teal-800 text-teal-200' : 'bg-teal-50 text-teal-700'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {cluster.count} Profiles
                </span>
              </div>

              <h3 className="text-sm font-bold leading-snug">{cluster.title}</h3>
              <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                {cluster.category}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Cluster Deep-Dive */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              {activeCluster.category}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5">
              {activeCluster.title}
            </h2>
          </div>

          <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl max-w-sm">
            <span className="text-[10px] font-bold text-teal-900 uppercase block">Next Activation Step</span>
            <p className="text-xs text-teal-950 font-semibold mt-0.5">{activeCluster.suggestedAction}</p>
          </div>
        </div>

        {/* Opportunity Narrative */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <span>Strategic Opportunity Analysis:</span>
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {activeCluster.opportunitySummary}
          </p>
        </div>

        {/* Involved Profiles in this Cluster */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Connected & Recommended People in this Cluster:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCluster.people.map(person => {
              if (!person) return null;
              return (
                <div
                  key={person.userId}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {person.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{person.displayName}</h4>
                      <p className="text-[11px] text-teal-800 font-medium">{person.role} &bull; {person.organization}</p>
                      <p className="text-[10px] text-slate-500">{person.country}</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <strong className="text-slate-700">Offers:</strong> {person.offers?.[0]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onNavigate('p', person.slug)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('network')}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      <span>Engage Cluster</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
