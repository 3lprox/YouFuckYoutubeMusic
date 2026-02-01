import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Search, Music2, Loader2, Heart, ListMusic, ChevronDown } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const searchTracks = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-track?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectTrack = async (track: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-track?videoId=${track.videoId}`);
      const data = await res.json();
      if (data.streamUrl) {
        setCurrentTrack(data);
        setIsPlayerOpen(true);
        setIsPlaying(false);
        setTimeout(() => togglePlay(), 500);
      }
    } catch (err) { alert("Error al cargar stream"); }
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
    <div className="min-h-screen bg-[#0f0f0f] text-[#e3e3e3] font-sans selection:bg-red-500/30">
      {/* Search Header */}
      <header className="sticky top-0 z-30 bg-[#0f0f0f]/80 backdrop-blur-xl p-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <h1 className="hidden md:block text-2xl font-black text-red-600 italic mr-4">SYMPHONY</h1>
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar canciones, artistas..."
              className="w-full bg-[#1e1e1e] border-none rounded-2xl py-3.5 px-12 focus:ring-2 focus:ring-red-600 outline-none transition-all text-lg shadow-inner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
            />
          </div>
          <button onClick={searchTracks} className="md:hidden p-3 bg-red-600 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-red-600/20">
            <Search size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 pb-32">
        {loading && !currentTrack && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium tracking-widest uppercase text-xs">Sincronizando Symphony...</p>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((track: any, i) => (
            <div 
              key={i} 
              onClick={() => selectTrack(track)}
              className="flex items-center gap-4 p-3 bg-[#1e1e1e]/40 hover:bg-[#2a2a2a] rounded-2xl cursor-pointer transition-all active:scale-[0.98] group border border-white/5"
            >
              <img src={track.thumbnail} className="w-16 h-16 rounded-xl object-cover shadow-lg" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm md:text-base">{track.title}</h3>
                <p className="text-gray-500 text-xs truncate uppercase tracking-tighter">{track.artist}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 rounded-full transition-opacity">
                <Play size={16} fill="white" />
              </div>
            </div>
          ))}
        </div>

        {!results.length && !loading && (
          <div className="text-center py-32 opacity-20">
            <Music2 size={80} className="mx-auto mb-4" />
            <p className="text-xl font-black italic uppercase tracking-widest">Symphony Engine Ready</p>
          </div>
        )}
      </main>

      {/* Mini Player / Bottom Sheet (Material Design 3 Style) */}
      {currentTrack && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isPlayerOpen ? 'h-full translate-y-0' : 'h-20 translate-y-0'}`}>
          <div className={`h-full bg-[#121212] flex flex-col shadow-2xl ${!isPlayerOpen && 'border-t border-white/10'}`}>
            
            {/* Control superior para cerrar */}
            {isPlayerOpen && (
              <button onClick={() => setIsPlayerOpen(false)} className="p-6 self-start text-gray-500 hover:text-white transition-colors">
                <ChevronDown size={32} />
              </button>
            )}

            {/* Layout dinámico */}
            <div className={`flex flex-1 max-w-5xl mx-auto w-full px-6 items-center ${isPlayerOpen ? 'flex-col justify-center' : 'flex-row justify-between h-20'}`}>
              
              {/* Imagen/Cover */}
              <div className={`overflow-hidden shadow-2xl transition-all duration-500 ${isPlayerOpen ? 'w-80 h-80 rounded-[3rem] mb-12 border border-white/10' : 'w-12 h-12 rounded-lg'}`}>
                <img src={currentTrack.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>

              {/* Títulos */}
              <div className={`transition-all duration-500 ${isPlayerOpen ? 'text-center mb-10' : 'flex-1 ml-4 min-w-0'}`}>
                <h2 className={`font-black truncate ${isPlayerOpen ? 'text-3xl' : 'text-sm'}`}>{currentTrack.title}</h2>
                <p className={`text-red-600 font-bold uppercase tracking-widest ${isPlayerOpen ? 'text-sm mt-2' : 'text-[10px]'}`}>{currentTrack.artist}</p>
              </div>

              {/* Botón Play/Pause */}
              <div className={`flex items-center gap-6 ${isPlayerOpen ? 'scale-150 mt-10' : ''}`}>
                <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                  {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Barra de progreso inferior (siempre visible) */}
            <div className="w-full bg-white/5 h-1">
              <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Audio Engine */}
      <audio
        ref={audioRef}
        src={currentTrack?.streamUrl}
        onTimeUpdate={() => setProgress((audioRef.current!.currentTime / audioRef.current!.duration) * 100)}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      />
    </div>
  );
}

export default App;
