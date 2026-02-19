'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStoryStore } from '@/lib/store';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: 0 | 1 | 2;
  isGold: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
}

const DENSITY_MAP: Record<string, number> = {
  sparse: 30,
  medium: 60,
  dense: 100,
};

const LAYER_DRIFT_SPEED = [0.1, 0.3, 0.5]; // px/s for back, mid, front

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      radius: 0.5 + Math.random() * 1.5,
      baseOpacity: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.005 + Math.random() * 0.02,
      twinklePhase: Math.random() * Math.PI * 2,
      layer: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
      isGold: Math.random() < 0.2,
    });
  }
  return stars;
}

function createShootingStar(canvasWidth: number, canvasHeight: number): ShootingStar {
  const angle = (30 + Math.random() * 15) * (Math.PI / 180);
  return {
    x: Math.random() * canvasWidth * 0.8,
    y: Math.random() * canvasHeight * 0.3,
    length: 40 + Math.random() * 40,
    speed: 300 + Math.random() * 200,
    angle,
    opacity: 1,
    life: 0,
  };
}

function parseOklch(value: string): string {
  // CSS computed values may return oklch() or rgb(); return as-is for canvas
  // Canvas doesn't natively support oklch, so we'll fall back to defaults
  return value;
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starDensity = useStoryStore((s) => s.starDensity);
  const starDepth = useStoryStore((s) => s.starDepth);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const shootingStarAccRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const layerOffsetsRef = useRef([0, 0, 0]);

  const getSkyColors = useCallback(() => {
    const style = getComputedStyle(document.documentElement);
    const skyTop = style.getPropertyValue('--color-sky-top').trim();
    const skyBottom = style.getPropertyValue('--color-sky-bottom').trim();
    return { skyTop, skyBottom };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars
    const count = DENSITY_MAP[starDensity] || 60;
    starsRef.current = generateStars(count);
    shootingStarsRef.current = [];
    shootingStarAccRef.current = 0;
    lastTimeRef.current = performance.now();
    layerOffsetsRef.current = [0, 0, 0];

    const animate = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1); // cap delta to avoid jumps
      lastTimeRef.current = timestamp;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw sky gradient
      // Use fallback colors since canvas can't render oklch directly
      // We'll draw a gradient that approximates the theme sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
      // Read CSS custom properties as computed rgb values
      const { skyTop, skyBottom } = getSkyColors();

      // Try to use computed values, but oklch may not resolve in getComputedStyle for custom props
      // Use known fallback for dark mystical theme
      try {
        skyGradient.addColorStop(0, skyTop || 'rgb(10, 8, 30)');
        skyGradient.addColorStop(1, skyBottom || 'rgb(25, 18, 50)');
      } catch {
        // oklch not supported in canvas gradient - use fallback
        skyGradient.addColorStop(0, 'rgb(10, 8, 30)');
        skyGradient.addColorStop(1, 'rgb(25, 18, 50)');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h);

      // Update parallax offsets
      if (starDepth === 'parallax') {
        for (let i = 0; i < 3; i++) {
          layerOffsetsRef.current[i] =
            (layerOffsetsRef.current[i] + LAYER_DRIFT_SPEED[i] * dt) % w;
        }
      }

      // Draw stars
      const time = timestamp / 1000;
      for (const star of starsRef.current) {
        const opacity =
          star.baseOpacity *
          (0.5 + 0.5 * Math.sin(star.twinklePhase + time * star.twinkleSpeed));

        let sx = star.x * w;
        const sy = star.y * h;

        // Apply parallax offset
        if (starDepth === 'parallax') {
          sx = (sx + layerOffsetsRef.current[star.layer]) % w;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        if (star.isGold) {
          ctx.fillStyle = `rgba(255, 215, 100, ${opacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        }
        ctx.fill();
      }

      // Shooting stars
      shootingStarAccRef.current += dt;
      // Average 1 every 5 seconds
      if (shootingStarAccRef.current > 5 && Math.random() < dt * 0.5) {
        if (shootingStarsRef.current.length < 3) {
          shootingStarsRef.current.push(createShootingStar(w, h));
        }
        shootingStarAccRef.current = 0;
      }

      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        ss.life += dt * 0.8;
        if (ss.life >= 1) return false;

        const progress = ss.life;
        ss.opacity = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;

        const cx = ss.x + Math.cos(ss.angle) * ss.speed * ss.life;
        const cy = ss.y + Math.sin(ss.angle) * ss.speed * ss.life;

        // Draw trail
        const tailX = cx - Math.cos(ss.angle) * ss.length;
        const tailY = cy - Math.sin(ss.angle) * ss.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, cx, cy);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
        ctx.fill();

        return true;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [starDensity, starDepth, getSkyColors]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
