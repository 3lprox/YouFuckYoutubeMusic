import React from 'react';

interface TrackCardProps {
  title: string;
  artist: string;
  thumbnail: string;
}

export const TrackCard = ({ title, artist, thumbnail }: TrackCardProps) => {
  return (
    <div className="bg-[var(--md-sys-color-surface-container-high)] p-4 rounded-[32px] transition-all duration-500 ease-in-out shadow-md">
      <img 
        src={thumbnail} 
        alt={title} 
        className="w-full aspect-square object-cover rounded-[24px] mb-4 shadow-xl"
      />
      <div className="px-2">
        <h3 className="text-[var(--md-sys-color-on-surface)] text-xl font-bold truncate">{title}</h3>
        <p className="text-[var(--md-sys-color-on-surface-variant)] text-md opacity-80">{artist}</p>
      </div>
    </div>
  );
};
