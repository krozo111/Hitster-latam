import type { Song } from '../lib/types';

interface ResultOverlayProps {
  result: 'correct' | 'incorrect';
  card: Song;
  onContinue: () => void;
  isMyTurn: boolean;
}

export default function ResultOverlay({ result, card, onContinue, isMyTurn }: ResultOverlayProps) {
  const isCorrect = result === 'correct';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4 animate-fade-in"
         style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className={`w-full max-w-sm animate-bounce-in ${isCorrect ? 'result-correct' : 'result-incorrect'}`}>
        <div className={`glass p-8 text-center
          ${isCorrect ? 'neon-glow-aqua border-neon-aqua/30' : 'neon-glow-coral border-neon-coral/30'}`}>
          {/* Emoji */}
          <div className="text-6xl mb-4">
            {isCorrect ? '🎉' : '😅'}
          </div>

          {/* Result text */}
          <h2 className={`font-display font-black text-3xl mb-2
            ${isCorrect ? 'text-neon-aqua' : 'text-neon-coral'}`}>
            {isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
          </h2>

          {/* Year reveal */}
          <div className="my-6">
            <p className="text-white/40 text-sm mb-1 font-display">El año era:</p>
            <p className="font-display font-black text-5xl gradient-text animate-pulse-neon">
              {card.year}
            </p>
          </div>

          {/* Song info */}
          <div className="glass-card p-4 mb-6 border-white/5">
            <p className="font-display font-bold text-white/80 text-sm">
              {card.title}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {card.artist}
            </p>
          </div>

          {/* Result description */}
          <p className={`text-sm mb-6 font-body
            ${isCorrect ? 'text-neon-aqua/70' : 'text-neon-coral/70'}`}>
            {isCorrect 
              ? '🎵 La carta se añadió a tu línea de tiempo'
              : '🗑️ La carta fue descartada'
            }
          </p>

          {/* Continue button */}
          <button
            id="btn-continue"
            onClick={onContinue}
            className={`w-full rounded-xl py-3.5 font-display font-bold text-lg
              transition-all duration-300 active:scale-95
              ${isCorrect 
                ? 'bg-neon-aqua text-dark-900 hover:shadow-[0_0_30px_rgba(45,226,230,0.35)]' 
                : 'bg-neon-coral text-white hover:shadow-[0_0_30px_rgba(255,45,149,0.35)]'
              }`}
          >
            Siguiente Turno →
          </button>
        </div>
      </div>
    </div>
  );
}
