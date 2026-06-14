import type { GameState } from '../lib/types';

interface LobbyProps {
  gameState: GameState;
  roomId: string;
  isHost: boolean;
  myPlayerIndex: number;
  onStartGame: () => void;
  onExit: () => void;
}

export default function Lobby({ gameState, roomId, isHost, myPlayerIndex, onStartGame, onExit }: LobbyProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display
                   text-white/60 bg-white/5 border border-white/10
                   hover:text-neon-coral hover:border-neon-coral/40 transition-all active:scale-95"
      >
        <span>🚪</span> Salir
      </button>

      {/* Room Code */}
      <div className="text-center mb-8 animate-fade-in">
        <p className="text-white/40 text-sm font-display uppercase tracking-wider mb-2">
          Código de sala
        </p>
        <button
          onClick={copyCode}
          className="group relative"
          title="Copiar código"
        >
          <div className="flex gap-2">
            {roomId.split('').map((letter, i) => (
              <div
                key={i}
                className="w-14 h-16 glass-card neon-glow-aqua border-neon-aqua/30
                           flex items-center justify-center
                           font-display font-black text-3xl text-neon-aqua
                           animate-bounce-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-2 group-hover:text-neon-aqua transition-colors">
            📋 Toca para copiar
          </p>
        </button>
      </div>

      {/* Players List */}
      <div className="w-full max-w-sm glass p-6 mb-6 animate-slide-up">
        <h2 className="font-display font-bold text-lg text-white/80 mb-4 flex items-center gap-2">
          <span className="text-xl">👥</span>
          Jugadores ({gameState.players.length}/8)
        </h2>

        <div className="space-y-3">
          {gameState.players.map((player, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${idx === myPlayerIndex 
                  ? 'bg-neon-aqua/10 border border-neon-aqua/20' 
                  : 'bg-white/5 border border-white/5'
                }`}
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm
                ${idx === 0 ? 'bg-neon-coral/20 text-neon-coral' : 
                  idx === 1 ? 'bg-neon-aqua/20 text-neon-aqua' :
                  idx === 2 ? 'bg-neon-purple/20 text-neon-purple' :
                  idx === 3 ? 'bg-neon-yellow/20 text-neon-yellow' :
                  'bg-neon-pink/20 text-neon-pink'
                }`}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="font-display font-semibold text-sm">
                  {player.name}
                  {idx === myPlayerIndex && (
                    <span className="text-neon-aqua text-xs ml-1">(Tú)</span>
                  )}
                </p>
                {idx === gameState.hostIndex && (
                  <span className="text-[10px] text-neon-coral/70 font-display uppercase tracking-wider">
                    👑 Anfitrión
                  </span>
                )}
              </div>

              {/* Connection status */}
              <div className={`w-2.5 h-2.5 rounded-full ${player.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            </div>
          ))}
        </div>

        {/* Waiting message */}
        {gameState.players.length < 2 && (
          <div className="mt-4 text-center py-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-white/30 text-sm animate-pulse">
              Esperando más jugadores...
            </p>
            <p className="text-white/20 text-xs mt-1">
              Comparte el código con tus amigos
            </p>
          </div>
        )}
      </div>

      {/* Start Button (Host only) */}
      {isHost && (
        <button
          id="btn-start-game"
          onClick={onStartGame}
          disabled={gameState.players.length < 2}
          className="w-full max-w-sm bg-gradient-to-r from-neon-coral via-neon-purple to-neon-aqua
                     rounded-xl py-4 font-display font-bold text-lg text-white
                     transition-all duration-300 
                     hover:shadow-[0_0_40px_rgba(155,93,229,0.35)]
                     active:scale-95
                     disabled:opacity-30 disabled:cursor-not-allowed
                     animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          {gameState.players.length < 2 ? 'Necesitas al menos 2 jugadores' : '¡Iniciar Partida! 🎵'}
        </button>
      )}

      {!isHost && (
        <div className="w-full max-w-sm text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card p-4 border-neon-purple/20">
            <p className="text-white/50 text-sm font-display">
              ⏳ Esperando que el anfitrión inicie la partida...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
