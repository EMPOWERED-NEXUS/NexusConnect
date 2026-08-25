import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../services/store';
import { ConsentExchangeModal } from '../components/ConsentExchangeModal';
import { ConnectionRequest, UserProfile } from '../types';
import {
  QrCode,
  Camera,
  Share2,
  Copy,
  Check,
  Download,
  Users,
  Shield,
  Clock,
  ArrowRight,
  UserCheck,
  Maximize2,
} from 'lucide-react';

interface ConnectPageProps {
  onNavigateToProfile: (slug: string) => void;
}

export const ConnectPage: React.FC<ConnectPageProps> = ({ onNavigateToProfile }) => {
  const { activeUser, connectionRequests, availableProfiles } = useStore();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeRequestToAccept, setActiveRequestToAccept] = useState<{
    request: ConnectionRequest;
    targetProfile: UserProfile;
  } | null>(null);

  const profileUrl = `${window.location.origin}/#/p/${activeUser.slug}`;

  useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 340,
      margin: 2,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    }).then(setQrDataUrl);
  }, [activeUser.slug, profileUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${activeUser.displayName} - NexusConnect Profile`,
          text: `Connect with me on NexusConnect: ${activeUser.headline}`,
          url: profileUrl,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  const incomingRequests = connectionRequests.filter(
    r => r.recipientUserId === activeUser.userId && r.status === 'pending'
  );
  const outgoingRequests = connectionRequests.filter(
    r => r.requesterUserId === activeUser.userId && r.status === 'pending'
  );

  return (
    <div id="connect-screen" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <QrCode className="w-6 h-6 text-teal-700" />
          <span>Nexus Exchange</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          One scan. One connection. Your information stays under your control.
        </p>
      </div>

      {/* Main QR Presentation Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center max-w-md mx-auto relative overflow-hidden">
        <div className="inline-block p-4 bg-white rounded-2xl border-2 border-teal-600/30 shadow-lg mb-4">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Your Nexus QR" className="w-60 h-60 mx-auto object-contain" />
          ) : (
            <div className="w-60 h-60 flex items-center justify-center text-xs text-slate-400">
              Generating Badge...
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{activeUser.displayName}</h2>
          <p className="text-xs text-teal-800 font-semibold">{activeUser.role} &bull; {activeUser.organization}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{activeUser.country} &bull; {activeUser.industry}</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 my-4 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-slate-600 truncate mr-2">/p/{activeUser.slug}</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold shrink-0"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Profile</span>
          </button>
          <a
            href={qrDataUrl}
            download={`nexus_qr_${activeUser.slug}.png`}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Save Badge</span>
          </a>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span>Dynamic QR: Sensitive details require mutual approval.</span>
        </div>
      </div>

      {/* Incoming Connection Requests */}
      {incomingRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></div>
            <h3 className="text-sm font-bold text-slate-900">
              Incoming Connection Requests ({incomingRequests.length})
            </h3>
          </div>

          <div className="space-y-3">
            {incomingRequests.map(req => {
              const requester = availableProfiles.find(p => p.userId === req.requesterUserId) || req.requesterProfile;
              return (
                <div
                  key={req.id}
                  className="p-4 bg-teal-50/40 rounded-xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {requester.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{requester.displayName}</h4>
                      <p className="text-[11px] text-teal-800 font-medium">{requester.role} &bull; {requester.organization}</p>
                      <p className="text-[10px] text-slate-500">{req.sourceContext}</p>
                      {req.introMessage && (
                        <p className="text-xs text-slate-700 italic mt-1 bg-white p-2 rounded border border-teal-100">
                          "{req.introMessage}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveRequestToAccept({ request: req, targetProfile: requester })}
                    className="flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition active:scale-95"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Review & Accept</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Pending Outgoing Requests ({outgoingRequests.length})</span>
          </h3>

          <div className="space-y-2">
            {outgoingRequests.map(req => {
              const recipient = availableProfiles.find(p => p.userId === req.recipientUserId) || req.recipientProfile;
              return (
                <div
                  key={req.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {recipient.initials}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{recipient.displayName}</span>
                      <span className="text-[11px] text-slate-500">{recipient.role}, {recipient.organization}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    Awaiting Acceptance
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accept / Consent Exchange Modal */}
      {activeRequestToAccept && (
        <ConsentExchangeModal
          isOpen={!!activeRequestToAccept}
          onClose={() => setActiveRequestToAccept(null)}
          targetProfile={activeRequestToAccept.targetProfile}
          incomingRequest={activeRequestToAccept.request}
          onSuccess={() => {
            alert(`Mutual connection formed with ${activeRequestToAccept.targetProfile.displayName}!`);
          }}
        />
      )}
    </div>
  );
};
