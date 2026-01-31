import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

export const PlayerBar = ({ track, isPlaying, onToggle }: any) => (
  <div className="fixed bottom-20 left-4 right-4 bg-[var(--md-sys-color-surface-container-high)] p-4 rounded-[28px] flex items-center justify-between shadow-lg">
    <div className="flex items-center gap-3">
      <img src={track?.thumbnail} className="w-12 h-12 rounded-xl" />
      <div>
        <div className="text-sm font-bold truncate w-32">{track?.title}</div>
        <div className="text-xs opacity-70">{track?.artist}</div>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <SkipBack size={24} />
      <button onClick={onToggle} className="bg-[var(--md-sys-color-primary-container)] p-3 rounded-2xl">
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <SkipForward size={24} />
    </div>
  </div>
);
