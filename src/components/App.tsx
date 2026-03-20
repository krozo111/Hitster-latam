import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState } from '../lib/types';
import {
  initFirebase,
  createRoom,
  getRoomState,
  subscribeToRoom,
  setRoomState,
  updateRoomState,
  generateRoomCode,
} from '../lib/firebase';
import {
  createInitialState,
  addPlayerToState,
  startGame,
  drawNextCard,
  placeCard,
} from '../lib/gameLogic';
import Landing from './Landing';
import Lobby from './Lobby';
import GameBoard from './GameBoard';
import ResultOverlay from './ResultOverlay';
import VictoryScreen from './VictoryScreen';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'lobby' | 'game'>('landing');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(-1);
  const [roomId, setRoomId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  // Initialize Firebase on mount
  useEffect(() => {
    try {
      initFirebase();
    } catch (e) {
      setError('Error al conectar con Firebase. Verifica tu configuración.');
    }
  }, []);

  // Subscribe to room state changes
  const subscribeRoom = useCallback((id: string) => {
    if (unsubRef.current) unsubRef.current();
    
    const unsub = subscribeToRoom(id, (state) => {
      setGameState(state);
      
      if (state.phase === 'playing' && screen !== 'game') {
        setScreen('game');
      }
      if (state.phase === 'finished') {
        // Handle game over
      }
    });
    unsubRef.current = unsub;
  }, [screen]);

  // Cleanup subscription
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  // CREATE ROOM
  const handleCreateRoom = async (playerName: string) => {
    try {
      setError('');
      const code = generateRoomCode();
      const initialState = createInitialState(code, playerName);
      await createRoom(code, initialState);
      
      setRoomId(code);
      setMyPlayerIndex(0);
      setIsHost(true);
      subscribeRoom(code);
      setScreen('lobby');
    } catch (e) {
      setError('Error al crear la sala. Intenta de nuevo.');
      console.error(e);
    }
  };

  // JOIN ROOM
  const handleJoinRoom = async (code: string, playerName: string) => {
    try {
      setError('');
      const state = await getRoomState(code.toUpperCase());
      
      if (!state) {
        setError('Sala no encontrada. Verifica el código.');
        return;
      }
      if (state.phase !== 'lobby') {
        setError('La partida ya comenzó.');
        return;
      }
      if (state.players.length >= 8) {
        setError('La sala está llena (máx. 8 jugadores).');
        return;
      }

      const updatedState = addPlayerToState(state, playerName);
      const newIndex = updatedState.players.length - 1;
      
      await setRoomState(code.toUpperCase(), updatedState);
      
      setRoomId(code.toUpperCase());
      setMyPlayerIndex(newIndex);
      setIsHost(false);
      subscribeRoom(code.toUpperCase());
      setScreen('lobby');
    } catch (e) {
      setError('Error al unirse. Intenta de nuevo.');
      console.error(e);
    }
  };

  // START GAME (Host only)
  const handleStartGame = async () => {
    if (!gameState || !isHost) return;
    try {
      const started = startGame(gameState);
      await setRoomState(roomId, started);
    } catch (e) {
      setError('Error al iniciar el juego.');
      console.error(e);
    }
  };

  // PLACE CARD
  const handlePlaceCard = async (insertIdx: number) => {
    if (!gameState || gameState.currentPlayerIdx !== myPlayerIndex) return;
    
    try {
      const result = placeCard(gameState, myPlayerIndex, insertIdx);
      await setRoomState(roomId, result);
      setShowResult(true);
    } catch (e) {
      setError('Error al colocar la carta.');
      console.error(e);
    }
  };

  // NEXT TURN
  const handleNextTurn = async () => {
    if (!gameState) return;
    try {
      const nextState = drawNextCard(gameState);
      await setRoomState(roomId, nextState);
      setShowResult(false);
    } catch (e) {
      setError('Error al pasar turno.');
      console.error(e);
    }
  };

  const isMyTurn = gameState?.currentPlayerIdx === myPlayerIndex;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="glass-card px-6 py-3 border-neon-coral/30 neon-glow-coral flex items-center gap-3">
            <span className="text-neon-coral text-lg">⚠️</span>
            <span className="text-sm text-white/90">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-2 text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {screen === 'landing' && (
        <Landing
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          error={error}
        />
      )}

      {screen === 'lobby' && gameState && (
        <Lobby
          gameState={gameState}
          roomId={roomId}
          isHost={isHost}
          myPlayerIndex={myPlayerIndex}
          onStartGame={handleStartGame}
        />
      )}

      {screen === 'game' && gameState && gameState.phase === 'playing' && (
        <>
          <GameBoard
            gameState={gameState}
            myPlayerIndex={myPlayerIndex}
            isMyTurn={isMyTurn}
            onPlaceCard={handlePlaceCard}
            onNextTurn={handleNextTurn}
            showResult={showResult}
          />
          {showResult && gameState.lastResult && (
            <ResultOverlay
              result={gameState.lastResult}
              card={gameState.currentCard!}
              onContinue={handleNextTurn}
              isMyTurn={isMyTurn}
            />
          )}
        </>
      )}

      {gameState?.phase === 'finished' && (
        <VictoryScreen
          gameState={gameState}
          myPlayerIndex={myPlayerIndex}
          onPlayAgain={() => {
            setScreen('landing');
            setGameState(null);
            setRoomId('');
            setMyPlayerIndex(-1);
          }}
        />
      )}
    </div>
  );
}
