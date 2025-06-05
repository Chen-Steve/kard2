// Database types (snake_case - matches Supabase/PostgreSQL)
export interface DbFlashcard {
  id: string;
  front: string;
  back: string;
  created_at: string;
}

export interface DbDeck {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  flashcards: DbFlashcard[];
}

// Frontend types (camelCase - JavaScript/TypeScript convention)
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  flashcards: Flashcard[];
} 