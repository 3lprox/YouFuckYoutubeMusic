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
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchTrack = async () => {
    if (!query) return;
    setLoading(true);
    setAudioError(null);
    try {
      // Cambiamos a la URL de tu API en Vercel
      const res = await fetch(`/api/fetch-track?videoId=${query}`);
      const data = await res.json();
      
      if (data.streamUrl) {
        setCurrentTrack(data);
        setIsPlaying(false);
        // Resetear el elemento de audio para el nuevo stream
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.load();
        }
      } else {
        setAudioError("No se pudo obtener el enlace de audio");
      }
    } catch (error) {
      setAudioError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setAudioError(null);
        // Intentar reproducir y capturar errores de políticas de navegador
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error("Playback error:", err);
            setAudioError("El navegador bloqueó el audio. Intenta pulsar Play de nuevo.");
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  // Efecto para debug de errores de audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = () => {
      console.error("Audio Element Error:", audio.error);
      setAudioError("Error al cargar el stream. El servidor de audio podría estar saturado.");
      setIsPlaying(false);
    };

    audio.addEventListener('error', handleError);
    return () => audio.removeEventListener('error', handleError);
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-md mt-8 space-y-6">
        <h1 className="text-3xl font-bold text-center tracking-tight text-red-600">SYMPHONY</h1>
        
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="ID de YouTube (ej: j6YpC8I2T8k)"
            className="w-full bg-[#212121] border-none rounded-full py-4 px-6 pr-12 focus:ring-2 focus:ring-red-600 outline-none transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTrack()}
          />
          <button 
            onClick={fetchTrack}
            disabled={loading}
            className="absolute right-2 p-2.5 bg-red-600 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Search size={20} />
          </button>
        </div>

        {audioError && (
          <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            <p>{audioError}</p>
          </div>
        )}

        {currentTrack && (
          <div className="bg-[#1e1e1e] rounded-[2.5rem] p-8 shadow-2xl">
            <div className="aspect-square w-full mb-8 overflow-hidden rounded-3xl shadow-2xl border border-white/5">
              <img 
                src={currentTrack.thumbnail} 
                alt="Album Art" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-1 mb-8 text-center">
              <h2 className="text-2xl font-bold truncate px-2">{currentTrack.title}</h2>
              <p className="text-gray-400 text-lg">{currentTrack.artist}</p>
            </div>

            <div className="w-full bg-white/10 h-1.5 rounded-full mb-10 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-around items-center">
              <button className="text-gray-400 hover:text-white transition-colors"><SkipBack size={32} fill="currentColor" /></button>
              <button 
                onClick={togglePlay}
                className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" className="ml-1" />}
              </button>
              <button className="text-gray-400 hover:text-white transition-colors"><SkipForward size={32} fill="currentColor" /></button>
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          src={currentTrack?.streamUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          crossOrigin="anonymous"
          preload="metadata"
        />
        
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Invocando a Symphony...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
