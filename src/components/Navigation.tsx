import { Home, Search, Library } from 'lucide-react';

export const Navigation = () => (
  <nav className="fixed bottom-0 w-full bg-[var(--md-sys-color-surface)] h-20 flex justify-around items-center border-t border-[var(--md-sys-color-outline-variant)]">
    <div className="flex flex-col items-center text-[var(--md-sys-color-primary)]">
      <div className="bg-[var(--md-sys-color-secondary-container)] px-5 py-1 rounded-full"><Home size={24} /></div>
      <span className="text-xs mt-1">Home</span>
    </div>
    <div className="flex flex-col items-center opacity-70"><Search size={24} /><span className="text-xs mt-1">Search</span></div>
    <div className="flex flex-col items-center opacity-70"><Library size={24} /><span className="text-xs mt-1">Library</span></div>
  </nav>
);
