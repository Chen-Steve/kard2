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
    <main className="h-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your account settings and preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <article className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <dl className="space-y-4">
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
          </article>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
            <button
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Icon icon="ph:sign-out" className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
} 