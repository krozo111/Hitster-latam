import { useEffect, useRef, useState, useCallback } from 'react';

interface YouTubePlayerProps {
  videoId: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiReady) {
      resolve();
      return;
    }
    readyCallbacks.push(resolve);
    if (!apiLoaded) {
      apiLoaded = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(tag, firstScript);
      window.onYouTubeIframeAPIReady = () => {
        apiReady = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.length = 0;
      };
    }
  });
}

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  const playerDivRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'playing' | 'paused' | 'error'>('loading');
  const currentVideoIdRef = useRef(videoId);

  const createPlayer = useCallback(async () => {
    await loadYouTubeAPI();

    // Destroy old player
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }

    if (!playerDivRef.current) return;

    // Clear container and create fresh div
    const wrapper = playerDivRef.current;
    wrapper.innerHTML = '';
    const el = document.createElement('div');
    el.id = `yt-${Date.now()}`;
    wrapper.appendChild(el);

    setStatus('loading');
    currentVideoIdRef.current = videoId;

    playerRef.current = new window.YT.Player(el.id, {
      width: '100%',
      height: '200',
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,       // Show native controls so user can interact
        modestbranding: 1,
        playsinline: 1,     // Critical for iOS
        rel: 0,
        fs: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          setStatus('ready');
        },
        onStateChange: (e: any) => {
          const s = e.data;
          if (s === window.YT.PlayerState.PLAYING) setStatus('playing');
          else if (s === window.YT.PlayerState.PAUSED) setStatus('paused');
          else if (s === window.YT.PlayerState.ENDED) setStatus('ready');
        },
        onError: (e: any) => {
          console.warn('YT player error', e.data, 'for video', videoId);
          setStatus('error');
        },
      },
    });
  }, [videoId]);

  // Re-create player when videoId changes
  useEffect(() => {
    createPlayer();
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [videoId, createPlayer]);

  const handlePlay = () => {
    try {
      playerRef.current?.playVideo();
    } catch (_) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener');
    }
  };

  return (
    <div className="glass-card overflow-hidden border-white/10">
      {/* Embedded YouTube iframe - visible with native controls */}
      <div
        ref={playerDivRef}
        className="w-full bg-dark-800"
        style={{ minHeight: status === 'error' ? 0 : 200 }}
      />

      {/* Status bar below the player */}
      <div className="px-4 py-3 flex items-center gap-3">
        {status === 'loading' && (
          <>
            <span className="w-5 h-5 border-2 border-neon-aqua/30 border-t-neon-aqua rounded-full animate-spin flex-shrink-0" />
            <span className="text-sm text-white/50 font-display">Cargando reproductor…</span>
          </>
        )}

        {status === 'ready' && (
          <>
            <button
              id="btn-play-music"
              onClick={handlePlay}
              className="w-10 h-10 rounded-full bg-neon-aqua/20 text-neon-aqua flex items-center justify-center
                         hover:bg-neon-aqua hover:text-dark-900 transition-all active:scale-90 flex-shrink-0"
            >
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-sm text-neon-aqua/70 font-display">Toca ▶ para escuchar</span>
          </>
        )}

        {status === 'playing' && (
          <>
            <div className="flex items-end gap-0.5 h-5 flex-shrink-0">
              {[1, 2, 3, 4].map((b) => (
                <div
                  key={b}
                  className="w-1 bg-neon-aqua rounded-full"
                  style={{
                    height: '100%',
                    animation: `musicBar 0.7s ease-in-out ${b * 0.12}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-neon-aqua font-display font-semibold">Reproduciendo 🎵</span>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              onClick={handlePlay}
              className="w-10 h-10 rounded-full bg-white/10 text-white/60 flex items-center justify-center
                         hover:bg-neon-aqua/20 hover:text-neon-aqua transition-all active:scale-90 flex-shrink-0"
            >
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-sm text-white/40 font-display">Pausado</span>
          </>
        )}

        {status === 'error' && (
          <div className="flex flex-col gap-2 w-full">
            <p className="text-neon-coral text-sm font-display">
              ⚠️ Este video no permite reproducción embebida
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 rounded-xl bg-red-500/20 text-red-400 
                         font-display font-semibold text-sm border border-red-500/20
                         hover:bg-red-500/30 transition-all active:scale-95"
            >
              🎬 Abrir en YouTube ↗
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes musicBar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
