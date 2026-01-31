import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Search, Music2, AlertCircle } from 'lucide-react';

interface Track {
  title: string;
  artist: string;
  thumbnail: string;
  streamUrl: string;
}

function App() {
  const [query, setQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchTrack = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fetch-track?videoId=${query}`);
      const data = await res.json();
      
      if (data.streamUrl) {
        setCurrentTrack(data);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.load();
        }
      } else {
        setError(data.error || "Error al obtener la pista");
      }
    } catch (err) {
      setError("Error de red en Symphony");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Error de reproducción:", err);
            setError("Toca de nuevo para reproducir");
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-md mt-6 space-y-6">
        <h1 className="text-4xl font-black text-center tracking-tighter text-red-600 italic">SYMPHONY</h1>
        
        {/* Buscador */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Introduce ID de YouTube..."
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-600 outline-none transition-all shadow-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTrack()}
          />
          <button 
            onClick={fetchTrack}
            className="absolute right-2 p-2.5 bg-red-600 rounded-xl hover:bg-red-700 transition-all active:scale-90 shadow-lg"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Mensajes de Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Reproductor principal */}
        {currentTrack && (
          <div className="bg-[#141414] rounded-[3rem] p-8 shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="aspect-square w-full mb-8 overflow-hidden rounded-[2rem] shadow-2xl">
              <img 
                src={currentTrack.thumbnail} 
                alt="Album Art" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
            
            <div className="space-y-2 mb-8 text-center">
              <h2 className="text-2xl font-bold truncate tracking-tight">{currentTrack.title}</h2>
              <p className="text-gray-500 text-lg font-medium">{currentTrack.artist}</p>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-white/5 h-1.5 rounded-full mb-10 overflow-hidden">
              <div 
                className="bg-red-600 h-full transition-all duration-150" 
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controles Estilo Symphony */}
            <div className="flex justify-between items-center px-4">
              <button className="text-gray-500 hover:text-white transition-colors"><SkipBack size={32} fill="currentColor" /></button>
              <button 
                onClick={togglePlay}
                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" className="ml-1" />}
              </button>
              <button className="text-gray-400 hover:text-white transition-colors"><SkipForward size={32} fill="currentColor" /></button>
            </div>
          </div>
        )}

        {/* Audio Engine */}
        <audio
          ref={audioRef}
          src={currentTrack?.streamUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          preload="auto"
        />

        {loading && (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500 animate-pulse">Sincronizando con Symphony...</p>
          </div>
        )}

        {!currentTrack && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-700">
            <Music2 size={80} className="mb-4 opacity-10" />
            <p className="text-sm uppercase tracking-widest font-bold opacity-30">Waiting for Signal</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
