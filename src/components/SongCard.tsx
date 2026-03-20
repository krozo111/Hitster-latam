import { useState } from 'react';
import type { Song } from '../lib/types';

interface SongCardProps {
  song: Song;
  showYear: boolean;
  isActive?: boolean;
  compact?: boolean;
}

export default function SongCard({ song, showYear, isActive = false, compact = false }: SongCardProps) {
  const [flipped, setFlipped] = useState(false);

  if (compact) {
    return (
      <div className={`glass-card p-3 flex items-center gap-3 transition-all duration-300
        ${isActive ? 'neon-glow-aqua border-neon-aqua/30' : 'border-white/5'}`}
      >
        {/* Year badge */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-aqua/20 
                        flex items-center justify-center flex-shrink-0 border border-white/10">
          <span className="font-display font-bold text-sm text-neon-aqua">
            {showYear ? song.year : '???'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-sm text-white/90 truncate">
            {song.title}
          </p>
          <p className="text-xs text-white/40 truncate">
            {song.artist}
          </p>
        </div>

        {showYear && (
          <div className="flex-shrink-0">
            <span className="text-xs text-white/20">🎵</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-container w-full" style={{ minHeight: '120px' }}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front - Song info without year */}
        <div className={`card-front glass p-5 neon-glow-aqua
          ${isActive ? 'border-neon-aqua/40' : 'border-white/10'}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-coral/30 via-neon-purple/30 to-neon-aqua/30
                            flex items-center justify-center flex-shrink-0 border border-white/10">
              <span className="text-3xl">🎵</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-lg text-white leading-tight mb-1">
                {song.title}
              </p>
              <p className="text-sm text-white/50 font-body">
                {song.artist}
              </p>
              {showYear && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full 
                                   bg-neon-aqua/20 text-neon-aqua text-sm font-display font-bold border border-neon-aqua/20">
                    📅 {song.year}
                  </span>
                </div>
              )}
              {!showYear && isActive && (
                <p className="text-xs text-neon-coral/60 mt-2 font-display">
                  ¿En qué año salió? 🤔
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Back - Year revealed */}
        <div className="card-back glass p-5 neon-glow-coral border-neon-coral/40
                        flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl font-display font-black gradient-text mb-2">
              {song.year}
            </p>
            <p className="font-display font-semibold text-white/60 text-sm">
              {song.title}
            </p>
            <p className="text-xs text-white/30">{song.artist}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
