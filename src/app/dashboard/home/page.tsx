"use client"

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Icon } from '@iconify/react';
import { Deck, DbDeck, DbFlashcard } from '@/types/deck';

interface HomeProps {
  onNavigateToCreate: () => void;
  onNavigateToDeck?: (deck: Deck) => void;
  searchQuery?: string;
}



export default function Home({ onNavigateToCreate, onNavigateToDeck, searchQuery = '' }: HomeProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter decks based on search query
  const filteredDecks = decks.filter(deck => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      deck.name.toLowerCase().includes(query) ||
      (deck.description && deck.description.toLowerCase().includes(query)) ||
      deck.flashcards.some(card => 
        card.front.toLowerCase().includes(query) ||
        card.back.toLowerCase().includes(query)
      )
    );
  });

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
        <header className="bg-white rounded-sm shadow p-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-sm text-gray-600">Lets keep studying</p>
        </header>

        

        {/* All Decks */}
        <section className="bg-white rounded-sm shadow p-3 mb-2">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Your Decks</h2>
          <div className="max-h-64 overflow-y-auto">
            <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredDecks.map((deck) => (
                <li
                  key={deck.id}
                  className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onNavigateToDeck?.(deck)}
                >
                  <article className="mb-3">
                    <header className="flex items-center mb-2">
                      <figure className="w-8 h-8 bg-blue-100 rounded mr-2 flex-shrink-0 flex items-center justify-center">
                        <Icon icon="ph:cards" className="w-4 h-4 text-blue-600" />
                      </figure>
                      <h3 className="font-medium text-gray-900 truncate">{deck.name}</h3>
                    </header>
                    {deck.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{deck.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {deck.flashcards.length} cards • {new Date(deck.createdAt).toLocaleDateString()}
                    </p>
                  </article>
                  <nav className="flex justify-end">
                    <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                      Study
                    </button>
                  </nav>
                </li>
              ))}
              {filteredDecks.length === 0 && decks.length > 0 && (
                <li className="col-span-full text-center py-8">
                  <Icon icon="ph:magnifying-glass" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No decks found for &quot;{searchQuery}&quot;</p>
                </li>
              )}
              {decks.length === 0 && (
                <li className="col-span-full text-center py-8">
                  <Icon icon="ph:cards" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No decks yet</p>
                  <button 
                    onClick={onNavigateToCreate}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Create Your First Deck
                  </button>
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Study Progress & Quick Study */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          {/* Left Side - Study Progress & Goals */}
          <div className="space-y-2">
            <article className="bg-white rounded-sm shadow p-3">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Study Streak</h2>
              <header className="flex items-center gap-3">
                <figure className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
                  <Icon icon="ph:fire" className="w-6 h-6 text-orange-600" />
                </figure>
                <hgroup>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                  <p className="text-sm text-gray-600">days in a row</p>
                </hgroup>
              </header>
              <meter className="mt-3 flex items-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < 7 ? 'bg-orange-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </meter>
            </article>
          </div>

          {/* Right Side - Quick Study Modes */}
          <article className="bg-white rounded-sm shadow p-3">
            <nav className="grid grid-cols-2 gap-3 h-full">
              <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                <Icon icon="ph:cards" className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">Flashcards</span>
                <span className="text-xs text-blue-700">Classic mode</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                <Icon icon="ph:lightning" className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">Speed Review</span>
                <span className="text-xs text-purple-700">Quick drill</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded hover:bg-green-100 transition-colors">
                <Icon icon="ph:check-circle" className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">Test Mode</span>
                <span className="text-xs text-green-700">Self assess</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded hover:bg-orange-100 transition-colors">
                <Icon icon="ph:puzzle-piece" className="w-8 h-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-orange-900">Matching</span>
                <span className="text-xs text-orange-700">Fun game</span>
              </button>
            </nav>
          </article>
        </section>
      </div>
    </main>
  );
} 