import React, { useState } from 'react';
import { UserProfile, ConnectionRequest } from '../types';
import { useStore } from '../services/store';
import { Shield, Check, X, Send, Lock, UserCheck, CheckSquare, Square, Info } from 'lucide-react';

interface ConsentExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: UserProfile;
  incomingRequest?: ConnectionRequest;
  roomId?: string;
  sourceContext?: string;
  onSuccess?: () => void;
}

export const ConsentExchangeModal: React.FC<ConsentExchangeModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  incomingRequest,
  roomId,
  sourceContext,
  onSuccess,
}) => {
  const { activeUser, sendConnectionRequest, respondToConnectionRequest } = useStore();

  const isAccepting = !!incomingRequest;

  // Available shareable fields
  const shareableFields = [
    { key: 'displayName', label: 'Full Display Name', value: activeUser.displayName, always: true },
    { key: 'organization', label: 'Organization & Role', value: `${activeUser.role}, ${activeUser.organization}`, always: true },
    { key: 'email', label: 'Email Address', value: activeUser.email, defaultChecked: true },
    { key: 'whatsapp', label: 'WhatsApp Number', value: activeUser.whatsapp, defaultChecked: !!activeUser.whatsapp },
    { key: 'linkedin', label: 'LinkedIn Profile', value: activeUser.linkedin, defaultChecked: !!activeUser.linkedin },
    { key: 'phone', label: 'Direct Phone', value: activeUser.phone, defaultChecked: false },
    { key: 'website', label: 'Website / Portfolio', value: activeUser.website, defaultChecked: !!activeUser.website },
    { key: 'github', label: 'GitHub Profile', value: activeUser.github, defaultChecked: !!activeUser.github },
    { key: 'skills', label: 'Skills & Capabilities', value: (activeUser.skills || []).join(', '), defaultChecked: true },
    { key: 'offers', label: 'What I Can Offer', value: (activeUser.offers || []).join('; '), defaultChecked: true },
    { key: 'needs', label: 'What I Am Looking For', value: (activeUser.needs || []).join('; '), defaultChecked: true },
  ].filter(f => f.always || !!f.value);

  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    return shareableFields.filter(f => f.defaultChecked || f.always).map(f => f.key);
  });

  const [introMessage, setIntroMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleField = (key: string) => {
    if (key === 'displayName' || key === 'organization') return; // required baseline
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(shareableFields.map(f => f.key));
  };

  const handleSelectMinimal = () => {
    setSelectedFields(['displayName', 'organization', 'email', 'linkedin']);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    try {
      if (isAccepting && incomingRequest) {
        respondToConnectionRequest(incomingRequest.id, true, selectedFields);
      } else {
        sendConnectionRequest({
          recipientUserId: targetProfile.userId,
          sharedFields: selectedFields,
          introMessage: introMessage.trim() || undefined,
          roomId,
          sourceContext: sourceContext || `Met directly via NexusConnect`,
        });
      }

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    if (incomingRequest) {
      respondToConnectionRequest(incomingRequest.id, false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="consent-exchange-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isAccepting ? 'Approve Connection & Exchange' : 'Send Connection Request'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Consent-First Disclosure Control
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Profile Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {targetProfile.initials}
            </div>
            <div className="truncate flex-1">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{targetProfile.displayName}</h4>
              <p className="text-[11px] text-teal-800 font-medium truncate">{targetProfile.role} &bull; {targetProfile.organization}</p>
              <p className="text-[10px] text-slate-500">{targetProfile.country} &bull; {targetProfile.industry}</p>
            </div>
          </div>

          {/* If accepting, show what the other person is already sharing */}
          {isAccepting && incomingRequest && (
            <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs space-y-1.5">
              <div className="font-semibold text-teal-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                <span>{targetProfile.displayName} is sharing with you:</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {incomingRequest.requesterSharedFields.map(f => (
                  <span key={f} className="bg-white border border-teal-200 text-teal-800 font-medium text-[10px] px-2 py-0.5 rounded-full capitalize">
                    {f}
                  </span>
                ))}
              </div>
              {incomingRequest.introMessage && (
                <p className="text-[11px] text-slate-700 italic pt-1 border-t border-teal-100">
                  "{incomingRequest.introMessage}"
                </p>
              )}
            </div>
          )}

          {/* Granular Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                {isAccepting ? 'Select information to share back:' : 'Select information to share:'}
              </label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-teal-700 hover:text-teal-900 font-medium"
                >
                  Select all
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleSelectMinimal}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  Minimal
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {shareableFields.map(field => {
                const isSelected = selectedFields.includes(field.key);
                const isLocked = field.always;

                return (
                  <div
                    key={field.key}
                    onClick={() => toggleField(field.key)}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-teal-50/50 border-teal-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 truncate mr-2">
                      <div className="mt-0.5 shrink-0 text-teal-700">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold flex items-center gap-1">
                          <span>{field.label}</span>
                          {isLocked && <span className="text-[10px] text-slate-400 font-normal">(Required)</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{field.value}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Intro Message (when sending request) */}
          {!isAccepting && (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Add an introduction note (optional):
              </label>
              <textarea
                value={introMessage}
                onChange={e => setIntroMessage(e.target.value)}
                placeholder="e.g. Great meeting you at the education session! Would love to follow up on your pilot..."
                rows={2}
                maxLength={240}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          )}

          {/* Privacy Guarantee Explainer */}
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>
              Unchecked items will remain private. You can revise or revoke permissions at any time from your Privacy & Consent Center.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          {isAccepting ? (
            <button
              type="button"
              onClick={handleDecline}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 py-2 px-3 rounded-lg"
            >
              Not Now
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 py-2 px-3 rounded-lg"
            >
              Cancel
            </button>
          )}

          <button
            id="btn-confirm-consent-exchange"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedFields.length === 0}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {isAccepting ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Accept & Exchange</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Request ({selectedFields.length} fields)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
