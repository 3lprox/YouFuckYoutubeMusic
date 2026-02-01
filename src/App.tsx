import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Search, Music2, Loader2, ChevronDown, AlertCircle, Zap } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [error, setError] = useState(null);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<any>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('symphony-engine', {
        height: '1',
        width: '1',
        videoId: '',
        playerVars: { 'controls': 0, 'disablekb': 1, 'modestbranding': 1 },
        events: {
          'onStateChange': (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
          }
        }
      });
    };

    return () => clearInterval(progressInterval.current);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const current = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          setProgress((current / duration) * 100);
        }
      }, 1000);
    } else {
      clearInterval(progressInterval.current);
    }
  }, [isPlaying]);

  const searchTracks = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fetch-track?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data || []);
    } catch (err) { setError("Search Error"); }
    finally { setLoading(false); }
  };

  const selectTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlayerOpen(true);
    if (playerRef.current) {
      playerRef.current.loadVideoById(track.videoId);
      playerRef.current.playVideo();
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#eee] font-sans overflow-x-hidden">
      <div id="symphony-engine" className="absolute -left-[9999px]"></div>

      <nav className="p-4 sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="bg-red-600 p-2 rounded-xl rotate-3">
            <Zap size={24} className="text-white" fill="currentColor" />
          </div>
          <div className="relative flex-1">
            <input 
              className="w-full bg-[#111] rounded-2xl py-3.5 px-6 outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
              placeholder="Search music..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((track: any, i) => (
            <div key={i} onClick={() => selectTrack(track)} className="flex items-center gap-4 p-4 bg-[#0d0d0d] hover:bg-[#151515] rounded-[2rem] border border-white/5 cursor-pointer transition-all active:scale-95 group">
              <img src={track.thumbnail} className="w-16 h-16 rounded-2xl object-cover shadow-xl" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm">{track.title}</h3>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">{track.artist}</p>
              </div>
              <Play className="opacity-0 group-hover:opacity-100 text-red-600" size={20} fill="currentColor" />
            </div>
          ))}
        </div>
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
              <img src={currentTrack.thumbnail} className={`shadow-2xl transition-all duration-700 ${isPlayerOpen ? 'w-80 h-80 rounded-[4rem]' : 'w-14 h-14 rounded-xl'}`} />
              <div className={`transition-all duration-500 ${isPlayerOpen ? 'text-center' : 'flex-1 min-w-0'}`}>
                <h2 className={`font-black truncate ${isPlayerOpen ? 'text-4xl px-4' : 'text-base'}`}>{currentTrack.title}</h2>
                <p className="text-red-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">{currentTrack.artist}</p>
              </div>
              <button onClick={togglePlay} className={`bg-white text-black rounded-full flex items-center justify-center transition-all ${isPlayerOpen ? 'w-24 h-24 mb-20' : 'w-12 h-12'}`}>
                {isPlaying ? <Pause size={isPlayerOpen ? 40 : 24} fill="black" /> : <Play size={isPlayerOpen ? 40 : 24} fill="black" className="ml-1" />}
              </button>
            </div>
            <div className={`w-full bg-white/5 h-1.5 rounded-full overflow-hidden ${!isPlayerOpen ? 'absolute bottom-0 left-0 h-1' : 'mb-20'}`}>
              <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
