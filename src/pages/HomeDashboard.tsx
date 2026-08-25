import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Sparkles,
  Compass,
  Users,
  QrCode,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  MessageCircle,
  Mail,
  Shield,
  ChevronRight,
  Send,
  ExternalLink,
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenQR: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, onOpenQR }) => {
  const { activeUser, rooms, connections, followUps, toggleFollowUpStatus, availableProfiles } = useStore();
  const [quickQuery, setQuickQuery] = useState('');

  // Active user's connections
  const userConnections = connections.filter(c => c.participantIds.includes(activeUser.userId));

  // Pending followups
  const pendingFollowups = followUps.filter(
    f => f.ownerUserId === activeUser.userId && f.status === 'pending'
  );

  // Recommendations for the primary room
  const gylsRoom = rooms[0];
  const otherAttendees = availableProfiles
    .filter(p => p.userId !== activeUser.userId && p.userId !== 'usr_daniel_obi')
    .slice(0, 2);

  const handleQuickAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    onNavigate('agent', quickQuery);
  };

  const handleWhatsAppAction = (phone?: string, draftMsg?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(draftMsg || 'Hi, following up on our conversation!');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div id="home-dashboard-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* Top Greeting & Quick Summary */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Relationship OS Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {activeUser.displayName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 leading-relaxed">
            {activeUser.role} at <span className="font-semibold text-white">{activeUser.organization}</span> &bull; {activeUser.country}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              id="dash-btn-my-qr"
              type="button"
              onClick={onOpenQR}
              className="flex items-center gap-1.5 bg-white text-teal-900 hover:bg-teal-50 text-xs font-bold px-4 py-2 rounded-xl shadow transition active:scale-95"
            >
              <QrCode className="w-4 h-4 text-teal-700" />
              <span>Show My QR</span>
            </button>
            <button
              id="dash-btn-explore-rooms"
              type="button"
              onClick={() => onNavigate('rooms', gylsRoom?.slug)}
              className="flex items-center gap-1.5 bg-teal-800/80 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-teal-600/40 transition"
            >
              <Compass className="w-4 h-4 text-teal-300" />
              <span>Enter {gylsRoom?.name ? gylsRoom.name.substring(0, 24) + '...' : 'Rooms'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background visual */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
          <QrCode className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Ask Nexus Natural-Language Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleQuickAgentSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-teal-600 absolute left-3.5 top-3" />
            <input
              id="input-home-agent-search"
              type="text"
              value={quickQuery}
              onChange={e => setQuickQuery(e.target.value)}
              placeholder="Ask Nexus Agent: 'Who can help with school pilots?' or 'Who in my network has hardware expertise?'"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Next Opportunities & Follow-Ups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Your Next High-Value Matches */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>High-Synergy Matches for You</span>
                </h2>
                <p className="text-[11px] text-slate-500">Based on complementary needs vs offers in GYLS 2026</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('rooms', 'gyls-2026')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {otherAttendees.map(person => (
                <div
                  key={person.userId}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {person.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{person.displayName}</span>
                        <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-semibold px-2 py-0.2 rounded-full">
                          92% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-teal-800 font-medium">{person.role} &bull; {person.organization}</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        <span className="font-semibold text-slate-700">Offers:</span> {person.offers?.[0]}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('p', person.slug)}
                    className="flex items-center justify-center gap-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm shrink-0 transition"
                  >
                    <span>View Reason & Connect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Follow-Ups Due */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Pending Follow-Ups ({pendingFollowups.length})</span>
                </h2>
                <p className="text-[11px] text-slate-500">Activate connections while context is fresh</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('network')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-0.5"
              >
                <span>Manage Tasks</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {pendingFollowups.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-700">You're all caught up!</p>
                <p className="text-[11px]">No pending follow-up reminders right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFollowups.map(task => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{task.title}</span>
                        <span className="text-[11px] text-slate-500">
                          With <span className="font-medium text-slate-700">{task.targetDisplayName}</span> &bull; Due {task.dueDate}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFollowUpStatus(task.id)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"
                      >
                        Mark Done
                      </button>
                    </div>

                    {task.draftMessage && (
                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                        "{task.draftMessage}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      {task.targetWhatsapp && (
                        <button
                          type="button"
                          onClick={() => handleWhatsAppAction(task.targetWhatsapp, task.draftMessage)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Send on WhatsApp</span>
                        </button>
                      )}
                      {task.targetEmail && (
                        <a
                          href={`mailto:${task.targetEmail}?subject=${encodeURIComponent(task.title)}&body=${encodeURIComponent(task.draftMessage || '')}`}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>Send Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Rooms & Network Stats */}
        <div className="space-y-6">
          {/* Active Rooms Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Active Rooms</span>
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('rooms')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                Browse All
              </button>
            </div>

            <div className="space-y-2.5">
              {rooms.slice(0, 2).map(room => (
                <div
                  key={room.id}
                  onClick={() => onNavigate('rooms', room.slug)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/20 cursor-pointer transition"
                >
                  <span className="font-bold text-xs text-slate-900 block truncate">{room.name}</span>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{room.location}</span>
                    <span className="font-medium text-teal-700">{room.memberCount} members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity Graph Cluster Shortcut */}
          <div className="bg-gradient-to-br from-teal-50 to-slate-50 rounded-2xl border border-teal-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-700" />
                <span>Opportunity Graph</span>
              </h2>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Your network has been categorized into actionable synergy clusters.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium mb-4">
              <div className="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span>Hardware & IoT Partners</span>
                <span className="font-bold text-teal-700">1 connection</span>
              </div>
              <div className="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span>School Pilots & Alliance</span>
                <span className="font-bold text-teal-700">2 matches</span>
              </div>
              <div className="flex justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span>Impact Investors</span>
                <span className="font-bold text-teal-700">1 match</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('opportunities')}
              className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Explore Opportunity Graph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
