const selectTrack = async (track: any) => {
  setLoading(true);
  setError(null);
  
  const attemptFetch = async () => {
    const res = await fetch(`/api/fetch-track?videoId=${track.videoId}`);
    if (!res.ok) throw new Error("Nodes Exhausted");
    return await res.json();
  };

  try {
    let data;
    try {
      data = await attemptFetch();
    } catch (e) {
      data = await attemptFetch();
    }
    
    setCurrentTrack(data);
    setIsPlayerOpen(true);
    setTimeout(() => {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    }, 300);
  } catch (err: any) {
    setError("All 500 nodes are currently rate-limited. Try a different track.");
  } finally {
    setLoading(false);
  }
};
