import React, { useState, useRef } from 'react';
import { Play, Pause, Search, Music2, Loader2, ChevronDown, AlertCircle } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const searchTracks = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fetch-track?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data || []);
    } catch (err) { setError("Fallo en la red Symphony"); }
    finally { setLoading(false); }
  };

  const selectTrack = async (track: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fetch-track?videoId=${track.videoId}`);
      const data = await res.json();
      if (data.streamUrl) {
        setCurrentTrack(data);
        setIsPlayerOpen(true);
        setIsPlaying(false);
        setTimeout(() => togglePlay(), 500);
      } else { setError("90 Nodos agotados. Intenta otro ID."); }
    } catch (err) { setError("Error crítico"); }
    finally { setLoading(false); }
  };

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) { audioRef.current.pause(); } 
      else { audioRef.current.play().catch(() => {}); }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e3e3e3] font-sans selection:bg-red-500/30">
      <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-2xl p-4 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <h1 className="text-2xl font-black text-red-600 italic tracking-tighter">SYMPHONY</h1>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="¿Qué quieres escuchar hoy?"
              className="w-full bg-[#1a1a1a] border-none rounded-2xl py-3 px-6 pr-12 focus:ring-2 focus:ring-red-600 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
            />
            <button onClick={searchTracks} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400"><Search size={20}/></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 pb-32">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold uppercase">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((track: any, i) => (
            <div key={i} onClick={() => selectTrack(track)} className="flex items-center gap-4 p-3 bg-[#111111] hover:bg-[#1a1a1a] rounded-2xl cursor-pointer transition-all border border-white/5 group">
              <img src={track.thumbnail} className="w-16 h-16 rounded-xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm">{track.title}</h3>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">{track.artist}</p>
              </div>
              <Play className="opacity-0 group-hover:opacity-100 text-red-600 transition-opacity" size={20} fill="currentColor" />
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20 animate-pulse">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-xs font-black tracking-[0.3em] text-red-600">SCANNING 90 NODES</p>
          </div>
        )}
      </main>

      {currentTrack && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${isPlayerOpen ? 'h-full bg-[#050505]' : 'h-24 bg-[#111111] border-t border-white/10'}`}>
          <div className={`flex flex-col h-full max-w-5xl mx-auto px-6 ${isPlayerOpen ? 'pt-12' : 'justify-center'}`}>
            {isPlayerOpen && <button onClick={() => setIsPlayerOpen(false)} className="mb-8"><ChevronDown size={40} /></button>}
            
            <div className={`flex items-center ${isPlayerOpen ? 'flex-col gap-8 text-center' : 'flex-row gap-4'}`}>
              <img src={currentTrack.thumbnail} className={`shadow-2xl transition-all duration-500 ${isPlayerOpen ? 'w-80 h-80 rounded-[3rem]' : 'w-14 h-14 rounded-xl'}`} alt="" />
              <div className="flex-1 min-w-0">
                <h2 className={`font-black truncate ${isPlayerOpen ? 'text-3xl' : 'text-base'}`}>{currentTrack.title}</h2>
                <p className={`text-red-600 font-bold tracking-[0.2em] uppercase ${isPlayerOpen ? 'text-sm mt-2' : 'text-[10px]'}`}>{currentTrack.artist}</p>
              </div>
              <button onClick={togglePlay} className={`bg-white text-black rounded-full flex items-center justify-center transition-all ${isPlayerOpen ? 'w-24 h-24' : 'w-12 h-12'}`}>
                {isPlaying ? <Pause size={isPlayerOpen ? 40 : 24} fill="black" /> : <Play size={isPlayerOpen ? 40 : 24} fill="black" className="ml-1" />}
              </button>
            </div>

            <div className={`w-full bg-white/10 h-1 mt-6 rounded-full overflow-hidden ${!isPlayerOpen && 'absolute bottom-0 left-0'}`}>
              <div className="bg-red-600 h-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} src={currentTrack?.streamUrl} onTimeUpdate={() => setProgress((audioRef.current!.currentTime / audioRef.current!.duration) * 100)} onEnded={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} preload="auto" />
    </div>
  );
}

export default App;
