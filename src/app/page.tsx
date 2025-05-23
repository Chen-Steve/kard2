"use client"

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { NavigationTabs } from './dashboard/NavigationTabs';

const TopNav = ({ onMenuClick, isOpen }: { onMenuClick: () => void; isOpen: boolean }) => {
  return (
    <div className="h-16 bg-white flex items-center px-6 relative">
      <button 
        onClick={onMenuClick}
        className="absolute left-[14px] p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Icon 
          icon="ph:list" 
          className="w-5 h-5 text-gray-600"
        />
      </button>
      {/* Search bar container */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search decks..." 
            className="w-full h-10 px-4 pl-10 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Icon 
            icon="ph:magnifying-glass" 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
        </div>
      </div>
      <div className={`absolute bottom-0 ${isOpen ? 'left-44 sm:left-44 md:left-48' : 'left-24'} right-0 h-[1px] bg-gray-200 transition-all duration-300`}></div>
    </div>
  );
};

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
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Link 
                href="/auth" 
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
              >
 
                <span>Sign up to get started</span>
              </Link>
            </div>
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