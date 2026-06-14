import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState } from '../lib/types';
import {
  createRoom,
  getRoomState,
  subscribeToRoom,
  setRoomState,
  generateRoomCode,
} from '../lib/supabase';
import {
  createInitialState,
  addPlayerToState,
  startGame,
  drawNextCard,
  placeCard,
} from '../lib/gameLogic';
import { saveSession, loadSession, clearSession } from '../lib/session';
import Landing from './Landing.tsx';
import Lobby from './Lobby.tsx';
import GameBoard from './GameBoard.tsx';
import ResultOverlay from './ResultOverlay.tsx';
import VictoryScreen from './VictoryScreen.tsx';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'lobby' | 'game'>('landing');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(-1);
  const [roomId, setRoomId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isSolo, setIsSolo] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);


  // Subscribe to room state changes
  const subscribeRoom = useCallback((id: string) => {
    if (unsubRef.current) unsubRef.current();

    const unsub = subscribeToRoom(id, (state) => {
      setGameState(state);
      if (state.phase === 'playing') setScreen('game');
    });
    unsubRef.current = unsub;
  }, []);

  // Restore a saved session on reload (so an accidental refresh doesn't
  // kick the player out of their game).
  useEffect(() => {
    const saved = loadSession();
    if (!saved) {
      setRestoring(false);
      return;
    }

    // Solo: the whole game state is stored locally
    if (saved.isSolo && saved.soloState) {
      setIsSolo(true);
      setIsHost(true);
      setMyPlayerIndex(0);
      setRoomId('SOLO');
      setGameState(saved.soloState);
      setScreen('game');
      setRestoring(false);
      return;
    }

    // Multiplayer: re-fetch the live room state from Supabase
    if (!saved.isSolo && saved.roomId) {
      getRoomState(saved.roomId)
        .then((state) => {
          if (!state) {
            clearSession(); // room no longer exists
          } else {
            setRoomId(saved.roomId);
            setMyPlayerIndex(saved.myPlayerIndex);
            setIsHost(saved.isHost);
            setIsSolo(false);
            setGameState(state);
            subscribeRoom(saved.roomId);
            setScreen(state.phase === 'lobby' ? 'lobby' : 'game');
          }
        })
        .catch(() => clearSession())
        .finally(() => setRestoring(false));
      return;
    }

    setRestoring(false);
  }, [subscribeRoom]);

  // Persist the session whenever the relevant state changes
  useEffect(() => {
    if (restoring) return;
    if (isSolo && gameState) {
      saveSession({ roomId: 'SOLO', myPlayerIndex: 0, isHost: true, isSolo: true, soloState: gameState });
    } else if (!isSolo && roomId) {
      saveSession({ roomId, myPlayerIndex, isHost, isSolo: false });
    }
  }, [restoring, isSolo, roomId, myPlayerIndex, isHost, gameState]);

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

      setGameState(initialState);
      setRoomId(code);
      setMyPlayerIndex(0);
      setIsHost(true);
      setIsSolo(false);
      subscribeRoom(code);
      setScreen('lobby');
    } catch (e) {
      setError('Error al crear la sala. Intenta de nuevo.');
      console.error(e);
    }
  };

  // SOLO MODE
  const handlePlaySolo = () => {
    setIsSolo(true);
    setMyPlayerIndex(0);
    setIsHost(true);
    const code = "SOLO";
    const initial = createInitialState(code, "Jugador Solitario");
    const started = startGame(initial);
    setGameState(started);
    setScreen('game');
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

      setGameState(updatedState);
      setRoomId(code.toUpperCase());
      setMyPlayerIndex(newIndex);
      setIsHost(false);
      setIsSolo(false);
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
      if (isSolo) {
        setGameState(result);
      } else {
        await setRoomState(roomId, result);
      }
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
      if (isSolo) {
        setGameState(nextState);
      } else {
        await setRoomState(roomId, nextState);
      }
      setShowResult(false);
    } catch (e) {
      setError('Error al pasar turno.');
      console.error(e);
    }
  };

  // EXIT — leave the current game and go back to the menu (fresh start)
  const handleExit = () => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    clearSession();
    setShowExitConfirm(false);
    setShowResult(false);
    setGameState(null);
    setRoomId('');
    setMyPlayerIndex(-1);
    setIsHost(false);
    setIsSolo(false);
    setError('');
    setScreen('landing');
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

      {restoring && (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
          <span className="w-10 h-10 border-2 border-neon-aqua/30 border-t-neon-aqua rounded-full animate-spin" />
          <p className="text-white/50 font-display text-sm">Recuperando tu partida…</p>
        </div>
      )}

      {!restoring && screen === 'landing' && (
        <Landing
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onPlaySolo={handlePlaySolo}
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
          onExit={() => setShowExitConfirm(true)}
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
            onExit={() => setShowExitConfirm(true)}
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

      {/* Exit confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="w-full max-w-sm animate-bounce-in">
            <div className="glass p-7 text-center neon-glow-coral border-neon-coral/30">
              <div className="text-5xl mb-3">🚪</div>
              <h2 className="font-display font-black text-2xl text-white mb-2">¿Salir del juego?</h2>
              <p className="text-white/50 text-sm mb-6 font-body">
                Volverás al menú principal{isSolo ? ' y perderás esta partida.' : '.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 rounded-xl py-3 font-display font-bold text-white/80
                             bg-white/10 border border-white/10 hover:bg-white/20
                             transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-exit"
                  onClick={handleExit}
                  className="flex-1 rounded-xl py-3 font-display font-bold text-white
                             bg-neon-coral hover:shadow-[0_0_30px_rgba(255,45,149,0.35)]
                             transition-all active:scale-95"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState?.phase === 'finished' && (
        <VictoryScreen
          gameState={gameState}
          myPlayerIndex={myPlayerIndex}
          onPlayAgain={() => {
            clearSession();
            setScreen('landing');
            setGameState(null);
            setRoomId('');
            setMyPlayerIndex(-1);
            setIsSolo(false);
          }}
        />
      )}
    </div>
  );
}
