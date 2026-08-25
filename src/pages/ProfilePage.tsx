import React, { useState } from 'react';
import { useStore } from '../services/store';
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
  Tag,
  Save,
  Check,
  Shield,
  Sparkles,
  QrCode,
} from 'lucide-react';

interface ProfilePageProps {
  onOpenQR: () => void;
  onNavigate: (view: string, param?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenQR, onNavigate }) => {
  const { activeUser, updateActiveUserProfile } = useStore();

  const [formData, setFormData] = useState({
    displayName: activeUser.displayName,
    role: activeUser.role,
    organization: activeUser.organization,
    headline: activeUser.headline,
    bio: activeUser.bio,
    country: activeUser.country,
    industry: activeUser.industry,
    email: activeUser.email,
    whatsapp: activeUser.whatsapp || '',
    phone: activeUser.phone || '',
    linkedin: activeUser.linkedin || '',
    website: activeUser.website || '',
    github: activeUser.github || '',
    skills: (activeUser.skills || []).join(', '),
    needs: (activeUser.needs || []).join(', '),
    offers: (activeUser.offers || []).join(', '),
    customGoal: activeUser.customGoal || '',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveUserProfile({
      displayName: formData.displayName,
      role: formData.role,
      organization: formData.organization,
      headline: formData.headline,
      bio: formData.bio,
      country: formData.country,
      industry: formData.industry,
      email: formData.email,
      whatsapp: formData.whatsapp || undefined,
      phone: formData.phone || undefined,
      linkedin: formData.linkedin || undefined,
      website: formData.website || undefined,
      github: formData.github || undefined,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      needs: formData.needs.split(',').map(s => s.trim()).filter(Boolean),
      offers: formData.offers.split(',').map(s => s.trim()).filter(Boolean),
      customGoal: formData.customGoal || undefined,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div id="profile-editor-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-teal-700" />
            <span>My Nexus Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your portable identity and match preferences across all NexusRooms.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate('p', activeUser.slug)}
            className="text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition"
          >
            Preview Public View
          </button>
          <button
            type="button"
            onClick={onOpenQR}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs py-2 px-3.5 rounded-xl shadow-sm transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Show QR Badge</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Identity & Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identity & Organization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role / Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Organization / Company</label>
              <input
                type="text"
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Country / Location</label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Headline (Short summary)</label>
              <input
                type="text"
                value={formData.headline}
                onChange={e => setFormData({ ...formData, headline: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Channels */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Contact Channels</span>
            <span className="text-[11px] font-normal text-slate-500">
              <Shield className="w-3 h-3 inline mr-1 text-teal-700" />
              Shared only upon mutual consent
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">WhatsApp (with country code)</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+233 24 123 4567"
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">LinkedIn Profile URL</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.org"
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Matchmaking Intelligence Inputs */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>NexusMatch Synergy Engine Data</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                What are you looking for / Need? (comma separated)
              </label>
              <input
                type="text"
                value={formData.needs}
                onChange={e => setFormData({ ...formData, needs: e.target.value })}
                placeholder="e.g. School partnerships, offline hardware integration, grant funding"
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                What can you offer peers? (comma separated)
              </label>
              <input
                type="text"
                value={formData.offers}
                onChange={e => setFormData({ ...formData, offers: e.target.value })}
                placeholder="e.g. Offline curriculum software, rural school deployment experience"
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Skills & Capabilities (comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. EdTech, Product Strategy, Flutter, Curriculum Design"
                className="w-full border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-emerald-700 font-semibold">
            {isSaved ? 'Profile updated successfully!' : ''}
          </span>
          <button
            id="btn-save-profile"
            type="submit"
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-sm transition active:scale-95"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
