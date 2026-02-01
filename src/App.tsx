import React, { useState, useRef } from 'react';
import { Play, Pause, Search, Music2, Loader2, ChevronDown, AlertCircle, Zap } from 'lucide-react';

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
    } catch (err) {
      setError("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const selectTrack = async (track: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fetch-track?videoId=${track.videoId}`);
      if (!res.ok) throw new Error("Stream Unavailable");
      const data = await res.json();
      setCurrentTrack(data);
      setIsPlayerOpen(true);
      setTimeout(() => {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
      }, 300);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#eee] font-sans overflow-x-hidden">
      <nav className="p-4 sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="bg-red-600 p-2 rounded-xl rotate-3 shadow-lg shadow-red-600/20">
            <Zap size={24} className="text-white" fill="currentColor" />
          </div>
          <div className="relative flex-1">
            <input 
              className="w-full bg-[#111] rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
              placeholder="Search 500 nodes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 pb-40">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="font-bold text-xs uppercase tracking-widest">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((track: any, i) => (
            <div key={i} onClick={() => selectTrack(track)} className="flex items-center gap-4 p-4 bg-[#0d0d0d] hover:bg-[#151515] rounded-[2rem] border border-white/5 cursor-pointer transition-all active:scale-95 group">
              <img src={track.thumbnail} className="w-16 h-16 rounded-2xl object-cover shadow-xl group-hover:rotate-3 transition-transform" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm">{track.title}</h3>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">{track.artist}</p>
              </div>
              <div className="bg-red-600/10 p-2 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={18} fill="currentColor" />
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="relative">
              <Loader2 className="animate-spin text-red-600" size={48} />
              <Zap className="absolute inset-0 m-auto text-white animate-pulse" size={16} />
            </div>
            <p className="text-[10px] font-black tracking-[0.6em] text-red-600 mt-6 uppercase">Syncing Symphony...</p>
          </div>
        )}

        {!results.length && !loading && (
          <div className="py-40 text-center opacity-10 select-none">
            <Music2 size={120} className="mx-auto" />
            <h2 className="text-3xl font-black italic tracking-tighter mt-4">SYMPHONY OS</h2>
          </div>
        )}
      </main>

      {currentTrack && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-700 ${isPlayerOpen ? 'h-full bg-[#050505]' : 'h-24 bg-[#080808]/95 backdrop-blur-xl border-t border-white/5'}`}>
          <div className={`max-w-5xl mx-auto h-full flex flex-col px-6 ${isPlayerOpen ? 'pt-12' : 'justify-center'}`}>
            {isPlayerOpen && (
              <button onClick={() => setIsPlayerOpen(false)} className="mb-10 p-3 bg-white/5 rounded-full self-start">
                <ChevronDown size={32} />
              </button>
            )}

            <div className={`flex items-center ${isPlayerOpen ? 'flex-col gap-10 flex-1 justify-center' : 'flex-row gap-4'}`}>
              <div className={`relative transition-all duration-700 ${isPlayerOpen ? 'w-80 h-80' : 'w-14 h-14'}`}>
                <img src={currentTrack.thumbnail} className={`w-full h-full object-cover shadow-2xl transition-all duration-700 ${isPlayerOpen ? 'rounded-[4rem]' : 'rounded-xl'}`} alt="" />
                {isPlaying && isPlayerOpen && <div className="absolute inset-0 rounded-[4rem] bg-red-600/20 animate-pulse" />}
              </div>

              <div className={`transition-all duration-500 ${isPlayerOpen ? 'text-center' : 'flex-1 min-w-0'}`}>
                <h2 className={`font-black truncate ${isPlayerOpen ? 'text-4xl' : 'text-base'}`}>{currentTrack.title}</h2>
                <p className="text-red-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">{currentTrack.artist}</p>
              </div>

              <button onClick={togglePlay} className={`bg-white text-black rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-90 ${isPlayerOpen ? 'w-24 h-24 mb-20' : 'w-12 h-12'}`}>
                {isPlaying ? <Pause size={isPlayerOpen ? 40 : 24} fill="black" /> : <Play size={isPlayerOpen ? 40 : 24} fill="black" className="ml-1" />}
              </button>
            </div>

            <div className={`w-full bg-white/5 h-1.5 rounded-full overflow-hidden ${!isPlayerOpen ? 'absolute bottom-0 left-0 h-1' : 'mb-20'}`}>
              <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <audio 
        ref={audioRef} 
        src={currentTrack?.streamUrl} 
        onTimeUpdate={() => setProgress((audioRef.current!.currentTime / audioRef.current!.duration) * 100)} 
        onEnded={() => setIsPlaying(false)} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)} 
      />
    </div>
  );
}

export default App;
