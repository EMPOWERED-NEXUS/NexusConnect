import React, { useState } from 'react';
import { useStore } from '../services/store';
import { queryNexusAgent } from '../services/api';
import { UserProfile } from '../types';
import { ConsentExchangeModal } from '../components/ConsentExchangeModal';
import {
  Sparkles,
  Send,
  Users,
  Compass,
  ArrowRight,
  Shield,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface NexusAgentPageProps {
  initialQuery?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const NexusAgentPage: React.FC<NexusAgentPageProps> = ({ initialQuery, onNavigate }) => {
  const { activeUser, connections, memories, followUps, rooms, availableProfiles, getConnectionBetween } = useStore();

  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'agent';
      text: string;
      recommendedProfiles?: {
        userId: string;
        profile: UserProfile;
        relevanceReason: string;
        actionType: 'connect' | 'followup' | 'view_memory';
      }[];
      citations?: string[];
      suggestedActions?: string[];
    }>
  >([
    {
      sender: 'agent',
      text: `Hello ${activeUser.displayName.split(' ')[0]}! I'm your Nexus Agent. I can help you find high-value collaborators in your active rooms, recall past interaction memories, or prepare customized follow-ups. What would you like to know?`,
      suggestedActions: [
        'Who should I meet at GYLS 2026 for school partnerships?',
        'Who in my network has hardware and offline device experience?',
        'Who should I follow up with this week?',
        'Who did I meet in Lagos?',
      ],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [targetConnectProfile, setTargetConnectProfile] = useState<UserProfile | null>(null);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const myMemories = memories.filter(m => m.ownerUserId === activeUser.userId);
      const myFollowups = followUps.filter(f => f.ownerUserId === activeUser.userId);

      const agentResult = await queryNexusAgent({
        query: q,
        activeUser,
        permittedNetwork: availableProfiles,
        permittedRooms: rooms,
        pendingFollowUps: myFollowups,
        privateMemories: myMemories,
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: agentResult.text,
          recommendedProfiles: agentResult.recommendedPeople,
          citations: agentResult.citations,
        },
      ]);
    } catch (err) {
      console.error('Nexus agent error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: 'I apologize, but I encountered an error searching your network intelligence. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="nexus-agent-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Nexus Agent</span>
              <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Privacy-Grounded AI
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Query your relationship graph, room attendees, and private interaction notes.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 text-[10px] text-teal-700 font-medium">
                  Verified grounded sources: {msg.citations.join(', ')}
                </div>
              )}

              {/* Recommended Person Cards */}
              {msg.recommendedProfiles && msg.recommendedProfiles.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Recommended Collaborators:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.recommendedProfiles.map(item => {
                      const person = item.profile;
                      const existingConn = getConnectionBetween(activeUser.userId, person.userId);
                      return (
                        <div
                          key={person.userId}
                          className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {person.initials}
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-xs text-slate-900 truncate">{person.displayName}</h4>
                              <p className="text-[11px] text-teal-800 font-medium truncate">{person.role} &bull; {person.organization}</p>
                              <p className="text-[10px] text-slate-500">{person.country}</p>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-600 italic mt-2 bg-white p-1.5 rounded border border-slate-200">
                            {item.relevanceReason}
                          </p>

                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => onNavigate('p', person.slug)}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                            >
                              Profile
                            </button>

                            {existingConn ? (
                              <button
                                type="button"
                                onClick={() => onNavigate('network', existingConn.id)}
                                className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200"
                              >
                                View Memory
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setTargetConnectProfile(person)}
                                className="text-[11px] font-bold bg-teal-700 hover:bg-teal-800 text-white px-2.5 py-1 rounded-md shadow-sm transition"
                              >
                                Connect
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actionable Prompt Suggestions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="text-[11px] text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 font-medium px-2.5 py-1 rounded-lg text-left transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-3 bg-white rounded-2xl border border-slate-200 w-fit">
            <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
            <span>Nexus Agent is analyzing your relationship graph...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="sticky bottom-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-lg">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            id="agent-chat-input"
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask about people, skills, meeting notes, or follow-ups..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="flex items-center justify-center gap-1 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Consent Modal if connecting from Agent */}
      {targetConnectProfile && (
        <ConsentExchangeModal
          isOpen={!!targetConnectProfile}
          onClose={() => setTargetConnectProfile(null)}
          targetProfile={targetConnectProfile}
          onSuccess={() => {
            alert(`Connection request sent to ${targetConnectProfile.displayName}!`);
          }}
        />
      )}
    </div>
  );
};
