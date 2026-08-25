import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { fetchMatchReasoning } from '../services/api';
import { UserProfile, MatchRecommendation } from '../types';
import { ConsentExchangeModal } from '../components/ConsentExchangeModal';
import {
  Compass,
  Users,
  Sparkles,
  MapPin,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  Shield,
  MessageCircle,
  QrCode,
  Share2,
  Info,
  ChevronRight,
  Target,
  RefreshCw,
} from 'lucide-react';

interface RoomDetailPageProps {
  roomSlug: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenQR: () => void;
}

export const RoomDetailPage: React.FC<RoomDetailPageProps> = ({ roomSlug, onNavigate, onOpenQR }) => {
  const {
    getRoomBySlug,
    activeUser,
    isMemberOfRoom,
    joinRoom,
    getRoomAttendees,
    getConnectionBetween,
    availableProfiles,
  } = useStore();

  const room = getRoomBySlug(roomSlug);

  const [activeTab, setActiveTab] = useState<'for_you' | 'matches' | 'people' | 'about'>('for_you');
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Find education partners',
    'Find technical partners',
  ]);
  const [customGoalText, setCustomGoalText] = useState<string>(activeUser.customGoal || '');

  // Search & Filters for directory
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Matchmaking State
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);

  // Connect Modal Target
  const [targetConnectProfile, setTargetConnectProfile] = useState<UserProfile | null>(null);

  const isJoined = room ? isMemberOfRoom(room.id) : false;
  const attendees = room ? getRoomAttendees(room.id) : [];

  const standardGoalOptions = [
    'Find collaborators',
    'Find customers',
    'Find investors',
    'Find mentors',
    'Find mentees',
    'Find suppliers',
    'Find technical partners',
    'Find education partners',
    'Find researchers',
    'Find policy experts',
    'Find talent',
    'Find employers',
    'Explore',
  ];

  // Auto generate AI matches when entering the matches tab or when room loads
  useEffect(() => {
    if (!room) return;

    let isMounted = true;
    const generateInitialMatches = async () => {
      setIsLoadingMatches(true);
      const candidates = availableProfiles.filter(p => p.userId !== activeUser.userId);
      const computedMatches: MatchRecommendation[] = [];

      for (const candidate of candidates.slice(0, 4)) {
        const reasoning = await fetchMatchReasoning(activeUser, candidate, room.name);
        if (isMounted) {
          computedMatches.push({
            targetUserId: candidate.userId,
            targetProfile: candidate,
            score: reasoning.score || 85,
            relevanceLabel: (reasoning.relevanceLabel as any) || 'Highly Relevant',
            topReasons: reasoning.topReasons || [
              `Strong alignment between ${activeUser.displayName}'s goals and ${candidate.displayName}'s offerings.`,
            ],
            opportunity: reasoning.opportunity || `Strategic collaboration with ${candidate.organization}`,
            suggestedOpener: reasoning.suggestedOpener || `Hi ${candidate.displayName.split(' ')[0]}, I'd love to connect regarding your work at ${candidate.organization}!`,
            complementarySkills: candidate.skills?.slice(0, 3) || [],
            sharedGoals: candidate.networkingGoals || [],
          });
        }
      }

      if (isMounted) {
        // Sort by score descending
        setMatches(computedMatches.sort((a, b) => b.score - a.score));
        setIsLoadingMatches(false);
      }
    };

    generateInitialMatches();

    return () => {
      isMounted = false;
    };
  }, [room?.id, activeUser.userId]);

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Room Not Found</h2>
        <button
          onClick={() => onNavigate('rooms')}
          className="mt-4 bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Back to Rooms Directory
        </button>
      </div>
    );
  }

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleCompleteJoin = () => {
    joinRoom(room.id, selectedGoals, customGoalText);
    setShowJoinModal(false);
    setActiveTab('matches');
  };

  const filteredAttendees = attendees.filter(p => {
    const text = `${p.displayName} ${p.role} ${p.organization} ${p.country} ${(p.skills || []).join(' ')}`.toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.professionCategory.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div id="room-detail-view" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Room Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                {room.type}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Room
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {room.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {room.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {room.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {room.memberCount} Members
              </span>
              <span className="text-slate-400">
                Organized by <strong className="text-slate-700">{room.organization}</strong>
              </span>
            </div>
          </div>

          {/* Join / Status Action */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {!isJoined ? (
              <button
                id="btn-join-nexus-room"
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition active:scale-95"
              >
                <Target className="w-4 h-4" />
                <span>Join Room & Set Goals</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Joined as Participant</span>
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenQR}
              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Event QR Badge</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'for_you', label: 'For You', icon: Target },
            { id: 'matches', label: 'NexusMatch', icon: Sparkles, badge: 'AI' },
            { id: 'people', label: `People (${attendees.length})`, icon: Users },
            { id: 'about', label: 'About Event', icon: Info },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`room-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-extrabold px-1 rounded ${isActive ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: For You */}
      {activeTab === 'for_you' && (
        <div className="space-y-6">
          {/* Active Goals Card */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-300">
                  Your Event Objectives
                </span>
                <h3 className="text-base font-bold mt-1">Networking Goals in this Room</h3>
                <p className="text-xs text-teal-100/90 mt-1 italic">
                  "{activeUser.customGoal || 'Connecting with complementary founders, educators, and engineers.'}"
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(activeUser.networkingGoals || []).map(g => (
                    <span key={g} className="bg-teal-800/80 border border-teal-500/40 text-teal-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="text-xs font-semibold text-teal-200 hover:text-white underline underline-offset-2 shrink-0"
              >
                Edit Goals
              </button>
            </div>
          </div>

          {/* Quick Highlight Matches */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Top Suggested Collaborators</span>
                </h3>
                <p className="text-[11px] text-slate-500">People whose offerings directly match your needs</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('matches')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
              >
                <span>See All Matches</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.slice(0, 2).map(m => (
                <div
                  key={m.targetUserId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                          {m.targetProfile.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{m.targetProfile.displayName}</h4>
                          <p className="text-[11px] text-teal-800 font-medium">{m.targetProfile.role}, {m.targetProfile.organization}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                        {m.score}% Synergy
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                      💡 {m.opportunity}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onNavigate('p', m.targetProfile.slug)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetConnectProfile(m.targetProfile)}
                      className="flex items-center gap-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-1.5 px-3 rounded-lg shadow-sm transition"
                    >
                      <span>Connect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NexusMatch Flagship Hybrid AI Matching */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-teal-50 border border-teal-200/80 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-teal-950">
                  NexusMatch Complementarity Engine
                </h3>
                <p className="text-[11px] text-teal-800">
                  Matches are determined by comparing your explicit goals and needs against peer capabilities.
                </p>
              </div>
            </div>
            {isLoadingMatches && (
              <span className="flex items-center gap-1.5 text-xs text-teal-700 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Reasoning...</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            {matches.map(m => {
              const existingConn = getConnectionBetween(activeUser.userId, m.targetUserId);
              return (
                <div
                  key={m.targetUserId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-teal-400 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {m.targetProfile.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{m.targetProfile.displayName}</h4>
                          <span className="bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {m.relevanceLabel} ({m.score}%)
                          </span>
                        </div>
                        <p className="text-xs text-teal-800 font-medium">{m.targetProfile.role} &bull; {m.targetProfile.organization}</p>
                        <p className="text-[11px] text-slate-500">{m.targetProfile.country} &bull; {m.targetProfile.industry}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('p', m.targetProfile.slug)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg border border-slate-200"
                      >
                        View Profile
                      </button>
                      {existingConn ? (
                        <button
                          type="button"
                          onClick={() => onNavigate('network', existingConn.id)}
                          className="flex items-center gap-1 bg-emerald-50 text-emerald-800 font-semibold text-xs py-2 px-3 rounded-lg border border-emerald-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTargetConnectProfile(m.targetProfile)}
                          className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm transition active:scale-95"
                        >
                          <span>Connect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Why this person is relevant */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>Why you should meet:</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside text-xs">
                      {m.topReasons.map((reason, rIdx) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>

                    <div className="pt-2 border-t border-slate-200 text-xs">
                      <strong className="text-slate-800">Key Opportunity: </strong>
                      <span className="text-teal-900 font-medium">{m.opportunity}</span>
                    </div>
                  </div>

                  {/* Suggested Conversation Opener */}
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/60 text-xs">
                    <span className="font-bold text-teal-900 text-[11px] block mb-1">
                      Suggested Conversation Opener:
                    </span>
                    <p className="text-slate-700 italic">
                      "{m.suggestedOpener}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: People Directory */}
      {activeTab === 'people' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search attendees by name, organization, skills, or country..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="entrepreneur">Entrepreneurs</option>
              <option value="engineer">Engineers & Tech</option>
              <option value="investor">Investors</option>
              <option value="educator & leader">Educators & Leaders</option>
              <option value="policy expert">Policy Experts</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAttendees.map(person => {
              const existingConn = getConnectionBetween(activeUser.userId, person.userId);
              const isSelf = person.userId === activeUser.userId;

              return (
                <div
                  key={person.userId}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-teal-300 transition flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {person.initials}
                    </div>
                    <div className="truncate flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{person.displayName}</h4>
                        {isSelf && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded">You</span>}
                      </div>
                      <p className="text-[11px] text-teal-800 font-medium truncate">{person.role} &bull; {person.organization}</p>
                      <p className="text-[10px] text-slate-500">{person.country} &bull; {person.industry}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(person.skills || []).slice(0, 2).map(s => (
                          <span key={s} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
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
                    {!isSelf && (
                      existingConn ? (
                        <button
                          type="button"
                          onClick={() => onNavigate('network', existingConn.id)}
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                        >
                          Connected
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTargetConnectProfile(person)}
                          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm transition"
                        >
                          Connect
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: About */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs text-slate-700 leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Event Overview</h3>
            <p className="text-slate-600 leading-relaxed">{room.shortDescription}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-800 block">Dates & Timezone</span>
              <span className="text-slate-500">August 24 - 28, 2026 ({room.timezone})</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Location</span>
              <span className="text-slate-500">{room.location}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Organizer</span>
              <span className="text-slate-500">{room.organizer}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Access Code</span>
              <span className="font-mono text-teal-800 font-bold">{room.inviteCode}</span>
            </div>
          </div>
        </div>
      )}

      {/* Join Room & Goal Selection Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                Step 1 of 1
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                What would make this event valuable for you?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                NexusMatch uses your goals to recommend high-synergy collaborations.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Select your networking goals:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {standardGoalOptions.map(goal => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalToggle(goal)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Specific objective (optional):
                </label>
                <input
                  type="text"
                  value={customGoalText}
                  onChange={e => setCustomGoalText(e.target.value)}
                  placeholder="e.g. I want to meet school networks for our offline learning tablet pilot."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-room-join"
                type="button"
                onClick={handleCompleteJoin}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition"
              >
                Join & Unlock Matches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consent Exchange Modal when connecting */}
      {targetConnectProfile && (
        <ConsentExchangeModal
          isOpen={!!targetConnectProfile}
          onClose={() => setTargetConnectProfile(null)}
          targetProfile={targetConnectProfile}
          roomId={room.id}
          sourceContext={`Met at ${room.name}`}
          onSuccess={() => {
            alert(`Connection request sent to ${targetConnectProfile.displayName}!`);
          }}
        />
      )}
    </div>
  );
};
