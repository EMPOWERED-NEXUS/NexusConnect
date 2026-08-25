import React, { useState } from 'react';
import { useStore } from '../services/store';
import { buildVCardUrl } from '../services/api';
import {
  Users,
  Search,
  MessageCircle,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Filter,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface NetworkPageProps {
  onSelectConnection: (connectionId: string) => void;
  onOpenQR: () => void;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({ onSelectConnection, onOpenQR }) => {
  const { activeUser, connections, memories, followUps } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  const myConnections = connections.filter(
    c => c.status === 'active' && c.participantIds.includes(activeUser.userId)
  );

  const filtered = myConnections.filter(c => {
    const otherUserId = c.participantIds.find(id => id !== activeUser.userId) || '';
    const otherProfile = c.profiles[otherUserId];
    if (!otherProfile) return false;

    const memory = memories.find(m => m.connectionId === c.id && m.ownerUserId === activeUser.userId);
    const tags = memory?.tags || [];

    const text = `${otherProfile.displayName} ${otherProfile.role} ${otherProfile.organization} ${otherProfile.country} ${tags.join(' ')}`.toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === 'all' || tags.includes(tagFilter);

    return matchesSearch && matchesTag;
  });

  return (
    <div id="network-directory-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-700" />
            <span>My Network ({myConnections.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your portable relationship graph with consent-governed memories and follow-ups.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenQR}
          className="flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition active:scale-95 shrink-0"
        >
          <span>Connect New Person</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search connections by name, organization, tags, or discussion topics..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Connections List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Your network starts with one hello.</h3>
            <p className="text-xs text-slate-500 mt-1">
              Connect with peers in your active rooms or scan QR codes at events.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenQR}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition"
          >
            Show My QR
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(conn => {
            const otherUserId = conn.participantIds.find(id => id !== activeUser.userId) || '';
            const otherProfile = conn.profiles[otherUserId];
            const memory = memories.find(m => m.connectionId === conn.id && m.ownerUserId === activeUser.userId);
            const pendingFollowup = followUps.find(
              f => f.connectionId === conn.id && f.ownerUserId === activeUser.userId && f.status === 'pending'
            );
            const consentedFields = conn.consentedFields[otherUserId] || [];

            if (!otherProfile) return null;

            return (
              <div
                key={conn.id}
                onClick={() => onSelectConnection(conn.id)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {otherProfile.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900">{otherProfile.displayName}</h3>
                        <p className="text-[11px] text-teal-800 font-medium">{otherProfile.role} &bull; {otherProfile.organization}</p>
                        <p className="text-[10px] text-slate-500">{otherProfile.country} &bull; {conn.sourceContext}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                      Mutual
                    </span>
                  </div>

                  {/* Private Memory Badge */}
                  {memory ? (
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                        <FileText className="w-3 h-3 text-teal-600" />
                        <span>Private Note:</span>
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 italic">
                        "{memory.rawText}"
                      </p>
                      {memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {memory.tags.map(t => (
                            <span key={t} className="bg-white border border-slate-200 text-slate-600 text-[9px] font-medium px-1.5 py-0.2 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 p-2 rounded-lg bg-teal-50/50 border border-dashed border-teal-200 text-[11px] text-teal-800 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>No private memory recorded yet. Click to add notes.</span>
                    </div>
                  )}

                  {/* Follow-up due alert */}
                  {pendingFollowup && (
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Follow-up: {pendingFollowup.title}</span>
                      </span>
                      <span className="text-[10px] text-amber-600 font-normal">Due {pendingFollowup.dueDate}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {otherProfile.whatsapp && consentedFields.includes('whatsapp') && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        WhatsApp Available
                      </span>
                    )}
                    {consentedFields.includes('email') && (
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        Email Permitted
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-teal-700 flex items-center gap-0.5">
                    <span>Manage Memory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
