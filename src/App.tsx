import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Search, Music2, Loader2, ChevronDown, AlertCircle, Zap, Terminal } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function App() {
  const [query, setQuery] = useState('');
  const [directId, setDirectId] = useState('');
  const [results, setResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<any>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('symphony-engine', {
        height: '1',
        width: '1',
        videoId: '',
        playerVars: { 
          'controls': 0, 
          'disablekb': 1, 
          'modestbranding': 1,
          'playsinline': 1
        },
        events: {
          'onStateChange': (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            else setIsPlaying(false);
          }
        }
      });
    };

    return () => clearInterval(progressInterval.current);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
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
    try {
      const res = await fetch(`/api/fetch-track?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playDirectId = () => {
    if (!directId || !playerRef.current) return;
    const track = {
      videoId: directId,
      title: `ID: ${directId}`,
      artist: "Direct Stream",
      thumbnail: `https://img.youtube.com/vi/${directId}/maxresdefault.jpg`
    };
    setCurrentTrack(track);
    setIsPlayerOpen(true);
    playerRef.current.loadVideoById(directId);
    playerRef.current.playVideo();
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
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#eee] font-sans">
      <div id="symphony-engine" className="fixed -top-[1000px] opacity-0 pointer-events-none"></div>

      <nav className="p-4 sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-red-600 tracking-tighter italic">SYMPHONY</h1>
            <div className="relative flex-1">
              <input 
                className="w-full bg-[#111] rounded-xl py-2.5 px-6 outline-none focus:ring-1 focus:ring-red-600 text-sm"
                placeholder="Search music..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchTracks()}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-red-600/10 p-2 rounded-xl border border-red-600/20">
            <Terminal size={16} className="text-red-600 ml-2" />
            <input 
              className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-red-500 placeholder:text-red-900"
              placeholder="PASTE VIDEO ID HERE (e.g. j6YpC8I2T8k)"
              value={directId}
              onChange={(e) => setDirectId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && playDirectId()}
            />
            <button onClick={playDirectId} className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-widest">Load</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((track: any, i) => (
            <div key={i} onClick={() => selectTrack(track)} className="flex items-center gap-4 p-3 bg-[#0d0d0d] hover:bg-[#151515] rounded-2xl border border-white/5 cursor-pointer transition-all active:scale-95 group">
              <img src={track.thumbnail} className="w-14 h-14 rounded-xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm">{track.title}</h3>
                <p className="text-gray-500 text-[10px] uppercase mt-1">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-red-600" size={30} />
          </div>
        )}
      </main>

      {currentTrack && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${isPlayerOpen ? 'h-full bg-[#050505]' : 'h-24 bg-[#0a0a0a] border-t border-white/10'}`}>
          <div className={`max-w-5xl mx-auto h-full flex flex-col px-6 ${isPlayerOpen ? 'pt-12' : 'justify-center'}`}>
            {isPlayerOpen && (
              <button onClick={() => setIsPlayerOpen(false)} className="mb-10 self-start p-2"><ChevronDown size={32} /></button>
            )}

            <div className={`flex items-center ${isPlayerOpen ? 'flex-col gap-10 flex-1 justify-center' : 'flex-row gap-4'}`}>
              <img src={currentTrack.thumbnail} className={`shadow-2xl transition-all duration-700 ${isPlayerOpen ? 'w-72 h-72 rounded-[3rem]' : 'w-14 h-14 rounded-xl'}`} />
              <div className={`transition-all duration-500 ${isPlayerOpen ? 'text-center' : 'flex-1 min-w-0'}`}>
                <h2 className={`font-black truncate ${isPlayerOpen ? 'text-3xl px-4' : 'text-base'}`}>{currentTrack.title}</h2>
                <p className="text-red-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">{currentTrack.artist}</p>
              </div>
              <button onClick={togglePlay} className={`bg-white text-black rounded-full flex items-center justify-center transition-all ${isPlayerOpen ? 'w-20 h-20 mb-20' : 'w-12 h-12'}`}>
                {isPlaying ? <Pause size={isPlayerOpen ? 32 : 20} fill="black" /> : <Play size={isPlayerOpen ? 32 : 20} fill="black" className="ml-1" />}
              </button>
            </div>
            <div className={`w-full bg-white/5 h-1 rounded-full overflow-hidden ${!isPlayerOpen ? 'absolute bottom-0 left-0' : 'mb-20'}`}>
              <div className="bg-red-600 h-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
