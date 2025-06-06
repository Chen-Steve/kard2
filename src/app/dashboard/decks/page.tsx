"use client"

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Deck, DbDeck, DbFlashcard } from '@/types/deck';
import FlashcardStudyView from '../components/FlashcardStudyView';

interface YourDecksProps {
  onNavigateToCreate: () => void;
  searchQuery?: string;
  selectedDeck?: Deck | null;
}

export default function YourDecks({ onNavigateToCreate, searchQuery = '', selectedDeck: initialSelectedDeck }: YourDecksProps) {
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
    if (initialSelectedDeck) {
      setSelectedDeck(initialSelectedDeck);
      setShowDeckDetails(true);
    }
  }, [initialSelectedDeck]);

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
          flashcards!inner (
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
        flashcards: deck.flashcards
          .map((card: DbFlashcard) => ({
            id: card.id,
            front: card.front,
            back: card.back,
            createdAt: card.created_at
          }))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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

  if (showDeckDetails && selectedDeck) {
    return <FlashcardStudyView deck={selectedDeck} onBack={closeDeckDetails} onNavigateToCreate={onNavigateToCreate} />;
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
          ) : filteredDecks.length === 0 ? (
              <div className="text-center py-20">
                <Icon icon="ph:magnifying-glass" className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">No decks found</h2>
                <p className="text-gray-500 mb-6">No decks match your search query &quot;{searchQuery}&quot;</p>
              </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDecks.map((deck) => (
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