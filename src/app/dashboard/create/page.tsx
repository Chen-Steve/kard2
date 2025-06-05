"use client"

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { Deck, DbDeck, DbFlashcard } from '@/types/deck';

export default function CreateFlashcards() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const [flashcards, setFlashcards] = useState([{ front: '', back: '' }]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New deck form state
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  
  const supabase = createClient();

  const loadDecks = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const createDeck = async () => {
    if (!newDeckName.trim()) return;
    
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Generate a unique ID for the deck
      const deckId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('decks')
        .insert({
          id: deckId,
          name: newDeckName.trim(),
          description: newDeckDescription.trim() || null,
          user_id: session.user.id,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;

      const newDeck = { ...data, flashcards: [] };
      setDecks([newDeck, ...decks]);
      setSelectedDeck(newDeck);
      setNewDeckName('');
      setNewDeckDescription('');
      setShowNewDeckForm(false);
    } catch (error) {
      console.error('Error creating deck:', error);
      toast.error('Failed to create deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addFlashcard = () => {
    setFlashcards([...flashcards, { front: '', back: '' }]);
  };

  const removeFlashcard = (index: number) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter((_, i) => i !== index));
    }
  };

  const updateFlashcard = (index: number, field: 'front' | 'back', value: string) => {
    const updated = [...flashcards];
    updated[index][field] = value;
    setFlashcards(updated);
  };

  const saveFlashcards = async () => {
    if (!selectedDeck) return;
    
    const validCards = flashcards.filter(card => card.front.trim() && card.back.trim());
    if (validCards.length === 0) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const now = new Date().toISOString();
      const cardsToInsert = validCards.map(card => ({
        id: crypto.randomUUID(),
        front: card.front.trim(),
        back: card.back.trim(),
        user_id: session.user.id,
        deck_id: selectedDeck.id,
        created_at: now,
        updated_at: now
      }));

      const { error } = await supabase
        .from('flashcards')
        .insert(cardsToInsert);

      if (error) throw error;

      // Reset form
      setFlashcards([{ front: '', back: '' }]);
      loadDecks(); // Reload to get updated counts
      
      // Show success message or redirect
      toast.success(`Successfully added ${validCards.length} flashcard(s) to ${selectedDeck.name}!`);
    } catch (error) {
      console.error('Error saving flashcards:', error);
      toast.error('Error saving flashcards. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Deck Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Choose or Create a Deck</h2>
            
            {loading ? (
              <div className="animate-spin rounded-md h-6 w-6 border-b-2 border-blue-600" />
            ) : (
              <div className="space-y-4">
                {/* Existing Decks */}
                {decks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {decks.map((deck) => (
                      <button
                        key={deck.id}
                        onClick={() => setSelectedDeck(deck)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedDeck?.id === deck.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">{deck.name}</h3>
                        {deck.description && (
                          <p className="text-sm text-gray-600 mt-1">{deck.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {deck.flashcards?.length || 0} cards
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* New Deck Button */}
                {!showNewDeckForm ? (
                  <button
                    onClick={() => setShowNewDeckForm(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-gray-600"
                  >
                    <Icon icon="ph:plus" className="w-5 h-5" />
                    Create New Deck
                  </button>
                ) : (
                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Deck Name *
                        </label>
                        <input
                          type="text"
                          value={newDeckName}
                          onChange={(e) => setNewDeckName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Enter deck name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Description
                        </label>
                        <textarea
                          value={newDeckDescription}
                          onChange={(e) => setNewDeckDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          placeholder="Optional description"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={createDeck}
                          disabled={!newDeckName.trim() || saving}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Creating...' : 'Create Deck'}
                        </button>
                        <button
                          onClick={() => {
                            setShowNewDeckForm(false);
                            setNewDeckName('');
                            setNewDeckDescription('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Flashcard Creation */}
          {selectedDeck && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Add Cards to &quot;{selectedDeck.name}&quot;
              </h2>
              
              <div className="space-y-4">
                {flashcards.map((card, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Card {index + 1}</h3>
                      {flashcards.length > 1 && (
                        <button
                          onClick={() => removeFlashcard(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Icon icon="ph:trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Front
                        </label>
                        <textarea
                          value={card.front}
                          onChange={(e) => updateFlashcard(index, 'front', e.target.value)}
                          className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter the question or term"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Back
                        </label>
                        <textarea
                          value={card.back}
                          onChange={(e) => updateFlashcard(index, 'back', e.target.value)}
                          className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter the answer or definition"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    onClick={addFlashcard}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Icon icon="ph:plus" className="w-4 h-4" />
                    Add Another Card
                  </button>

                  <button
                    onClick={saveFlashcards}
                    disabled={saving || flashcards.every(card => !card.front.trim() || !card.back.trim())}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Flashcards'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 