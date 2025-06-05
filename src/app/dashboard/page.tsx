"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { NavigationTabs, TopNav } from './components/NavigationTabs';
import Profile from '../profile/page';
import AuthForm from '../auth/AuthForm';
import CreateFlashcards from './create/page';
import YourDecks from './decks/page';
import { Icon } from '@iconify/react';

const Sidebar = ({ isOpen, activeView, onNavigate }: { isOpen: boolean; activeView: string; onNavigate: (view: string) => void }) => {
  return (
    <div className={`${isOpen ? 'w-44 sm:w-44 md:w-48 translate-x-0' : 'w-44 sm:w-16 md:w-16 -translate-x-full sm:translate-x-0'} 
                    bg-white shadow-sm
                    transition-all duration-300 fixed sm:relative h-full z-20 overflow-hidden
                    ${isOpen ? 'sm:w-44 md:w-48' : 'sm:w-16'}`}>
      <NavigationTabs isOpen={isOpen} activeButton={activeView} onNavigate={onNavigate} />
    </div>
  );
};

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDecks, setShowDecks] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Set initial sidebar state based on screen size
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleNavigation = (view: string) => {
    setActiveView(view);
    
    // Reset all views
    setShowProfile(false);
    setShowAuth(false);
    setShowCreate(false);
    setShowDecks(false);
    
    // Set the appropriate view
    switch (view) {
      case 'create':
        setShowCreate(true);
        break;
      case 'decks':
        setShowDecks(true);
        break;
      case 'home':
        // Default dashboard view
        break;
      // Add other cases as needed
      default:
        break;
    }
  };

  const handleCreateClick = () => {
    setActiveView('create');
    setShowCreate(true);
  };



  const mainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-md h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (showAuth || (!session && !showProfile)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      );
    }

    if (showProfile) {
      return <Profile />;
    }

    if (showCreate) {
      return <CreateFlashcards />;
    }

    if (showDecks) {
      return <YourDecks onNavigateToCreate={handleCreateClick} />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-700 text-md">Start creating your flashcards</p>
        <button 
          onClick={handleCreateClick}
          className="mt-4 p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          <Icon icon="ph:plus" width="20" height="20" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNav 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        isOpen={isSidebarOpen}
        onProfileClick={() => setShowProfile(true)}
        onAuthClick={() => setShowAuth(true)}
        isLoggedIn={!!session}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} activeView={activeView} onNavigate={handleNavigation} />
        <main className={`flex-1 p-1 overflow-auto transition-all duration-300
                         ${isSidebarOpen ? 'sm:ml-0' : 'sm:ml-0'}`}>
          {mainContent()}
        </main>
      </div>
    </div>
  );
}
