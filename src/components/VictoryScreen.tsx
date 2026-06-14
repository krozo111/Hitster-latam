import type { GameState } from '../lib/types';

interface VictoryScreenProps {
  gameState: GameState;
  myPlayerIndex: number;
  onPlayAgain: () => void;
}

export default function VictoryScreen({ gameState, myPlayerIndex, onPlayAgain }: VictoryScreenProps) {
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isWinner = winner.index === myPlayerIndex;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      {/* Confetti-like background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🎵', '🎶', '🎉', '🏆', '⭐', '🎸', '🎤', '🎺'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-20"
            style={{
              left: `${(i * 17 + 5) % 90}%`,
              top: `${(i * 23 + 10) % 80}%`,
              animation: `noteFloat ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Trophy */}
      <div className="text-7xl mb-4 animate-bounce-in">🏆</div>

      <h1 className="font-display font-black text-4xl gradient-text mb-2 text-center animate-slide-up">
        {isWinner ? '¡GANASTE!' : `¡${winner.name} GANA!`}
      </h1>

      <p className="text-white/40 text-sm mb-8 font-display animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {isWinner ? '¡Eres el maestro de la música LATAM!' : '¡Buen juego! La próxima será tuya 💪'}
      </p>

      {/* Leaderboard */}
      <div className="w-full max-w-sm glass p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="font-display font-bold text-lg text-white/80 mb-4 text-center">
          📊 Tabla de Posiciones
        </h2>

        <div className="space-y-3">
          {sortedPlayers.map((player, rank) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isMe = player.index === myPlayerIndex;
            
            return (
              <div
                key={player.index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all
                  ${rank === 0 ? 'bg-gradient-to-r from-neon-yellow/10 to-neon-coral/10 border border-neon-yellow/20' :
                    isMe ? 'bg-neon-aqua/5 border border-neon-aqua/10' :
                    'bg-white/5 border border-white/5'}`}
              >
                <span className="text-xl w-8 text-center">
                  {rank < 3 ? medals[rank] : `#${rank + 1}`}
                </span>
                <div className="flex-1">
                  <p className={`font-display font-semibold text-sm
                    ${rank === 0 ? 'text-neon-yellow' : 'text-white/80'}`}>
                    {player.name}
                    {isMe && <span className="text-neon-aqua text-xs ml-1">(Tú)</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-display font-bold text-lg
                    ${rank === 0 ? 'text-neon-yellow' : 'text-white/60'}`}>
                    {player.score}
                  </p>
                  <p className="text-[10px] text-white/30">puntos</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Play Again */}
      <button
        id="btn-play-again"
        onClick={onPlayAgain}
        className="w-full max-w-sm bg-gradient-to-r from-neon-coral via-neon-purple to-neon-aqua
                   rounded-xl py-4 font-display font-bold text-lg text-white
                   transition-all duration-300 
                   hover:shadow-[0_0_40px_rgba(155,93,229,0.35)]
                   active:scale-95
                   animate-slide-up"
        style={{ animationDelay: '0.4s' }}
      >
        ¡Jugar de Nuevo! 🎵
      </button>
    </div>
  );
}
