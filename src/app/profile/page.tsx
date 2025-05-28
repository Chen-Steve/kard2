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
      <div className="bg-white rounded-sm shadow p-3 mb-2 flex justify-between items-start">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-0.5 text-sm text-gray-600">Manage your account settings and preferences.</p>
        </header>
        <div className="ml-4">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Icon icon="ph:sign-out" className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow p-3">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Account Information</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-700">Email</dt>
            <dd className="mt-1 flex items-center">
              <span className="text-gray-900">{user?.email}</span>
              {user?.email_confirmed_at && (
                <Icon icon="ph:check-circle-fill" className="ml-2 w-4 h-4 text-green-500" />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700">Account Created</dt>
            <dd className="mt-1 text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-700">Last Sign In</dt>
            <dd className="mt-1 text-gray-900">
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

      <div className="bg-white rounded-sm shadow p-3 mt-2">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Recent Decks</h2>
        <div className="text-sm text-gray-600">
          <p>Your recently studied and created flashcard decks.</p>
          <div className="mt-4 space-y-2">
            <div className="h-12 bg-gray-100 rounded p-2 flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-100 rounded p-2 flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
        <div className="bg-white rounded-sm shadow p-3">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Study Preferences</h2>
          <div className="text-sm text-gray-600">
            <p>Customize your study experience and learning settings.</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Default Study Mode</span>
                <span className="text-gray-500">Flashcards</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Auto-advance Cards</span>
                <span className="text-gray-500">Disabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Study Reminders</span>
                <span className="text-gray-500">Not Set</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Answer Language</span>
                <span className="text-gray-500">English</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow p-3">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Achievements</h2>
          <div className="text-sm text-gray-600">
            <p>Unlock badges and track your learning milestones.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-gray-500">First Deck</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-gray-500">Study Streak</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
                <div className="text-xs text-gray-500">Card Master</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow p-3 mt-2">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Study History</h2>
        <div className="text-sm text-gray-600">
          <p>Review your recent study sessions and performance trends.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <Icon icon="ph:cards" className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <Icon icon="ph:lightning" className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="h-3 bg-gray-200 rounded w-28 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <Icon icon="ph:check-circle" className="w-5 h-5 text-green-500" />
                <div>
                  <div className="h-3 bg-gray-200 rounded w-36 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-18"></div>
                </div>
              </div>
              <div className="text-right">
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