import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CosmicCanvas } from './components/canvas/CosmicCanvas';
import { Navigation } from './components/ui/Navigation';
import { PortfolioOverlay } from './components/ui/PortfolioOverlay';
import { StarCursor } from './components/ui/StarCursor';

import { celestialAudio } from './utils/audioSynthesizer';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Check URL parameters (e.g., ?phase=cruise or ?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('phase') === 'cruise') {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: scrollHeight * 0.65, behavior: 'instant' });
    }
  }, []);

  // Real-time passive scroll tracking for dynamic velocity & pitch shifting
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollHeight)) : 0;
      celestialAudio.updateScroll(window.scrollY, progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // GSAP ScrollTrigger configuration
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8, // silky smooth scrub damping
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        celestialAudio.updateScroll(window.scrollY, self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // Programmatic jump to phase and sync editorial element
  const handleJumpToPhase = useCallback((targetProgress: number, targetId?: string) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = targetProgress * scrollHeight;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020308] text-white selection:bg-slate-400/30 selection:text-white">
      {/* 1. Custom Star Cursor with Particle Trail */}
      <StarCursor />

      {/* 2. Minimal Top Navigation Bar */}
      <Navigation
        onJumpToPhase={handleJumpToPhase}
        scrollProgress={scrollProgress}
      />

      {/* 3. Three.js Particle-Only Canvas Scene (Fixed Background Viewport) */}
      <CosmicCanvas
        scrollProgress={scrollProgress}
        particleDensity="cinematic"
      />

      {/* 4. Synchronized Editorial HTML Portfolio Content */}
      <PortfolioOverlay
        scrollProgress={scrollProgress}
      />

      {/* 5. Virtual Scroll Track for GSAP Scrubbing (550vh depth) */}
      <div
        ref={scrollContainerRef}
        className="relative w-full h-[550vh] pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
