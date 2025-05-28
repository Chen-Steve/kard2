"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Icon } from '@iconify/react';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
      setLoading(false);
    };
    getProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Icon icon="ph:circle-notch" className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="h-full mx-1 mt-1">
      <div className="bg-white rounded-sm shadow p-3 mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <header className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-0.5 text-sm text-gray-600">Manage your account settings and preferences.</p>
        </header>
        <div className="sm:ml-4 sm:flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Icon icon="ph:sign-out" className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow p-3 mb-2">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Account Information</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-700">Email</dt>
            <dd className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span className="text-gray-900 break-all">{user?.email}</span>
              {user?.email_confirmed_at && (
                <Icon icon="ph:check-circle-fill" className="sm:ml-2 w-4 h-4 text-green-500 self-start sm:self-auto" />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700">Account Created</dt>
            <dd className="mt-1 text-gray-900 text-sm sm:text-base">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700">Last Sign In</dt>
            <dd className="mt-1 text-gray-900 text-sm sm:text-base">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-sm shadow p-3 mb-2">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Recent Decks</h2>
        <div className="text-sm text-gray-600">
          <p>Your recently studied and created flashcard decks.</p>
          <div className="mt-4 space-y-2">
            <div className="h-12 bg-gray-100 rounded p-2 flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-100 rounded p-2 flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div className="bg-white rounded-sm shadow p-3">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Study Preferences</h2>
          <div className="text-sm text-gray-600">
            <p>Customize your study experience and learning settings.</p>
            <div className="mt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-700 font-medium">Default Study Mode</span>
                <span className="text-gray-500">Flashcards</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-700 font-medium">Auto-advance Cards</span>
                <span className="text-gray-500">Disabled</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-700 font-medium">Study Reminders</span>
                <span className="text-gray-500">Not Set</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <span className="text-gray-700 font-medium">Answer Language</span>
                <span className="text-gray-500">English</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow p-3">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Achievements</h2>
          <div className="text-sm text-gray-600">
            <p>Unlock badges and track your learning milestones.</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-gray-500">First Deck</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-gray-500">Study Streak</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded col-span-2 sm:col-span-1">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-gray-500">Card Master</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow p-3 mb-2">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Study History</h2>
        <div className="text-sm text-gray-600">
          <p>Review your recent study sessions and performance trends.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Icon icon="ph:cards" className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="h-3 bg-gray-200 rounded w-32 max-w-full mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-20 max-w-full"></div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Icon icon="ph:lightning" className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="h-3 bg-gray-200 rounded w-28 max-w-full mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-24 max-w-full"></div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Icon icon="ph:check-circle" className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="h-3 bg-gray-200 rounded w-36 max-w-full mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-18 max-w-full"></div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 