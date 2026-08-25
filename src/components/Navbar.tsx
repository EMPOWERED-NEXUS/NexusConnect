import React, { useState } from 'react';
import { useStore } from '../services/store';
import {
  Home,
  Users,
  QrCode,
  Sparkles,
  Layers,
  Bell,
  Search,
  Shield,
  Code,
  Building2,
  Menu,
  X,
  Compass,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenQR }) => {
  const { activeUser, notifications, markNotificationAsRead, clearAllNotifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'rooms', label: 'Rooms', icon: Compass },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'agent', label: 'Nexus Agent', icon: Sparkles, badge: 'AI' },
    { id: 'opportunities', label: 'Opportunities', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-teal-900 transition">
                <span className="tracking-tighter">N</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-base tracking-tight">Nexus<span className="text-teal-700">Connect</span></span>
                  <span className="bg-teal-50 text-teal-700 border border-teal-200/80 font-semibold text-[10px] px-1.5 py-0.2 rounded">OS</span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Relationship Intelligence Platform</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center ml-6 space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-teal-100 text-teal-800 text-[9px] font-bold px-1 rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary Connect Button */}
            <button
              id="btn-nav-show-qr"
              type="button"
              onClick={onOpenQR}
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">My QR / Scan</span>
            </button>

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                id="btn-notifications-toggle"
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-teal-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  id="notifications-popover"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-xs">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.type === 'connection_request') onNavigate('connect');
                            if (n.type === 'room_match') onNavigate('rooms', n.data?.roomId);
                            setShowNotifications(false);
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                            !n.read ? 'bg-teal-50/50' : ''
                          }`}
                        >
                          <div className="font-semibold text-slate-800 flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>}
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">{n.body}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              id="btn-nav-profile"
              type="button"
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
            >
              <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                {activeUser.initials}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[100px] truncate">
                {activeUser.displayName.split(' ')[0]}
              </span>
            </button>

            {/* Secondary Menu Dropdown (More Tools) */}
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div id="mobile-menu-tray" className="md:hidden border-t border-slate-200 py-3 space-y-1 bg-white">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                    currentView === item.id ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onNavigate('organizer');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Organizer Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('privacy');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Privacy & Consent Center</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('developers');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50"
              >
                <Code className="w-4 h-4 text-slate-400" />
                <span>Developer API</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <div id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg">
        <button
          id="tab-mobile-home"
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentView === 'home' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          id="tab-mobile-rooms"
          type="button"
          onClick={() => onNavigate('rooms')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentView === 'rooms' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Rooms</span>
        </button>

        {/* Highlighted Center Connect Tab */}
        <button
          id="tab-mobile-connect"
          type="button"
          onClick={onOpenQR}
          className="flex flex-col items-center -mt-4 bg-teal-700 text-white rounded-full p-2.5 shadow-md hover:bg-teal-800 transition active:scale-95"
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">Connect</span>
        </button>

        <button
          id="tab-mobile-network"
          type="button"
          onClick={() => onNavigate('network')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentView === 'network' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Network</span>
        </button>

        <button
          id="tab-mobile-agent"
          type="button"
          onClick={() => onNavigate('agent')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
            currentView === 'agent' ? 'text-teal-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span>Agent</span>
        </button>
      </div>
    </header>
  );
};
