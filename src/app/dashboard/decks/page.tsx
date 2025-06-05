"use client"

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Deck, DbDeck, DbFlashcard } from '@/types/deck';

interface YourDecksProps {
  onNavigateToCreate: () => void;
}

export default function YourDecks({ onNavigateToCreate }: YourDecksProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [showDeckDetails, setShowDeckDetails] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsDropdown]);

  const loadDecks = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
      console.error('Error loading decks:', error);
      toast.error('Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck? This will also delete all flashcards in this deck.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

      setDecks(decks.filter(deck => deck.id !== deckId));
      toast.success('Deck deleted successfully');
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openDeckDetails = (deck: Deck) => {
    setSelectedDeck(deck);
    setShowDeckDetails(true);
  };

  const closeDeckDetails = () => {
    setShowDeckDetails(false);
    setSelectedDeck(null);
  };

  if (showDeckDetails && selectedDeck) {
    return (
      <div className="h-full flex flex-col">
        {/* Flashcards List */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <header className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeDeckDetails}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Back to decks"
                >
                  <Icon icon="ph:arrow-left" className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">{selectedDeck.name}</h1>
              </div>
              <div className="relative" ref={settingsDropdownRef}>
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Icon icon="ph:gear" className="w-5 h-5" />
                </button>
                
                {showSettingsDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                    <button
                      onClick={() => {
                        deleteDeck(selectedDeck.id);
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Icon icon="ph:trash" className="w-4 h-4" />
                      Delete Deck
                    </button>
                  </div>
                )}
              </div>
            </header>
            {selectedDeck.description && (
              <p className="text-gray-600 mb-4">{selectedDeck.description}</p>
            )}
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Flashcards ({selectedDeck.flashcards.length})
            </h2>

            {selectedDeck.flashcards.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="ph:cards" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No flashcards in this deck yet</p>
                <button
                  onClick={onNavigateToCreate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Flashcards
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDeck.flashcards.map((card, index) => (
                  <article
                    key={card.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <span className="text-xs text-gray-500 font-medium mb-3 block">#{index + 1}</span>
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Front</label>
                      <p className="text-sm text-gray-900 mt-1">{card.front}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Back</label>
                      <p className="text-sm text-gray-900 mt-1">{card.back}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-2 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-md h-8 w-8 border-b-2 border-blue-600" />
            </div>
                      ) : decks.length === 0 ? (
              <div className="text-center py-20">
                <Icon icon="ph:cards" className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">No decks yet</h2>
                <p className="text-gray-500 mb-6">Create your first deck to get started with flashcards</p>
                <button
                  onClick={onNavigateToCreate}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Your First Deck
                </button>
              </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                  onClick={() => openDeckDetails(deck)}
                >
                                    <header className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {deck.name}
                      </h3>
                      {deck.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {deck.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDeck(deck.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Icon icon="ph:trash" className="w-4 h-4" />
                    </button>
                  </header>

                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="ph:cards" className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {deck.flashcards.length} card{deck.flashcards.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon icon="ph:calendar" className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Created {formatDate(deck.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 