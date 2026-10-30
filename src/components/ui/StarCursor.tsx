import React, { useEffect, useRef } from 'react';

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export const StarCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Accessibility check: touch device or reduced motion
    const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouseX = -100;
    let mouseY = -100;
    let targetX = -100;
    let targetY = -100;
    let isVisible = false;

    const maxParticles = 24;
    const particles: TrailParticle[] = [];

    const handlePointerMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      isVisible = true;

      // Spawn 1-2 delicate trail embers on movement
      if (particles.length < maxParticles && Math.random() < 0.65) {
        particles.push({
          x: targetX + (Math.random() - 0.5) * 4,
          y: targetY + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.2, // slight upward float
          size: 1.0 + Math.random() * 1.5,
          alpha: 0.75,
          maxLife: 28,
          life: 0,
        });
      }
    };

    const handlePointerLeave = () => {
      isVisible = false;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.45;
      mouseY += (targetY - mouseY) * 0.45;

      // Draw particle trail embers
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 0.75 * (1 - p.life / p.maxLife));
        p.size *= 0.96;

        if (p.life >= p.maxLife || p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(180, 220, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw crisp 4-point star cursor
      if (isVisible && mouseX > 0 && mouseY > 0) {
        ctx.save();
        ctx.translate(mouseX, mouseY);

        // Soft center glow
        const glowRad = 10;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRad);
        grad.addColorStop(0, 'rgba(195, 230, 255, 0.85)');
        grad.addColorStop(0.35, 'rgba(120, 185, 255, 0.35)');
        grad.addColorStop(1, 'rgba(100, 170, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // 4-point crisp star geometry
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const armLength = 7.5;
        const innerRad = 1.4;

        ctx.moveTo(0, -armLength);
        ctx.quadraticCurveTo(0, -innerRad, innerRad, 0);
        ctx.lineTo(armLength, 0);
        ctx.quadraticCurveTo(innerRad, 0, 0, innerRad);
        ctx.lineTo(0, armLength);
        ctx.quadraticCurveTo(0, innerRad, -innerRad, 0);
        ctx.lineTo(-armLength, 0);
        ctx.quadraticCurveTo(-innerRad, 0, 0, -innerRad);
        ctx.closePath();
        ctx.fill();

        // Core bright spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      aria-hidden="true"
    />
  );
};
