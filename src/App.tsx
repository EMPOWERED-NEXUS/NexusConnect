import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './services/store';
import { DemoSwitcherBar } from './components/DemoSwitcherBar';
import { Navbar } from './components/Navbar';
import { QRModal } from './components/QRModal';

import { LandingPage } from './pages/LandingPage';
import { HomeDashboard } from './pages/HomeDashboard';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { ConnectPage } from './pages/ConnectPage';
import { NetworkPage } from './pages/NetworkPage';
import { ConnectionDetailPage } from './pages/ConnectionDetailPage';
import { NexusAgentPage } from './pages/NexusAgentPage';
import { OpportunityGraphPage } from './pages/OpportunityGraphPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { DeveloperPortalPage } from './pages/DeveloperPortalPage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(false);

  // Hash-based routing listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        // default home
        setCurrentView('home');
        setViewParam(undefined);
        return;
      }

      const parts = hash.split('/');
      const primary = parts[0];
      const param = parts.slice(1).join('/');

      if (primary === 'landing') {
        setShowLanding(true);
      } else {
        setShowLanding(false);
        setCurrentView(primary);
        setViewParam(param || undefined);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    setShowLanding(false);
    if (param) {
      window.location.hash = `#/${view}/${param}`;
    } else {
      window.location.hash = `#/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showLanding) {
    return (
      <LandingPage
        onEnterApp={() => navigate('home')}
        onJoinRoom={(slug: string) => navigate('rooms', slug)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Interactive Persona Switcher */}
      <DemoSwitcherBar />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={navigate}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeDashboard
            onNavigate={navigate}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        )}

        {currentView === 'rooms' && !viewParam && (
          <RoomsPage onSelectRoom={(slug: string) => navigate('rooms', slug)} />
        )}

        {currentView === 'rooms' && viewParam && (
          <RoomDetailPage
            roomSlug={viewParam}
            onNavigate={navigate}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        )}

        {currentView === 'connect' && (
          <ConnectPage onNavigateToProfile={(slug: string) => navigate('p', slug)} />
        )}

        {currentView === 'network' && !viewParam && (
          <NetworkPage
            onSelectConnection={(id: string) => navigate('network', id)}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        )}

        {currentView === 'network' && viewParam && (
          <ConnectionDetailPage
            connectionId={viewParam}
            onBack={() => navigate('network')}
          />
        )}

        {currentView === 'agent' && (
          <NexusAgentPage
            initialQuery={viewParam}
            onNavigate={navigate}
          />
        )}

        {currentView === 'opportunities' && (
          <OpportunityGraphPage onNavigate={navigate} />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            onOpenQR={() => setIsQRModalOpen(true)}
            onNavigate={navigate}
          />
        )}

        {currentView === 'p' && viewParam && (
          <PublicProfilePage
            slug={viewParam}
            onNavigate={navigate}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        )}

        {currentView === 'organizer' && (
          <OrganizerDashboardPage onNavigate={navigate} />
        )}

        {currentView === 'privacy' && (
          <PrivacyCenterPage />
        )}

        {currentView === 'developers' && (
          <DeveloperPortalPage />
        )}
      </main>

      {/* Global QR Modal */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onNavigateToProfile={(slug: string) => navigate('p', slug)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
