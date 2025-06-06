"use client"

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Deck, Flashcard } from '@/types/deck';
import FlashcardListItem from './FlashcardListItem';

interface FlashcardStudyViewProps {
  deck: Deck;
  onBack: () => void;
  onNavigateToCreate: () => void;
}

export default function FlashcardStudyView({ deck, onBack, onNavigateToCreate }: FlashcardStudyViewProps) {
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize with default values
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(
    [...deck.flashcards].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  );
  const [isEditing, setIsEditing] = useState(false);

  // Load saved state after component mounts
  useEffect(() => {
    if (isClient) {
      const savedIndex = localStorage.getItem(`study-${deck.id}-currentIndex`);
      const savedIsFlipped = localStorage.getItem(`study-${deck.id}-isFlipped`);
      const savedCards = localStorage.getItem(`study-${deck.id}-flashcards`);
      
      if (savedIndex !== null) {
        setCurrentCardIndex(parseInt(savedIndex, 10));
      }
      
      if (savedIsFlipped !== null) {
        setIsFlipped(savedIsFlipped === 'true');
      }
      
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards);
        setFlashcards(
          [...parsedCards].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );
      }
    }
  }, [isClient, deck.id]);

  // Save state when it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`study-${deck.id}-currentIndex`, currentCardIndex.toString());
    }
  }, [currentCardIndex, isClient, deck.id]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`study-${deck.id}-isFlipped`, isFlipped.toString());
    }
  }, [isFlipped, isClient, deck.id]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`study-${deck.id}-flashcards`, JSON.stringify(flashcards));
    }
  }, [flashcards, isClient, deck.id]);

  const currentCard = flashcards[currentCardIndex];

  // Clear study state when leaving
  const handleBack = () => {
    if (isClient) {
      localStorage.removeItem(`study-${deck.id}-currentIndex`);
      localStorage.removeItem(`study-${deck.id}-isFlipped`);
      localStorage.removeItem(`study-${deck.id}-flashcards`);
    }
    onBack();
  };

  const handleCardUpdate = (updatedCard: Flashcard) => {
    setFlashcards(cards => 
      cards.map(card => card.id === updatedCard.id ? updatedCard : card)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  };

  const handleCardDelete = (cardId: string) => {
    setFlashcards(cards => {
      const newCards = cards.filter(card => card.id !== cardId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (currentCardIndex >= newCards.length) {
        setCurrentCardIndex(Math.max(0, newCards.length - 1));
      }
      return newCards;
    });
  };

  const nextCard = useCallback(() => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex, flashcards.length]);

  const prevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const goToCard = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keyboard shortcuts while editing
      if (isEditing) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevCard();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextCard();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          flipCard();
          break;
        case 'Escape':
          event.preventDefault();
          handleBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, prevCard, flipCard, handleBack, isEditing]);

  if (flashcards.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <header className="flex items-center gap-3 mb-8">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Back to decks"
              >
                <Icon icon="ph:arrow-left" className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">{deck.name}</h1>
            </header>
            
            <div className="text-center py-20">
              <Icon icon="ph:cards" className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No flashcards yet</h2>
              <p className="text-gray-500 mb-6">Add some flashcards to start studying</p>
              <button
                onClick={onNavigateToCreate}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Flashcards
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={handleBack}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="Back to decks"
        >
          <Icon icon="ph:arrow-left" className="w-5 h-5" />
        </button>
      </div>

      {/* Main Study Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Large Flashcard Display */}
          <div className="mb-8">
            <div className="max-w-2xl mx-auto">
              {/* The Flashcard */}
              <div className="relative mb-6">
                <div 
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl"
                  onClick={flipCard}
                >
                  {/* Label in top left */}
                  <div className="absolute top-4 left-4 text-sm text-gray-500 uppercase tracking-wide font-medium">
                    {isFlipped ? 'Definition' : 'Term'}
                  </div>
                  
                  <div className="text-center max-w-full">
                    <div className="text-xl font-medium text-gray-900 leading-relaxed">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </div>
                  </div>
                </div>
                
                {/* Info button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card flip
                    setShowTipsModal(true);
                  }}
                  className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                  title="Study Tips"
                >
                  <Icon icon="ph:info" className="w-5 h-5" />
                </button>
              </div>

              {/* Card Counter and Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="p-3 rounded-lg bg-white shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <Icon icon="ph:caret-left" className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Card {currentCardIndex + 1} of {flashcards.length}</div>
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="p-3 rounded-lg bg-white shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <Icon icon="ph:caret-right" className="w-5 h-5" />
                </button>
              </div>

              {/* Tips Modal */}
              {showTipsModal && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  onClick={() => setShowTipsModal(false)}
                >
                  <div 
                    className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
                  >
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Study Tips & Shortcuts</h3>
                      <button
                        onClick={() => setShowTipsModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Icon icon="ph:x" className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="px-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Keyboard Shortcuts</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Space</kbd>
                              <span className="text-sm text-gray-600">or</span>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
                              <span className="text-sm text-gray-600">Flip card</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd>
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">→</kbd>
                              <span className="text-sm text-gray-600">Navigate between cards</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd>
                              <span className="text-sm text-gray-600">Exit to deck list</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Mouse Controls</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Click anywhere on the card to flip it</li>
                            <li>• Use the arrow buttons to navigate</li>
                            <li>• Click any card in the list below to jump to it</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Study Tips</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Try to recall the answer before flipping the card</li>
                            <li>• Use spaced repetition - review cards at increasing intervals</li>
                            <li>• Focus on cards you find challenging</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 flex justify-end">
                      <button
                        onClick={() => setShowTipsModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cards List */}
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-gray-900">All Cards</h3>
                <span className="text-sm text-gray-500">({flashcards.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {flashcards.map((card, index) => (
                  <FlashcardListItem
                    key={card.id}
                    card={card}
                    index={index}
                    isCurrentCard={index === currentCardIndex}
                    onSelect={() => goToCard(index)}
                    onUpdate={handleCardUpdate}
                    onDelete={handleCardDelete}
                    onEditingChange={setIsEditing}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 