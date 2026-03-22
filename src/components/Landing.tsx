import { useState } from 'react';

interface LandingProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onPlaySolo: () => void;
  error: string;
}

export default function Landing({ onCreateRoom, onJoinRoom, onPlaySolo, error }: LandingProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    await onCreateRoom(playerName.trim());
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    setLoading(true);
    await onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-20 note-float" style={{ animationDelay: '0s' }}>🎵</div>
        <div className="absolute top-40 right-16 text-3xl opacity-15 note-float" style={{ animationDelay: '1s' }}>🎶</div>
        <div className="absolute bottom-32 left-20 text-5xl opacity-10 note-float" style={{ animationDelay: '2s' }}>🎤</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-15 note-float" style={{ animationDelay: '0.5s' }}>🎸</div>
        <div className="absolute top-1/3 left-1/4 text-3xl opacity-10 note-float" style={{ animationDelay: '1.5s' }}>🎺</div>
      </div>

      {/* Logo / Title */}
      <div className="text-center mb-10 animate-fade-in z-10">
        <h1 className="font-display font-black text-5xl sm:text-7xl mb-2">
          <span className="gradient-text">HITSTER</span>
        </h1>
        <p className="font-display text-xl sm:text-2xl text-neon-aqua/80 tracking-widest">
          LATAM 🌎
        </p>
        <p className="text-white/40 text-sm mt-3 font-body">
          ¿Quién conoce mejor la música?
        </p>
      </div>

      {/* Menu */}
      {mode === 'menu' && (
        <div className="w-full max-w-sm space-y-4 animate-slide-up z-10">
          <button
            id="btn-create-room"
            onClick={() => setMode('create')}
            className="w-full glass-card p-5 neon-glow-aqua border-neon-aqua/30
                       flex items-center gap-4 group
                       transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-neon-aqua/20 flex items-center justify-center
                            group-hover:bg-neon-aqua/30 transition-colors">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-lg text-neon-aqua">Crear Sala</p>
              <p className="text-white/40 text-xs">Sé el anfitrión de la partida</p>
            </div>
            <span className="ml-auto text-neon-aqua/50 group-hover:text-neon-aqua 
                             group-hover:translate-x-1 transition-all">→</span>
          </button>

          <button
            id="btn-join-room"
            onClick={() => setMode('join')}
            className="w-full glass-card p-5 neon-glow-purple border-neon-purple/30
                       flex items-center gap-4 group
                       transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center
                            group-hover:bg-neon-purple/30 transition-colors">
              <span className="text-2xl">🎮</span>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-lg text-neon-purple">Unirse a Sala</p>
              <p className="text-white/40 text-xs">Ingresa el código de tu amigo</p>
            </div>
            <span className="ml-auto text-neon-purple/50 group-hover:text-neon-purple 
                             group-hover:translate-x-1 transition-all">→</span>
          </button>

          <button
            id="btn-play-solo"
            onClick={onPlaySolo}
            className="w-full glass-card p-5 neon-glow-coral border-neon-coral/30
                       flex items-center gap-4 group
                       transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-neon-coral/20 flex items-center justify-center
                            group-hover:bg-neon-coral/30 transition-colors">
              <span className="text-2xl">🎧</span>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-lg text-neon-coral">Modo Solitario</p>
              <p className="text-white/40 text-xs">Juega y practica por tu cuenta</p>
            </div>
            <span className="ml-auto text-neon-coral/50 group-hover:text-neon-coral 
                             group-hover:translate-x-1 transition-all">→</span>
          </button>

          {/* How to play */}
          <div className="glass-card p-4 border-white/5 mt-6">
            <p className="font-display font-semibold text-sm text-white/60 mb-2">📖 ¿Cómo jugar?</p>
            <ol className="text-xs text-white/40 space-y-1.5 list-decimal list-inside">
              <li>Escucha el fragmento de la canción</li>
              <li>Coloca la carta en tu línea de tiempo</li>
              <li>¡Ordena cronológicamente para ganar puntos!</li>
              <li>El primero en colocar <span className="text-neon-coral font-semibold">10 cartas</span> correctas gana 🏆</li>
            </ol>
          </div>
        </div>
      )}

      {/* Create Room Form */}
      {mode === 'create' && (
        <div className="w-full max-w-sm animate-slide-up z-10">
          <div className="glass p-6 neon-glow-aqua">
            <button
              onClick={() => setMode('menu')}
              className="text-white/40 hover:text-white text-sm mb-4 transition-colors"
            >
              ← Volver
            </button>
            
            <h2 className="font-display font-bold text-2xl text-neon-aqua mb-6">
              🏠 Crear Sala
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 font-display uppercase tracking-wider mb-1.5 block">
                  Tu nombre
                </label>
                <input
                  id="input-player-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ingresa tu nombre..."
                  maxLength={15}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white placeholder:text-white/20 font-body
                             focus:outline-none focus:border-neon-aqua/50 focus:bg-white/10
                             transition-all"
                />
              </div>

              <button
                id="btn-confirm-create"
                onClick={handleCreate}
                disabled={!playerName.trim() || loading}
                className="w-full bg-gradient-to-r from-neon-aqua to-neon-aqua/80 
                           rounded-xl py-3.5 font-display font-bold text-dark-900
                           transition-all duration-300 
                           hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]
                           active:scale-95
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    Creando...
                  </span>
                ) : 'Crear Sala 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Form */}
      {mode === 'join' && (
        <div className="w-full max-w-sm animate-slide-up z-10">
          <div className="glass p-6 neon-glow-purple">
            <button
              onClick={() => setMode('menu')}
              className="text-white/40 hover:text-white text-sm mb-4 transition-colors"
            >
              ← Volver
            </button>
            
            <h2 className="font-display font-bold text-2xl text-neon-purple mb-6">
              🎮 Unirse a Sala
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 font-display uppercase tracking-wider mb-1.5 block">
                  Tu nombre
                </label>
                <input
                  id="input-join-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ingresa tu nombre..."
                  maxLength={15}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white placeholder:text-white/20 font-body
                             focus:outline-none focus:border-neon-purple/50 focus:bg-white/10
                             transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 font-display uppercase tracking-wider mb-1.5 block">
                  Código de sala
                </label>
                <input
                  id="input-room-code"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="ABCD"
                  maxLength={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white text-center text-2xl font-display font-bold tracking-[0.5em]
                             placeholder:text-white/20 placeholder:tracking-[0.5em]
                             focus:outline-none focus:border-neon-purple/50 focus:bg-white/10
                             transition-all uppercase"
                />
              </div>

              <button
                id="btn-confirm-join"
                onClick={handleJoin}
                disabled={!playerName.trim() || roomCode.length < 4 || loading}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-purple/80 
                           rounded-xl py-3.5 font-display font-bold text-white
                           transition-all duration-300 
                           hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]
                           active:scale-95
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Conectando...
                  </span>
                ) : 'Unirse 🎯'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
