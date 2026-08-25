import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../services/store';
import {
  QrCode,
  Camera,
  Copy,
  Download,
  Check,
  X,
  Maximize2,
  Minimize2,
  Share2,
  ArrowRight,
  Shield,
  Search,
} from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: (slug: string) => void;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, onNavigateToProfile }) => {
  const { activeUser, availableProfiles } = useStore();
  const [activeTab, setActiveTab] = useState<'show' | 'scan'>('show');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const profileUrl = `${window.location.origin}/#/p/${activeUser.slug}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(profileUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f766e',
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR generation error:', err));
    }
  }, [isOpen, activeUser.slug, profileUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `nexus_qr_${activeUser.slug}.png`;
    a.click();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${activeUser.displayName} - NexusConnect Profile`,
          text: `Connect with me on NexusConnect: ${activeUser.headline}`,
          url: profileUrl,
        });
      } catch (e) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSimulateScan = (slug: string) => {
    onClose();
    onNavigateToProfile(slug);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const cleanSlug = manualCode.trim().toLowerCase().replace(/^\/p\//, '');
    onClose();
    onNavigateToProfile(cleanSlug);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="nexus-qr-modal"
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full transition-all ${
          isFullScreen ? 'max-w-xl p-8' : 'max-w-md'
        }`}
      >
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              id="tab-show-qr"
              type="button"
              onClick={() => setActiveTab('show')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'show'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>My Nexus QR</span>
            </button>
            <button
              id="tab-scan-qr"
              type="button"
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'scan'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {activeTab === 'show' && (
              <button
                id="btn-toggle-fullscreen"
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Event Mode'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            <button
              id="btn-close-qr-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Show My QR */}
        {activeTab === 'show' && (
          <div className="p-6 text-center">
            <div className="inline-block p-4 bg-white rounded-2xl border-2 border-teal-600/30 shadow-lg mb-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="NexusConnect QR"
                  className={`${isFullScreen ? 'w-64 h-64 sm:w-72 sm:h-72' : 'w-52 h-52'} mx-auto object-contain`}
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">{activeUser.displayName}</h3>
              <p className="text-xs text-teal-800 font-medium">{activeUser.role} &bull; {activeUser.organization}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeUser.country} &bull; {activeUser.industry}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left mb-5 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-mono text-[11px] truncate mr-2">
                /p/{activeUser.slug}
              </span>
              <button
                id="btn-copy-profile-link"
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
                id="btn-share-qr-native"
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </button>
              <button
                id="btn-download-qr-image"
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-4 h-4" />
                <span>Save Image</span>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Scanning only discloses fields you approve.</span>
            </div>
          </div>
        )}

        {/* Tab 2: Scan QR / Enter Code */}
        {activeTab === 'scan' && (
          <div className="p-6">
            <div className="bg-slate-900 text-white rounded-xl p-6 text-center relative overflow-hidden mb-5">
              <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto mb-3 border border-teal-500/30 animate-pulse">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold">Event QR Scanner</h4>
              <p className="text-slate-300 text-xs mt-1">
                Point camera at another participant's NexusConnect QR badge.
              </p>

              {/* Fast simulated scan trigger for instant testing */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">Quick Demo Scan (Simulate Camera Scan):</span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {availableProfiles
                    .filter(p => p.userId !== activeUser.userId)
                    .slice(0, 3)
                    .map(p => (
                      <button
                        key={p.userId}
                        type="button"
                        onClick={() => handleSimulateScan(p.slug)}
                        className="bg-slate-800 hover:bg-teal-900 hover:text-teal-200 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-700 transition flex items-center gap-1"
                      >
                        <span>Scan {p.displayName.split(' ')[0]}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Manual Code / Slug Input */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Or enter Profile Slug / Room Code manually:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="e.g. dr-sarah-jin or LEAD2026"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                >
                  Open
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
