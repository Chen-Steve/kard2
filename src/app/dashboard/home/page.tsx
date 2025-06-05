"use client"

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Icon } from '@iconify/react';
import { Deck, DbDeck, DbFlashcard } from '@/types/deck';

interface HomeProps {
  onNavigateToCreate: () => void;
}

interface UserStats {
  totalDecks: number;
  totalCards: number;
  cardsToReview: number;
  newCards: number;
  completedCards: number;
}

export default function Home({ onNavigateToCreate }: HomeProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    totalDecks: 0,
    totalCards: 0,
    cardsToReview: 0,
    newCards: 0,
    completedCards: 0
  });
  const [userName, setUserName] = useState<string>('');
  
  const supabase = createClient();

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user name from metadata or email
      const displayName = session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name ||
                         session.user.email?.split('@')[0] ||
                         'User';
      setUserName(displayName);

      // Load decks with flashcards
      const { data, error } = await supabase
        .from('decks')
        .select(`
          id,
          name,
          description,
          created_at,
          flashcards (
            id,
            front,
            back,
            created_at
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedDecks = (data || []).map((deck: DbDeck) => ({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        createdAt: deck.created_at,
        flashcards: deck.flashcards.map((card: DbFlashcard) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          createdAt: card.created_at
        }))
      }));
      
      setDecks(transformedDecks);

      // Calculate stats
      const totalDecks = transformedDecks.length;
      const totalCards = transformedDecks.reduce((sum, deck) => sum + deck.flashcards.length, 0);
      
      // For now, we'll simulate review states since we don't have learning progress yet
      // In a real spaced repetition system, these would be calculated based on review history
      const newCards = Math.floor(totalCards * 0.6); // 60% haven't been started
      const cardsToReview = Math.floor(totalCards * 0.3); // 30% need review
      const completedCards = totalCards - newCards - cardsToReview; // 10% completed

      setUserStats({
        totalDecks,
        totalCards,
        cardsToReview,
        newCards,
        completedCards
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-md h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show empty state if no decks
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Icon icon="ph:cards" className="w-24 h-24 text-gray-300 mb-6" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome to Kard!</h2>
        <p className="text-gray-500 mb-6">Start creating your first flashcard deck</p>
        <button 
          onClick={onNavigateToCreate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Icon icon="ph:plus" className="w-5 h-5" />
          Create Your First Deck
        </button>
      </div>
    );
  }

  return (
    <main className="h-full mx-1 mt-1 overflow-auto">
      <div>
        {/* Greeting */}
        <div className="bg-white rounded-sm shadow p-3 mb-2">
          <header>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-sm text-gray-600">Lets keep studying</p>
          </header>
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-sm shadow p-3 mb-2">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Study Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Icon icon="ph:stack" className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Decks</p>
                  <p className="text-lg font-bold text-gray-900">{userStats.totalDecks}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <Icon icon="ph:cards" className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Cards</p>
                  <p className="text-lg font-bold text-gray-900">{userStats.totalCards}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-orange-100 rounded">
                  <Icon icon="ph:clock" className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Due for Review</p>
                  <p className="text-lg font-bold text-gray-900">{userStats.cardsToReview}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded">
                  <Icon icon="ph:star" className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Mastered</p>
                  <p className="text-lg font-bold text-gray-900">{userStats.completedCards}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
          {userStats.cardsToReview > 0 && (
            <div className="bg-white rounded-sm shadow p-3">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="ph:clock" className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-medium text-gray-900">Review Again</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {userStats.cardsToReview} cards are ready for review
              </p>
              <button className="w-full px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors">
                Start Reviewing
              </button>
            </div>
          )}

          {userStats.newCards > 0 && (
            <div className="bg-white rounded-sm shadow p-3">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="ph:plus-circle" className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Haven&apos;t Started</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {userStats.newCards} new cards waiting to be learned
              </p>
              <button className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                Learn New Cards
              </button>
            </div>
          )}

          <div className="bg-white rounded-sm shadow p-3">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="ph:plus" className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Create More</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Add new cards to your existing decks
            </p>
            <button 
              onClick={onNavigateToCreate}
              className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
            >
              Create Cards
            </button>
          </div>
        </div>

        {/* Study Progress & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          <div className="bg-white rounded-sm shadow p-3">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Study Streak</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                <Icon icon="ph:fire" className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">7</div>
                <div className="text-sm text-gray-600">days in a row</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < 7 ? 'bg-orange-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-sm shadow p-3">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Today&apos;s Goal</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <Icon icon="ph:target" className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">12/20</div>
                <div className="text-sm text-gray-600">cards studied</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
                             <div className="text-xs text-gray-500 mt-1">8 more to reach your goal!</div>
            </div>
          </div>
        </div>

        {/* Quick Study Modes */}
        <div className="bg-white rounded-sm shadow p-3 mb-2">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Quick Study</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button className="flex flex-col items-center p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
              <Icon icon="ph:cards" className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-sm font-medium text-blue-900">Flashcards</span>
              <span className="text-xs text-blue-700">Classic mode</span>
            </button>
            <button className="flex flex-col items-center p-3 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
              <Icon icon="ph:lightning" className="w-6 h-6 text-purple-600 mb-1" />
              <span className="text-sm font-medium text-purple-900">Speed Review</span>
              <span className="text-xs text-purple-700">Quick drill</span>
            </button>
            <button className="flex flex-col items-center p-3 bg-green-50 rounded hover:bg-green-100 transition-colors">
              <Icon icon="ph:check-circle" className="w-6 h-6 text-green-600 mb-1" />
              <span className="text-sm font-medium text-green-900">Test Mode</span>
              <span className="text-xs text-green-700">Self assess</span>
            </button>
            <button className="flex flex-col items-center p-3 bg-orange-50 rounded hover:bg-orange-100 transition-colors">
              <Icon icon="ph:puzzle-piece" className="w-6 h-6 text-orange-600 mb-1" />
              <span className="text-sm font-medium text-orange-900">Matching</span>
              <span className="text-xs text-orange-700">Fun game</span>
            </button>
          </div>
        </div>

        {/* Recent Activity & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          <div className="bg-white rounded-sm shadow p-3">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <Icon icon="ph:cards" className="w-3 h-3 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Studied Spanish Vocabulary</div>
                  <div className="text-xs text-gray-500">15 cards • 2 hours ago</div>
                </div>
                <div className="text-xs text-green-600 font-medium">92%</div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                  <Icon icon="ph:lightning" className="w-3 h-3 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Speed Review - Math Formulas</div>
                  <div className="text-xs text-gray-500">8 cards • Yesterday</div>
                </div>
                <div className="text-xs text-orange-600 font-medium">76%</div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                  <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Completed Biology Test</div>
                  <div className="text-xs text-gray-500">20 cards • 2 days ago</div>
                </div>
                <div className="text-xs text-green-600 font-medium">88%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-sm shadow p-3">
            <h2 className="text-lg font-medium text-gray-900 mb-3">This Week&apos;s Progress</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cards Studied</span>
                  <span className="font-medium text-gray-900">247</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-medium text-gray-900">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Study Time</span>
                  <span className="font-medium text-gray-900">4.2 hrs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
} 