import { useState, useRef } from 'react';

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const currentVideoId = useRef<string | null>(null);

  const playTrack = async (streamUrl: string, videoId: string) => {
    if (currentVideoId.current === videoId) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    currentVideoId.current = videoId;
    audioRef.current.src = streamUrl;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return { audioRef, isPlaying, playTrack, togglePlay };
};
