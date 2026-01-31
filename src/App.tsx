import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Search, Music2, Volume2 } from 'lucide-react';

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
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchTrack = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-track?videoId=${query}`);
      const data = await res.json();
      if (data.streamUrl) {
        setCurrentTrack(data);
        setIsPlaying(false); // Esperar a que el usuario pulse Play para cumplir con políticas de iOS
      }
    } catch (error) {
      console.error("Error cargando Symphony:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // En iOS/Android, play() devuelve una promesa que debe ser manejada
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Reproducción bloqueada por el navegador:", error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress || 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center p-6 font-sans">
      {/* Header / Search */}
      <div className="w-full max-w-md mt-8 space-y-6">
        <h1 className="text-3xl font-bold text-center tracking-tight text-red-500">SYMPHONY</h1>
        
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Pega el ID de YouTube..."
            className="w-full bg-[#212121] border-none rounded-full py-3 px-6 pr-12 focus:ring-2 focus:ring-red-600 outline-none transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={fetchTrack}
            disabled={loading}
            className="absolute right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Player Card */}
        {currentTrack && (
          <div className="bg-[#1e1e1e] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="aspect-square w-full mb-6 overflow-hidden rounded-2xl shadow-lg">
              <img 
                src={currentTrack.thumbnail} 
                alt="Thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-1 mb-8">
              <h2 className="text-xl font-bold truncate">{currentTrack.title}</h2>
              <p className="text-gray-400">{currentTrack.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 h-1 rounded-full mb-8">
              <div 
                className="bg-white h-1 rounded-full relative" 
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 -top-1 w-3 h-3 bg-white rounded-full shadow" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center px-4">
              <button className="text-gray-400 hover:text-white"><SkipBack size={28} /></button>
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" className="ml-1" />}
              </button>
              <button className="text-gray-400 hover:text-white"><SkipForward size={28} /></button>
            </div>
          </div>
        )}

        {/* Elemento de Audio Invisible */}
        <audio
          ref={audioRef}
          src={currentTrack?.streamUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          crossOrigin="anonymous"
          preload="auto"
        />
        
        {!currentTrack && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Music2 size={64} className="mb-4 opacity-20" />
            <p>Introduce un ID para empezar</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
