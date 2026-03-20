import type { Player } from '../lib/types';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIdx: number;
  myPlayerIndex: number;
}

export default function ScoreBoard({ players, currentPlayerIdx, myPlayerIndex }: ScoreBoardProps) {
  const colors = [
    { bg: 'bg-neon-coral/20', text: 'text-neon-coral', dot: 'bg-neon-coral' },
    { bg: 'bg-neon-aqua/20', text: 'text-neon-aqua', dot: 'bg-neon-aqua' },
    { bg: 'bg-neon-purple/20', text: 'text-neon-purple', dot: 'bg-neon-purple' },
    { bg: 'bg-neon-yellow/20', text: 'text-neon-yellow', dot: 'bg-neon-yellow' },
    { bg: 'bg-neon-pink/20', text: 'text-neon-pink', dot: 'bg-neon-pink' },
  ];

  return (
    <div className="px-4 py-2">
      <div className="max-w-lg mx-auto flex gap-2 overflow-x-auto no-scrollbar">
        {players.map((player, idx) => {
          const color = colors[idx % colors.length];
          const isCurrentTurn = idx === currentPlayerIdx;
          const isMe = idx === myPlayerIndex;

          return (
            <div
              key={idx}
              className={`flex-shrink-0 glass-card px-3 py-2 flex items-center gap-2 transition-all
                ${isCurrentTurn ? 'border-white/20 scale-105' : 'border-white/5 opacity-70'}
                ${isMe ? 'ring-1 ring-neon-aqua/30' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full ${color.bg} flex items-center justify-center`}>
                <span className={`text-[10px] font-display font-bold ${color.text}`}>
                  {player.name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className={`text-[10px] font-display font-semibold ${color.text} leading-none`}>
                  {player.name.slice(0, 8)}
                  {isMe && <span className="text-white/30"> •</span>}
                </p>
                <p className="text-[10px] text-white/40 font-display">
                  {player.score}/10
                </p>
              </div>
              {isCurrentTurn && (
                <div className={`w-1.5 h-1.5 rounded-full ${color.dot} animate-pulse`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
