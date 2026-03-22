import { useState, useMemo } from 'react';
import type { GameState, Song } from '../lib/types';
import SongCard from './SongCard.tsx';
import YouTubePlayer from './YouTubePlayer.tsx';
import ScoreBoard from './ScoreBoard.tsx';

interface GameBoardProps {
  gameState: GameState;
  myPlayerIndex: number;
  isMyTurn: boolean;
  onPlaceCard: (insertIdx: number) => void;
  onNextTurn: () => void;
  showResult: boolean;
}

export default function GameBoard({
  gameState,
  myPlayerIndex,
  isMyTurn,
  onPlaceCard,
  onNextTurn,
  showResult,
}: GameBoardProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const myPlayer = gameState.players[myPlayerIndex];
  const currentPlayer = gameState.players[gameState.currentPlayerIdx];
  const card = gameState.currentCard;

  // Sort timeline by year for display
  const sortedTimeline = useMemo(() => {
    if (!myPlayer) return [];
    return [...myPlayer.timeline].sort((a, b) => a.year - b.year);
  }, [myPlayer?.timeline]);

  // Generate drop zones (between each card + ends)
  const dropZones = useMemo(() => {
    const zones: { index: number; leftYear: number | null; rightYear: number | null }[] = [];
    for (let i = 0; i <= sortedTimeline.length; i++) {
      zones.push({
        index: i,
        leftYear: i > 0 ? sortedTimeline[i - 1].year : null,
        rightYear: i < sortedTimeline.length ? sortedTimeline[i].year : null,
      });
    }
    return zones;
  }, [sortedTimeline]);

  const handleSelectSlot = (idx: number) => {
    if (!isMyTurn || showResult) return;
    setSelectedSlot(idx);
  };

  const handleConfirm = () => {
    if (selectedSlot === null || !isMyTurn) return;
    onPlaceCard(selectedSlot);
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-dvh flex flex-col pb-4">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 glass border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-display">Sala</span>
            <span className="font-display font-bold text-neon-aqua text-sm">{gameState.roomId}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Mazo:</span>
            <span className="font-display font-bold text-neon-purple text-sm">
              {gameState.deck.length}
            </span>
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className={`px-4 py-2 text-center text-sm font-display
        ${isMyTurn ? 'bg-neon-aqua/10 text-neon-aqua' : 'bg-white/5 text-white/50'}`}>
        {isMyTurn ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-aqua animate-pulse" />
            ¡Es tu turno!
          </span>
        ) : (
          <span>Turno de <strong className="text-neon-coral">{currentPlayer?.name}</strong></span>
        )}
      </div>

      {/* Score Board */}
      <ScoreBoard
        players={gameState.players}
        currentPlayerIdx={gameState.currentPlayerIdx}
        myPlayerIndex={myPlayerIndex}
      />

      {/* Current Card + YouTube Player */}
      {card && !showResult && (
        <div className="px-4 py-4 animate-fade-in">
          <div className="max-w-lg mx-auto">
            {/* Song Card */}
            <div className="mb-4">
              <SongCard
                song={card}
                showYear={false}
                isActive={true}
              />
            </div>

            {/* YouTube Player */}
            <YouTubePlayer videoId={card.yt} />
          </div>
        </div>
      )}

      {/* My Timeline with Drop Zones */}
      <div className="flex-1 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h3 className="font-display font-semibold text-sm text-white/50 mb-3 flex items-center gap-2">
            <span>📋</span> Tu Línea de Tiempo
            <span className="ml-auto text-neon-aqua">{myPlayer?.score || 0} pts</span>
          </h3>

          {/* Timeline */}
          <div className="space-y-1">
            {dropZones.map((zone, i) => (
              <div key={`zone-${i}`}>
                {/* Drop Zone */}
                {isMyTurn && !showResult && (
                  <button
                    onClick={() => handleSelectSlot(zone.index)}
                    className={`drop-zone w-full py-2 rounded-lg border-2 border-dashed
                      transition-all duration-300 text-xs font-display
                      ${selectedSlot === zone.index
                        ? 'active border-neon-aqua bg-neon-aqua/20 text-neon-aqua py-4'
                        : 'border-white/10 text-white/20 hover:border-neon-aqua/30 hover:text-neon-aqua/40 hover:py-3'
                      }`}
                  >
                    {selectedSlot === zone.index ? '▼ Colocar aquí ▼' : '+ Colocar aquí'}
                  </button>
                )}

                {/* Timeline Card */}
                {i < sortedTimeline.length && (
                  <div className="my-1">
                    <SongCard
                      song={sortedTimeline[i]}
                      showYear={true}
                      isActive={false}
                      compact
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Confirm Button */}
          {isMyTurn && !showResult && selectedSlot !== null && (
            <div className="mt-6 animate-slide-up">
              <button
                id="btn-confirm-placement"
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-neon-aqua to-neon-purple
                           rounded-xl py-4 font-display font-bold text-lg text-white
                           transition-all duration-300
                           hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]
                           active:scale-95"
              >
                ¡Confirmar Colocación! ✨
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
