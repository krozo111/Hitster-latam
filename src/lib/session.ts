import type { GameState } from './types';

// Persists the player's session in localStorage so an accidental reload
// doesn't kick them out of the game. For multiplayer we only store the
// identifiers (the room state lives in Supabase); for solo we store the
// full game state since there is no server room.

const KEY = 'hitster_session';

export interface SavedSession {
  roomId: string;
  myPlayerIndex: number;
  isHost: boolean;
  isSolo: boolean;
  soloState?: GameState | null;
}

export function saveSession(session: SavedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors (private mode / quota)
  }
}

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
