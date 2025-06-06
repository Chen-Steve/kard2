"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { NavigationTabs, TopNav } from './components/NavigationTabs';
import Profile from '../profile/page';
import AuthForm from '../auth/AuthForm';
import CreateFlashcards from './create/page';
import YourDecks from './decks/page';
import Home from './home/page';
import { Deck } from '@/types/deck';


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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDecks, setShowDecks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('home');
  const [selectedDeckFromHome, setSelectedDeckFromHome] = useState<Deck | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved state after component mounts
  useEffect(() => {
    if (isClient) {
      const savedView = localStorage.getItem('dashboard-active-view');
      const savedDeck = localStorage.getItem('dashboard-selected-deck');
      const savedIsStudyMode = localStorage.getItem('dashboard-is-study-mode');
      
      console.log('Loading saved state:', { savedView, savedDeck: !!savedDeck, savedIsStudyMode });
      
      if (savedView) {
        setActiveView(savedView);
        switch (savedView) {  
          case 'create':
            setShowCreate(true);
            break;
          case 'decks':
            setShowDecks(true);
            break;
        }
      }
      
      if (savedDeck) {
        const deck = JSON.parse(savedDeck);
        setSelectedDeckFromHome(deck);
        setShowDecks(true);
        
        // If we were in study mode, restore that state
        if (savedIsStudyMode === 'true') {
          console.log('Restoring study mode');
          setIsStudyMode(true);
        }
      }
    }
  }, [isClient]);

  // Save state to localStorage when it changes (only on client)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('dashboard-active-view', activeView);
    }
  }, [activeView, isClient]);

  useEffect(() => {
    if (isClient) {
      if (selectedDeckFromHome) {
        localStorage.setItem('dashboard-selected-deck', JSON.stringify(selectedDeckFromHome));
      } else {
        localStorage.removeItem('dashboard-selected-deck');
      }
    }
  }, [selectedDeckFromHome, isClient]);

  useEffect(() => {
    if (isClient) {
      if (isStudyMode) {
        localStorage.setItem('dashboard-is-study-mode', 'true');
      } else {
        localStorage.removeItem('dashboard-is-study-mode');
      }
    }
  }, [isStudyMode, isClient]);

  useEffect(() => {
    const supabase = createClient();

    const getSession = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        setSession(activeSession);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [isClient]);

  const handleNavigation = (view: string) => {
    setActiveView(view);
    
    // Only reset views if we're not restoring from localStorage
    if (view !== 'decks' || !selectedDeckFromHome) {
      // Reset all views
      setShowProfile(false);
      setShowAuth(false);
      setShowCreate(false);
      setShowDecks(false);
      setSelectedDeckFromHome(null); // Clear selected deck when navigating
    }
    
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

  const handleDeckClick = (deck: Deck) => {
    setSelectedDeckFromHome(deck);
    setActiveView('decks');
    setShowProfile(false);
    setShowAuth(false);
    setShowCreate(false);
    setShowDecks(true);
    setIsStudyMode(true);
    // Save the state immediately (only if on client)
    if (isClient) {
      localStorage.setItem('dashboard-active-view', 'decks');
      localStorage.setItem('dashboard-selected-deck', JSON.stringify(deck));
      localStorage.setItem('dashboard-is-study-mode', 'true');
    }
  };



  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to decks page when searching
    if (query.trim()) {
      setActiveView('decks');
      setShowProfile(false);
      setShowAuth(false);
      setShowCreate(false);
      setShowDecks(true);
    }
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
      return (
        <YourDecks 
          onNavigateToCreate={handleCreateClick} 
          searchQuery={searchQuery} 
          selectedDeck={isStudyMode ? selectedDeckFromHome : null}
          onDeckSelect={handleDeckClick}
        />
      );
    }

    return <Home onNavigateToCreate={handleCreateClick} onNavigateToDeck={handleDeckClick} searchQuery={searchQuery} />;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNav 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        isOpen={isSidebarOpen}
        onProfileClick={() => setShowProfile(true)}
        onAuthClick={() => setShowAuth(true)}
        isLoggedIn={!!session}
        onSearch={handleSearch}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} activeView={activeView} onNavigate={handleNavigation} />
        <main className="flex-1 overflow-auto transition-all duration-300">
          {mainContent()}
        </main>
      </div>
    </div>
  );
}
