import React, { useState } from 'react';
import { useStore } from '../services/store';
import { UserCheck, RefreshCw, ChevronDown, Sparkles, Shield, User } from 'lucide-react';

export const DemoSwitcherBar: React.FC = () => {
  const { activeUser, setActiveUserById, availableProfiles, resetToInitialDemoData } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all demo data (connections, memories, requests) back to pristine initial state?')) {
      setIsResetting(true);
      resetToInitialDemoData();
      setTimeout(() => setIsResetting(false), 400);
    }
  };

  return (
    <div id="demo-switcher-bar" className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-40 relative">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-teal-400 bg-teal-950/70 border border-teal-800/80 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          Interactive Demo Persona
        </span>
        <span className="text-slate-400 hidden sm:inline">Active User:</span>

        {/* Dropdown selector */}
        <div className="relative">
          <button
            id="btn-persona-selector"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium px-2.5 py-1 rounded border border-slate-700 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{activeUser.displayName}</span>
            <span className="text-slate-400 text-[11px] hidden md:inline">({activeUser.role}, {activeUser.organization})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isOpen && (
            <div
              id="persona-dropdown-menu"
              className="absolute left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                Switch perspective to test 2-way consent & exchange:
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                {availableProfiles.slice(0, 6).map(p => (
                  <button
                    key={p.userId}
                    id={`persona-option-${p.slug}`}
                    type="button"
                    onClick={() => {
                      setActiveUserById(p.userId);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-800 transition ${
                      p.userId === activeUser.userId ? 'bg-teal-950/40 text-teal-300' : 'text-slate-200'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {p.initials}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs flex items-center gap-1">
                        {p.displayName}
                        {p.userId === activeUser.userId && <UserCheck className="w-3 h-3 text-teal-400 inline" />}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{p.role} &bull; {p.organization}</div>
                      <div className="text-[10px] text-slate-500">{p.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400 hidden lg:inline">
          <Shield className="w-3 h-3 inline mr-1 text-slate-400" />
          Consent-First Relationship Intelligence
        </span>
        <button
          id="btn-reset-demo-data"
          type="button"
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition"
          title="Reset database to seed state"
        >
          <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
