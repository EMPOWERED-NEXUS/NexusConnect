import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Building2,
  TrendingUp,
  Users,
  Compass,
  QrCode,
  Download,
  Plus,
  ArrowRight,
  Shield,
  CheckCircle2,
  Globe2,
  Zap,
} from 'lucide-react';

interface OrganizerDashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const OrganizerDashboardPage: React.FC<OrganizerDashboardPageProps> = ({ onNavigate }) => {
  const { rooms, availableProfiles } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const metrics = [
    { label: 'Event Participants', value: '184', change: '+24 today', icon: Users },
    { label: 'Connection Rate', value: '78.4%', change: 'Above benchmark', icon: TrendingUp },
    { label: 'Match Activation Rate', value: '64.2%', change: '118 intro meetings', icon: Zap },
    { label: 'Cross-Border Exchange', value: '54.0%', change: '18 countries', icon: Globe2 },
  ];

  return (
    <div id="organizer-dashboard-view" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-700" />
            <span>Organizer Relationship Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Measure engagement, connection rates, and high-synergy networking across your events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Room</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{metric.label}</span>
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{metric.value}</div>
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                {metric.change}
              </span>
            </div>
          );
        })}
      </div>

      {/* Managed Rooms */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Active Managed Rooms</span>
          <span className="text-xs text-slate-400 font-normal">{rooms.length} Active</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {rooms.map(room => (
            <div key={room.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900">{room.name}</h3>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded-full border border-teal-200">
                    {room.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{room.location} &bull; Code: <span className="font-mono font-bold text-teal-900">{room.inviteCode}</span></p>
                <p className="text-[11px] text-slate-600 mt-0.5">{room.memberCount} Participants registered</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('rooms', room.slug)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
                >
                  Manage Room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#/rooms/${room.slug}`);
                    alert(`Room link copied: ${window.location.origin}/#/rooms/${room.slug}`);
                  }}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition"
                >
                  Copy Invitation Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organizer Privacy & Governance Explainer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-teal-700" />
          <span>Organizer Privacy Standard</span>
        </span>
        <p>
          Organizers receive aggregate connection health metrics. Individual participant contact details and private meeting memories remain strictly end-user encrypted and consented.
        </p>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create NexusRoom</h3>
            <p className="text-xs text-slate-500">Provision a branded networking space for your conference or cohort.</p>

            <form
              onSubmit={e => {
                e.preventDefault();
                alert('Room provisioned! Invitation QR and attendee portal ready.');
                setShowCreateModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Room / Event Name</label>
                <input
                  type="text"
                  defaultValue="Pan-African Youth Tech Summit 2026"
                  required
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location / Venue</label>
                <input
                  type="text"
                  defaultValue="Nairobi, Kenya & Hybrid"
                  required
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Theme</label>
                <input
                  type="text"
                  defaultValue="Fintech, Climate, Edtech"
                  className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-500 hover:text-slate-800 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition"
                >
                  Create & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
