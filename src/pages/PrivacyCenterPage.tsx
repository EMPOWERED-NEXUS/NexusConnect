import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Shield,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  FileJson,
  UserX,
} from 'lucide-react';

export const PrivacyCenterPage: React.FC = () => {
  const { activeUser, connections, memories, disconnectConnection, unblockUser } = useStore();

  const [fieldSettings, setFieldSettings] = useState({
    email: 'connections',
    whatsapp: 'ask',
    phone: 'private',
    linkedin: 'connections',
    bio: 'public',
  });

  const [isSaved, setIsSaved] = useState(false);

  const myConnections = connections.filter(
    c => c.status === 'active' && c.participantIds.includes(activeUser.userId)
  );

  const handleExportData = () => {
    const fullUserData = {
      exportedAt: new Date().toISOString(),
      profile: activeUser,
      connections: myConnections,
      memories: memories.filter(m => m.ownerUserId === activeUser.userId),
    };

    const blob = new Blob([JSON.stringify(fullUserData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusconnect_export_${activeUser.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveDefaults = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div id="privacy-center-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-teal-700" />
          <span>Privacy & Consent Center</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          You own your relationships. Control disclosures, review permissions, and export your portable graph.
        </p>
      </div>

      {/* Default Field Visibility Rules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Default Field Disclosure Preferences</h2>
        <p className="text-xs text-slate-500">
          Set default behavior when sending or accepting new connection requests:
        </p>

        <div className="space-y-3 text-xs">
          {[
            { key: 'email', label: 'Email Address', desc: 'Used for direct meeting follow-up' },
            { key: 'whatsapp', label: 'WhatsApp Number', desc: 'Direct instant messaging' },
            { key: 'phone', label: 'Phone Number', desc: 'Direct voice calling' },
            { key: 'linkedin', label: 'LinkedIn Profile', desc: 'Professional social profile' },
          ].map(field => (
            <div
              key={field.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 gap-2"
            >
              <div>
                <span className="font-bold text-slate-800 block">{field.label}</span>
                <span className="text-[11px] text-slate-500">{field.desc}</span>
              </div>

              <select
                value={(fieldSettings as any)[field.key]}
                onChange={e => setFieldSettings({ ...fieldSettings, [field.key]: e.target.value })}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                <option value="connections">Share with Mutual Connections</option>
                <option value="ask">Ask Me Every Time</option>
                <option value="private">Never Share Automatically</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-emerald-700 font-semibold">{isSaved ? 'Preferences saved!' : ''}</span>
          <button
            type="button"
            onClick={handleSaveDefaults}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition"
          >
            Save Default Preferences
          </button>
        </div>
      </div>

      {/* Active Permission Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Active Connections Permission Audit ({myConnections.length})</span>
          <span className="text-xs font-normal text-slate-400">Revoke permissions individually</span>
        </h2>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {myConnections.map(conn => {
            const otherUserId = conn.participantIds.find(id => id !== activeUser.userId) || '';
            const otherProfile = conn.profiles[otherUserId];
            const myShared = conn.consentedFields[activeUser.userId] || [];

            if (!otherProfile) return null;

            return (
              <div key={conn.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{otherProfile.displayName}</span>
                  <span className="text-[11px] text-slate-500">
                    Disclosed: <strong className="text-teal-800">{myShared.join(', ')}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Revoke all permissions and disconnect from ${otherProfile.displayName}?`)) {
                      disconnectConnection(conn.id);
                    }
                  }}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg transition"
                >
                  Revoke & Disconnect
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Sovereignty & Portability */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <FileJson className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Data Sovereignty & Portability</h2>
            <p className="text-xs text-slate-500">
              Download your complete relationship graph and private interaction memories.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
          <div className="text-xs text-slate-700">
            <strong>Complete JSON Archive:</strong> Includes profile, verified connections, consented disclosures, and private notes.
          </div>
          <button
            id="btn-download-my-data"
            type="button"
            onClick={handleExportData}
            className="flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download My Data</span>
          </button>
        </div>
      </div>

      {/* AI Privacy & Transparency Policy */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-600 space-y-2">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-teal-700" />
          <span>Nexus AI Privacy Guarantee</span>
        </span>
        <ul className="list-disc list-inside space-y-1 leading-relaxed">
          <li>Your private meeting notes are stored strictly for your own retrieval and never shared with room organizers or connected peers.</li>
          <li>AI intelligence queries (via Google Gemini) are scoped strictly to your authenticated session data.</li>
          <li>No personal interaction data is sold or used to train public LLMs.</li>
        </ul>
      </div>
    </div>
  );
};
