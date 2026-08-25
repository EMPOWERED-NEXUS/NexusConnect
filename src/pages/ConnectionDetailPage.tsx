import React, { useState } from 'react';
import { useStore } from '../services/store';
import { structureMemory, generateFollowUpMessage, buildVCardUrl } from '../services/api';
import { RelationshipMemory } from '../types';
import {
  Users,
  ArrowLeft,
  MessageCircle,
  Mail,
  Download,
  Linkedin,
  Globe,
  Sparkles,
  Shield,
  Clock,
  Check,
  Copy,
  Calendar,
  Tag,
  FileText,
  Send,
  AlertTriangle,
  Mic,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ConnectionDetailPageProps {
  connectionId: string;
  onBack: () => void;
}

export const ConnectionDetailPage: React.FC<ConnectionDetailPageProps> = ({ connectionId, onBack }) => {
  const {
    activeUser,
    connections,
    memories,
    saveMemory,
    followUps,
    createFollowUp,
    toggleFollowUpStatus,
    disconnectConnection,
    blockUser,
  } = useStore();

  const connection = connections.find(c => c.id === connectionId);

  if (!connection) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Connection not found</h2>
        <button onClick={onBack} className="mt-4 bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl">
          Back to Network
        </button>
      </div>
    );
  }

  const otherUserId = connection.participantIds.find(id => id !== activeUser.userId) || '';
  const otherProfile = connection.profiles[otherUserId];
  const myMemory = memories.find(m => m.connectionId === connection.id && m.ownerUserId === activeUser.userId);
  const myFollowUps = followUps.filter(f => f.connectionId === connection.id && f.ownerUserId === activeUser.userId);

  // Consented fields
  const fieldsSharedWithMe = connection.consentedFields[otherUserId] || [];
  const fieldsIShared = connection.consentedFields[activeUser.userId] || [];

  // Memory Editor State
  const [rawNoteText, setRawNoteText] = useState(myMemory?.rawText || '');
  const [tagsText, setTagsText] = useState((myMemory?.tags || []).join(', '));
  const [dueDateText, setDueDateText] = useState(myMemory?.followUpDate || '2026-08-30');
  const [isStructuringAI, setIsStructuringAI] = useState(false);
  const [memorySuccessMsg, setMemorySuccessMsg] = useState<string | null>(null);

  // Follow-Up Generator State
  const [selectedTone, setSelectedTone] = useState<string>('partnership');
  const [followUpDraft, setFollowUpDraft] = useState<string>('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isCopiedDraft, setIsCopiedDraft] = useState(false);

  // Audio recording placeholder state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const availableTones = [
    { id: 'partnership', label: 'Partnership' },
    { id: 'warm', label: 'Warm' },
    { id: 'professional', label: 'Professional' },
    { id: 'short', label: 'Short & Direct' },
    { id: 'friendly', label: 'Friendly' },
    { id: 'investor', label: 'Investor Update' },
    { id: 'mentor', label: 'Mentor Request' },
    { id: 'event', label: 'Event Follow-up' },
  ];

  const handleSaveMemory = async (useAI = false) => {
    if (!rawNoteText.trim()) return;

    let structured = myMemory?.structuredContext;
    let autoTags = tagsText
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    if (useAI) {
      setIsStructuringAI(true);
      const aiResult = await structureMemory(rawNoteText, {
        displayName: otherProfile.displayName,
        organization: otherProfile.organization,
      });
      if (aiResult.structuredContext) {
        structured = aiResult.structuredContext;
      }
      if (aiResult.tags && aiResult.tags.length > 0) {
        autoTags = Array.from(new Set([...autoTags, ...aiResult.tags]));
        setTagsText(autoTags.join(', '));
      }
      setIsStructuringAI(false);
    }

    saveMemory({
      connectionId: connection.id,
      ownerUserId: activeUser.userId,
      targetUserId: otherUserId,
      targetDisplayName: otherProfile.displayName,
      rawText: rawNoteText,
      structuredContext: structured,
      tags: autoTags,
      followUpDate: dueDateText || undefined,
    });

    setMemorySuccessMsg(useAI ? 'Memory structured with Gemini AI & saved!' : 'Private memory updated!');
    setTimeout(() => setMemorySuccessMsg(null), 3000);
  };

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    const result = await generateFollowUpMessage({
      style: selectedTone,
      user: activeUser,
      target: otherProfile,
      memorySummary: myMemory?.structuredContext,
      context: connection.sourceContext,
    });
    setFollowUpDraft(result.message);
    setIsGeneratingDraft(false);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(followUpDraft);
    setIsCopiedDraft(true);
    setTimeout(() => setIsCopiedDraft(false), 2000);
  };

  const handleLaunchWhatsApp = (draftMsg?: string) => {
    if (!otherProfile.whatsapp) return;
    const clean = otherProfile.whatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(draftMsg || followUpDraft || 'Hi, following up on our meeting!');
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  const handleCreateTaskFromDraft = () => {
    if (!followUpDraft) return;
    createFollowUp({
      connectionId: connection.id,
      targetUserId: otherUserId,
      targetDisplayName: otherProfile.displayName,
      targetEmail: fieldsSharedWithMe.includes('email') ? otherProfile.email : undefined,
      targetWhatsapp: fieldsSharedWithMe.includes('whatsapp') ? otherProfile.whatsapp : undefined,
      title: `Follow up with ${otherProfile.displayName}`,
      note: 'Follow-up generated with Nexus AI',
      draftMessage: followUpDraft,
      style: selectedTone as any,
      dueDate: dueDateText || '2026-08-30',
      priority: 'high',
    });
    alert('Follow-up task added to your dashboard!');
  };

  const handleDisconnect = () => {
    if (window.confirm(`Disconnect from ${otherProfile.displayName}? This will revoke shared permissions.`)) {
      disconnectConnection(connection.id);
      onBack();
    }
  };

  const handleBlock = () => {
    if (window.confirm(`Block ${otherProfile.displayName}? They will no longer be able to see your profile or connect.`)) {
      blockUser(otherUserId);
      onBack();
    }
  };

  return (
    <div id="connection-detail-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Network</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-base shrink-0">
              {otherProfile.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{otherProfile.displayName}</h1>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Mutual Connection
                </span>
              </div>
              <p className="text-xs text-teal-800 font-semibold">{otherProfile.role} &bull; {otherProfile.organization}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{otherProfile.country} &bull; {otherProfile.industry}</p>
            </div>
          </div>

          {/* Quick Communication Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {otherProfile.whatsapp && fieldsSharedWithMe.includes('whatsapp') && (
              <button
                type="button"
                onClick={() => handleLaunchWhatsApp()}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3.5 rounded-xl shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            )}

            <a
              href={buildVCardUrl(otherProfile, fieldsSharedWithMe)}
              download={`${otherProfile.slug}.vcf`}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-200 transition"
              title="Save contact card to phone / address book"
            >
              <Download className="w-4 h-4 text-teal-700" />
              <span>Save .vcf</span>
            </a>

            {otherProfile.linkedin && fieldsSharedWithMe.includes('linkedin') && (
              <a
                href={otherProfile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded-xl border border-slate-200 transition"
                title="Open LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Meeting Context Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-700" />
            <span>Connected: <strong>{connection.sourceContext}</strong></span>
          </span>
          <span className="text-[11px] text-slate-400">
            {new Date(connection.connectedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Flagship Feature 1: Private NexusMemory (Owner-Only) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Private NexusMemory</span>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                  <Lock className="w-2.5 h-2.5 inline mr-0.5 text-slate-400" />
                  Owner-Only &bull; Private
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Capture key discussions, commitments, and opportunities.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRecordingVoice(!isRecordingVoice)}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
              isRecordingVoice
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isRecordingVoice ? 'Recording Note...' : 'Voice Note'}</span>
          </button>
        </div>

        {/* Audio Note Simulator */}
        {isRecordingVoice && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>Listening to voice note... Speak your interaction memory.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setRawNoteText(prev =>
                  prev + (prev ? ' ' : '') + 'Met Daniel at GYLS; discussed offline tablet hardware requirements, mesh syncing, and agreed to send APK for testing.'
                );
                setIsRecordingVoice(false);
              }}
              className="text-[11px] font-bold bg-rose-700 text-white px-2 py-0.5 rounded"
            >
              Transcribe Demo
            </button>
          </div>
        )}

        {/* Note Textarea */}
        <div>
          <textarea
            value={rawNoteText}
            onChange={e => setRawNoteText(e.target.value)}
            placeholder="e.g. Discussed our EduReach rural learning app. She offered to introduce us to 3 school district superintendents next week for a 40-tablet pilot..."
            rows={3}
            className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>

        {/* Tag & Follow-up Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Relationship Tags (comma separated):</span>
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={e => setTagsText(e.target.value)}
              placeholder="e.g. edtech, pilots, gyls2026, hardware"
              className="w-full border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Next Follow-up Due Date:</span>
            </label>
            <input
              type="date"
              value={dueDateText}
              onChange={e => setDueDateText(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* AI Structured Memory Breakdown (if available) */}
        {myMemory?.structuredContext && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <span className="font-bold text-teal-900 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Gemini Structured Extraction</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div>
                <strong>Where We Met:</strong> {myMemory.structuredContext.whereWeMet}
              </div>
              <div>
                <strong>Category:</strong> {myMemory.structuredContext.followUpCategory}
              </div>
              <div className="sm:col-span-2">
                <strong>Topics:</strong> {myMemory.structuredContext.topics?.join(', ')}
              </div>
              {myMemory.structuredContext.commitments?.length ? (
                <div className="sm:col-span-2">
                  <strong>Commitments:</strong> {myMemory.structuredContext.commitments.join('; ')}
                </div>
              ) : null}
              {myMemory.structuredContext.suggestedNextStep && (
                <div className="sm:col-span-2 text-teal-800 font-semibold">
                  <strong>Next Step:</strong> {myMemory.structuredContext.suggestedNextStep}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Memory Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-emerald-700 font-medium">
            {memorySuccessMsg || ''}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSaveMemory(false)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200"
            >
              Save Note
            </button>
            <button
              id="btn-ai-structure-memory"
              type="button"
              onClick={() => handleSaveMemory(true)}
              disabled={isStructuringAI || !rawNoteText.trim()}
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isStructuringAI ? 'animate-spin' : ''}`} />
              <span>{isStructuringAI ? 'Structuring...' : 'Structure with AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flagship Feature 2: Context-Aware Follow-Up Assistant */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Nexus Follow-Up Assistant
              </h2>
              <p className="text-[11px] text-slate-500">
                Draft tailored messages reflecting what you discussed and agreed upon.
              </p>
            </div>
          </div>
        </div>

        {/* Tone Selector Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Choose message style:</label>
          <div className="flex flex-wrap gap-1.5">
            {availableTones.map(tone => (
              <button
                key={tone.id}
                type="button"
                onClick={() => setSelectedTone(tone.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                  selectedTone === tone.id
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          id="btn-generate-followup"
          type="button"
          onClick={handleGenerateDraft}
          disabled={isGeneratingDraft}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGeneratingDraft ? 'animate-spin' : ''}`} />
          <span>{isGeneratingDraft ? 'Generating Tailored Draft...' : `Draft ${selectedTone.replace('_', ' ')} Message`}</span>
        </button>

        {/* Output Draft */}
        {followUpDraft && (
          <div className="space-y-3 pt-2">
            <div className="relative">
              <textarea
                value={followUpDraft}
                onChange={e => setFollowUpDraft(e.target.value)}
                rows={4}
                className="w-full text-xs border border-teal-200 bg-teal-50/20 rounded-xl p-3 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                >
                  {isCopiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedDraft ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateTaskFromDraft}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition"
                >
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Add as Follow-up Task</span>
                </button>
              </div>

              {otherProfile.whatsapp && fieldsSharedWithMe.includes('whatsapp') && (
                <button
                  type="button"
                  onClick={() => handleLaunchWhatsApp(followUpDraft)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg shadow-sm transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send on WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Flagship Feature 3: Consent & Disclosure Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Consented Disclosures & Privacy
            </h2>
            <p className="text-[11px] text-slate-500">
              Review exactly what information is shared between both parties.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* What they shared with you */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">
              {otherProfile.displayName} shared with you:
            </span>
            <div className="flex flex-wrap gap-1">
              {fieldsSharedWithMe.map(field => (
                <span key={field} className="bg-white border border-slate-200 text-slate-700 font-medium text-[10px] px-2 py-0.5 rounded capitalize">
                  {field}
                </span>
              ))}
            </div>
          </div>

          {/* What you shared with them */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">
              You shared with {otherProfile.displayName}:
            </span>
            <div className="flex flex-wrap gap-1">
              {fieldsIShared.map(field => (
                <span key={field} className="bg-teal-50 border border-teal-200 text-teal-800 font-medium text-[10px] px-2 py-0.5 rounded capitalize">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Consent can be modified or revoked at any time.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-amber-700 hover:text-amber-900 font-semibold text-xs px-2 py-1"
            >
              Disconnect
            </button>
            <button
              type="button"
              onClick={handleBlock}
              className="text-rose-700 hover:text-rose-900 font-semibold text-xs px-2 py-1"
            >
              Block Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
