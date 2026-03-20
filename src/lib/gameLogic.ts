import type { GameState, Player, Song } from './types';
import { SONGS, shuffleSongs } from './songs';

const WIN_SCORE = 10;

export function createInitialState(roomId: string, hostName: string): GameState {
  const shuffled = shuffleSongs(SONGS);
  
  const hostPlayer: Player = {
    name: hostName,
    index: 0,
    timeline: [shuffled[0]], // Primera carta como inicio de la línea de tiempo
    score: 1,
    connected: true,
  };

  return {
    roomId,
    phase: 'lobby',
    players: [hostPlayer],
    deck: shuffled.slice(1), // El resto del mazo
    currentCard: null,
    currentPlayerIdx: 0,
    revealedYear: null,
    lastResult: null,
    winner: null,
    hostIndex: 0,
  };
}

export function addPlayerToState(state: GameState, playerName: string): GameState {
  const newIndex = state.players.length;
  // Dar al nuevo jugador su primera carta del mazo
  const firstCard = state.deck[0];
  const remainingDeck = state.deck.slice(1);

  const newPlayer: Player = {
    name: playerName,
    index: newIndex,
    timeline: firstCard ? [firstCard] : [],
    score: firstCard ? 1 : 0,
    connected: true,
  };

  return {
    ...state,
    players: [...state.players, newPlayer],
    deck: remainingDeck,
  };
}

export function startGame(state: GameState): GameState {
  // Robar la primera carta del mazo para el primer turno
  const currentCard = state.deck[0];
  const remainingDeck = state.deck.slice(1);

  return {
    ...state,
    phase: 'playing',
    currentCard,
    deck: remainingDeck,
    currentPlayerIdx: 0,
    revealedYear: null,
    lastResult: null,
  };
}

export function drawNextCard(state: GameState): GameState {
  if (state.deck.length === 0) {
    return {
      ...state,
      phase: 'finished',
      winner: getBestPlayer(state)?.name || 'Empate',
    };
  }

  const nextPlayerIdx = getNextConnectedPlayer(state);
  const currentCard = state.deck[0];
  const remainingDeck = state.deck.slice(1);

  return {
    ...state,
    currentCard,
    deck: remainingDeck,
    currentPlayerIdx: nextPlayerIdx,
    revealedYear: null,
    lastResult: null,
  };
}

export function placeCard(
  state: GameState,
  playerIdx: number,
  insertIdx: number
): GameState {
  if (!state.currentCard) return state;

  const player = state.players[playerIdx];
  const card = state.currentCard;
  const newTimeline = [...player.timeline];
  
  // Insertar la carta en la posición elegida
  newTimeline.splice(insertIdx, 0, card);
  
  // Verificar si la posición es correcta (orden cronológico)
  const isCorrect = isTimelineCorrect(newTimeline);
  
  let updatedPlayers = [...state.players];
  
  if (isCorrect) {
    // La carta se queda en la línea de tiempo
    updatedPlayers[playerIdx] = {
      ...player,
      timeline: newTimeline,
      score: player.score + 1,
    };
  } else {
    // La carta se descarta, la timeline vuelve a la original
    updatedPlayers[playerIdx] = { ...player };
  }

  // Check win condition
  const winner = updatedPlayers[playerIdx].score >= WIN_SCORE ? updatedPlayers[playerIdx].name : null;

  return {
    ...state,
    players: updatedPlayers,
    revealedYear: card.year,
    lastResult: isCorrect ? 'correct' : 'incorrect',
    currentCard: card, // Keep for display
    winner,
    phase: winner ? 'finished' : state.phase,
  };
}

function isTimelineCorrect(timeline: Song[]): boolean {
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].year < timeline[i - 1].year) {
      return false;
    }
  }
  return true;
}

function getNextConnectedPlayer(state: GameState): number {
  const numPlayers = state.players.length;
  let nextIdx = (state.currentPlayerIdx + 1) % numPlayers;
  let attempts = 0;
  
  while (!state.players[nextIdx].connected && attempts < numPlayers) {
    nextIdx = (nextIdx + 1) % numPlayers;
    attempts++;
  }
  
  return nextIdx;
}

function getBestPlayer(state: GameState): Player | null {
  if (state.players.length === 0) return null;
  return state.players.reduce((best, p) => p.score > best.score ? p : best, state.players[0]);
}
