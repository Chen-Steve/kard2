"use client"

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { createClient } from '@/lib/supabase';
import { Flashcard } from '@/types/deck';

interface FlashcardListItemProps {
  card: Flashcard;
  index: number;
  isCurrentCard: boolean;
  onSelect: () => void;
  onUpdate: (updatedCard: Flashcard) => void;
  onDelete: (cardId: string) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

export default function FlashcardListItem({
  card,
  index,
  isCurrentCard,
  onSelect,
  onUpdate,
  onDelete,
  onEditingChange
}: FlashcardListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState<{ front: string; back: string }>({ front: card.front, back: card.back });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const supabase = createClient();

  // Notify parent when editing state changes
  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .update({
          front: editedCard.front,
          back: editedCard.back,
        })
        .eq('id', card.id);

      if (error) throw error;

      onUpdate({ ...card, ...editedCard });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', card.id);

      if (error) throw error;
      onDelete(card.id);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedCard({ front: card.front, back: card.back });
  };

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isCurrentCard 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">#{index + 1}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleStartEdit}
            className="p-1 text-gray-400 hover:text-blue-500 rounded"
            title="Edit card"
          >
            <Icon icon="ph:pencil-simple" className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-500 rounded disabled:opacity-50"
            title="Delete card"
          >
            <Icon 
              icon={isDeleting ? "ph:spinner" : "ph:trash"} 
              className={`w-4 h-4 ${isDeleting ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>
      <div className="space-y-2" onClick={onSelect}>
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Term</div>
              <input
                type="text"
                value={editedCard.front}
                onChange={(e) => setEditedCard(prev => ({ ...prev, front: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter term"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Definition</div>
              <input
                type="text"
                value={editedCard.back}
                onChange={(e) => setEditedCard(prev => ({ ...prev, back: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter definition"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Term</div>
              <div className="text-sm text-gray-900">{card.front}</div>
            </div>
            <div className="border-t border-gray-100 pt-2">
              <div className="text-xs font-medium text-gray-500 mb-0.5">Definition</div>
              <div className="text-sm text-gray-900">{card.back}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 