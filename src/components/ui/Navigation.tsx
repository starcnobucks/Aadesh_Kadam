import React, { useState, useRef } from 'react';
import { cosmicAudio } from '../../utils/audioSynthesizer';

interface NavigationProps {
  currentPhaseIndex?: number;
  onJumpToPhase: (progress: number, targetId?: string) => void;
  scrollProgress: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  onJumpToPhase,
  scrollProgress,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const navLinks = [
    { label: 'About', progress: 0.24, min: 0.18, max: 0.35 },
    { label: 'Manifesto', progress: 0.40, min: 0.35, max: 0.52 },
    { label: 'Projects', progress: 0.60, min: 0.52, max: 0.72, id: 'projects' },
    { label: 'Expertise', progress: 0.75, min: 0.72, max: 0.84, id: 'expertise' },
    { label: 'Journey', progress: 0.87, min: 0.84, max: 0.93, id: 'journey' },
    { label: 'Contact', progress: 0.96, min: 0.93, max: 1.0, id: 'contact' },
  ];

  const handleAudioToggle = () => {
    const nextState = cosmicAudio.toggle();
    setIsPlaying(nextState);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-10 py-4 sm:py-5 flex items-center justify-between pointer-events-auto bg-[#020308]/85 backdrop-blur-md border-b border-white/[0.04]">
      {/* Celestial Origin Node */}
      <button
        onClick={() => onJumpToPhase(0)}
        className="text-left group flex items-center focus:outline-none p-1.5 -ml-1.5 rounded-full hover:bg-white/5 transition-colors"
        aria-label="Return to threshold"
        title="Return to threshold"
      >
        <div className="w-2 h-2 rounded-full bg-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.9)] group-hover:scale-125 transition-transform" />
      </button>

      {/* Minimal text-only navigation (NO numbers, NO boxes, NO pills) */}
      <nav
        className="hidden md:flex items-center space-x-6 lg:space-x-8 font-mono-code text-[11px] tracking-[0.2em] uppercase"
        aria-label="Main Navigation"
      >
        {navLinks.map((item) => {
          const isActive = scrollProgress >= item.min && scrollProgress < item.max;
          return (
            <button
              key={item.label}
              onClick={() => onJumpToPhase(item.progress, item.id)}
              className={`relative py-1 transition-all duration-300 focus:outline-none ${
                isActive
                  ? 'text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile navigation links (compact text list) */}
      <nav
        className="flex md:hidden items-center space-x-2.5 font-mono-code text-[9px] tracking-wider uppercase overflow-x-auto py-1 max-w-[190px] no-scrollbar"
        aria-label="Mobile Navigation"
      >
        {navLinks.map((item) => {
          const isActive = scrollProgress >= item.min && scrollProgress < item.max;
          return (
            <button
              key={item.label}
              onClick={() => onJumpToPhase(item.progress, item.id)}
              className={`shrink-0 transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Single music toggle on upper-right with exact clean SVG music icon */}
      <div className="flex items-center">
        <button
          onClick={handleAudioToggle}
          className={`p-2 rounded-full transition-all duration-300 focus:outline-none ${
            isPlaying
              ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.25)] border border-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
          aria-label={isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
          title={isPlaying ? 'Mute ambience' : 'Play ambient voyage sound'}
        >
          <svg
            className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-white' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </button>
      </div>
    </header>
  );
};
