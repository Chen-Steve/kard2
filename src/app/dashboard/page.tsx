"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { NavigationTabs, TopNav } from './components/NavigationTabs';
import Profile from '../profile/page';
import AuthForm from '../auth/AuthForm';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className={`${isOpen ? 'w-44 sm:w-44 md:w-48' : 'w-16'} bg-white border-r border-gray-200 shadow-sm pt-2 
                    transition-all duration-300 fixed sm:relative h-full z-20 overflow-hidden`}>
      <NavigationTabs isOpen={isOpen} />
    </div>
  );
};

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

  const mainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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

    return (
      <div className="text-center">
        <p className="mt-2 text-gray-600">Start creating your flashcard decks.</p>
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
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          {mainContent()}
        </main>
      </div>
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
