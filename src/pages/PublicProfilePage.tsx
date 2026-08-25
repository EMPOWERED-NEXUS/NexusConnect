import React, { useState } from 'react';
import { useStore } from '../services/store';
import { ConsentExchangeModal } from '../components/ConsentExchangeModal';
import { buildVCardUrl } from '../services/api';
import {
  User,
  Building,
  Mail,
  Phone,
  MessageCircle,
  Linkedin,
  Globe,
  Github,
  MapPin,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle2,
  Download,
  Share2,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';

interface PublicProfilePageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenQR: () => void;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({ slug, onNavigate, onOpenQR }) => {
  const { getProfileBySlug, activeUser, getConnectionBetween } = useStore();
  const targetProfile = getProfileBySlug(slug);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!targetProfile) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Profile Not Found</h2>
        <p className="text-xs text-slate-500">The requested profile slug "/p/{slug}" does not exist.</p>
        <button
          onClick={() => onNavigate('home')}
          className="bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isSelf = targetProfile.userId === activeUser.userId;
  const existingConn = getConnectionBetween(activeUser.userId, targetProfile.userId);
  const consentedFields = existingConn ? existingConn.consentedFields[targetProfile.userId] || [] : [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div id="public-profile-card" className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-28">
      {/* Profile Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Header Graphic */}
        <div className="h-28 bg-gradient-to-r from-teal-800 to-slate-900 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition"
              title="Copy Profile Link"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-900 border-4 border-white text-white flex items-center justify-center font-black text-2xl shadow-md">
              {targetProfile.initials}
            </div>

            {/* Action Button */}
            <div>
              {isSelf ? (
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-4 rounded-xl border border-slate-200 transition"
                >
                  Edit My Profile
                </button>
              ) : existingConn ? (
                <button
                  type="button"
                  onClick={() => onNavigate('network', existingConn.id)}
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 px-4 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>View Relationship</span>
                </button>
              ) : (
                <button
                  id="btn-public-connect"
                  type="button"
                  onClick={() => setShowConnectModal(true)}
                  className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition active:scale-95"
                >
                  <span>Connect & Exchange</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Identity & Headline */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {targetProfile.displayName}
              </h1>
              <span className="bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {targetProfile.professionCategory}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-teal-800 font-semibold">
              {targetProfile.role} &bull; {targetProfile.organization}
            </p>

            <p className="text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              {targetProfile.country} &bull; {targetProfile.industry}
            </p>

            {targetProfile.headline && (
              <p className="text-xs sm:text-sm text-slate-700 font-medium pt-2">
                "{targetProfile.headline}"
              </p>
            )}

            {targetProfile.bio && (
              <p className="text-xs text-slate-600 leading-relaxed pt-2">
                {targetProfile.bio}
              </p>
            )}
          </div>

          {/* Channels & Consented Fields */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Contact & Channels</span>
              <span className="text-[10px] font-normal text-slate-500">
                <Shield className="w-3 h-3 inline mr-1 text-teal-700" />
                Consent-Governed
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Email */}
              {isSelf || consentedFields.includes('email') ? (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                  <Mail className="w-4 h-4 text-teal-700" />
                  <span className="truncate">{targetProfile.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                  <Mail className="w-4 h-4 text-slate-300" />
                  <span>Email hidden until mutual consent</span>
                </div>
              )}

              {/* WhatsApp */}
              {targetProfile.whatsapp && (isSelf || consentedFields.includes('whatsapp')) ? (
                <a
                  href={`https://wa.me/${targetProfile.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-emerald-900 font-medium transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp: {targetProfile.whatsapp}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                  <MessageCircle className="w-4 h-4 text-slate-300" />
                  <span>WhatsApp private</span>
                </div>
              )}

              {/* LinkedIn */}
              {targetProfile.linkedin && (isSelf || consentedFields.includes('linkedin')) && (
                <a
                  href={targetProfile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-blue-700 font-medium transition"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="truncate">LinkedIn Profile</span>
                </a>
              )}

              {/* Website */}
              {targetProfile.website && (isSelf || consentedFields.includes('website')) && (
                <a
                  href={targetProfile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-medium transition"
                >
                  <Globe className="w-4 h-4 text-teal-700" />
                  <span className="truncate">{targetProfile.website}</span>
                </a>
              )}
            </div>
          </div>

          {/* Needs & Offers (Matchmaking Intelligence) */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-4 text-xs">
            {targetProfile.offers && targetProfile.offers.length > 0 && (
              <div className="bg-teal-50/60 border border-teal-200/80 p-3.5 rounded-xl space-y-1.5">
                <span className="font-bold text-teal-950 block text-[11px]">
                  What {targetProfile.displayName.split(' ')[0]} can offer:
                </span>
                <ul className="list-disc list-inside text-teal-900 space-y-0.5">
                  {targetProfile.offers.map((offer, idx) => (
                    <li key={idx}>{offer}</li>
                  ))}
                </ul>
              </div>
            )}

            {targetProfile.needs && targetProfile.needs.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 block text-[11px]">
                  What {targetProfile.displayName.split(' ')[0]} is looking for:
                </span>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {targetProfile.needs.map((need, idx) => (
                    <li key={idx}>{need}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* VCF Download */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              /p/{targetProfile.slug}
            </span>
            <a
              href={buildVCardUrl(targetProfile, isSelf ? ['email', 'whatsapp', 'phone', 'organization', 'role', 'linkedin', 'website'] : consentedFields)}
              download={`${targetProfile.slug}.vcf`}
              className="flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Contact (.vcf)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <ConsentExchangeModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          targetProfile={targetProfile}
          sourceContext="Met via NexusConnect Profile Link"
          onSuccess={() => {
            alert(`Connection request sent to ${targetProfile.displayName}!`);
          }}
        />
      )}
    </div>
  );
};
