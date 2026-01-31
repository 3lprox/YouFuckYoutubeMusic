import React, { useState, useRef, useEffect } from 'react';
import { PlayerBar } from './components/PlayerBar';
import { Navigation } from './components/Navigation';
import { useDynamicTheme } from './hooks/useDynamicTheme';

export default function App() {
  const [track, setTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const { updateTheme } = useDynamicTheme();

  const loadTrack = async (id: string) => {
    const res = await fetch(`/api/fetch-track?videoId=${id}`);
    const data = await res.json();
    setTrack(data);
    updateTheme(data.thumbnail);
    
    audioRef.current.src = data.streamUrl;
    audioRef.current.play();
    setIsPlaying(true);

    // SponsorBlock Logic
    const sRes = await fetch(`/api/sponsor-block?videoId=${id}`);
    const segments = await sRes.json();
    audioRef.current.ontimeupdate = () => {
      segments.forEach((s: any) => {
        if (audioRef.current.currentTime >= s.segment[0] && audioRef.current.currentTime < s.segment[1]) {
          audioRef.current.currentTime = s.segment[1];
        }
      });
    };
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-medium">Symphony</h1>
        <input 
          placeholder="Pegar Video ID..." 
          className="w-full mt-4 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] outline-none"
          onKeyDown={(e: any) => e.key === 'Enter' && loadTrack(e.target.value)}
        />
      </header>

      {track && (
        <div className="animate-in fade-in zoom-in duration-500">
          <img src={track.thumbnail} className="w-full aspect-square rounded-[32px] shadow-2xl mb-6" />
          <h2 className="text-2xl font-bold">{track.title}</h2>
          <p className="text-lg opacity-80">{track.artist}</p>
        </div>
      )}

      <PlayerBar track={track} isPlaying={isPlaying} onToggle={() => {
        isPlaying ? audioRef.current.pause() : audioRef.current.play();
        setIsPlaying(!isPlaying);
      }} />
      <Navigation />
    </div>
  );
}
