"use client"

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { NavigationTabs, TopNav } from './dashboard/NavigationTabs';
import AuthForm from './dashboard/AuthForm';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className={`${isOpen ? 'w-44 sm:w-44 md:w-48' : 'w-16'} bg-white border-r border-gray-200 shadow-sm pt-2 
                    transition-all duration-300 fixed sm:relative h-full z-20 overflow-hidden`}>
      <NavigationTabs isOpen={isOpen} />
    </div>
  );
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <TopNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isOpen={isSidebarOpen} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto flex items-center justify-center">
            <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin text-blue-600" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isOpen={isSidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          {!session ? (
            <AuthForm />
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900">Welcome to Kard!</h1>
              <p className="mt-2 text-gray-600">Start creating your flashcard decks.</p>
            </div>
          )}
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