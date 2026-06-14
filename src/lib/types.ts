export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  yt: string; // Primary YouTube video ID
  alts?: string[]; // Fallback video IDs tried if the primary won't embed
}

export interface Player {
  name: string;
  index: number;
  timeline: Song[];
  score: number;
  connected: boolean;
}

export interface GameState {
  roomId: string;
  phase: 'lobby' | 'playing' | 'finished';
  players: Player[];
  deck: Song[];
  currentCard: Song | null;
  currentPlayerIdx: number;
  revealedYear: number | null;
  lastResult: 'correct' | 'incorrect' | null;
  winner: string | null;
  hostIndex: number;
}

export interface RoomData {
  state: GameState;
  createdAt: number;
}
