import { useEffect, useRef, useState } from "react";
import type { ConversationState } from "@shared/schema";

interface DottedAvatarProps {
  state: ConversationState;
  audioAmplitude?: number;
}

export function DottedAvatar({ state, audioAmplitude = 0 }: DottedAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const dotsRef = useRef<Array<{ x: number; y: number; size: number; group: string }>>([]);
  const dimensionsRef = useRef<{ width: number; height: number; centerX: number }>({ width: 0, height: 0, centerX: 0 });
  const breathPhaseRef = useRef<number>(0);
  const stateRef = useRef<ConversationState>(state);
  const audioAmplitudeRef = useRef<number>(audioAmplitude);

  // Update refs when props change
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    audioAmplitudeRef.current = audioAmplitude;
  }, [audioAmplitude]);

  // Initialize canvas dimensions and dots array
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initializeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Skip if dimensions aren't ready yet
      if (width === 0 || height === 0) {
        // Retry after layout stabilizes
        setTimeout(initializeCanvas, 50);
        return;
      }

      const centerX = width / 2;

      // Store dimensions FIRST
      dimensionsRef.current = { width, height, centerX };

      // Also initialize canvas size immediately
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

    // Define human figure with dots (only once)
    const dots: Array<{ x: number; y: number; size: number; group: string }> = [];
    
    const dotSize = 5;
    const dotSpacing = 12;

    // Head (circle)
    const headRadius = 40;
    const headCenterY = 80;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
      dots.push({
        x: centerX + Math.cos(angle) * headRadius,
        y: headCenterY + Math.sin(angle) * headRadius,
        size: dotSize,
        group: "head",
      });
    }

    // Mouth area (for lip-sync)
    const mouthY = headCenterY + 20;
    for (let i = -15; i <= 15; i += dotSpacing) {
      dots.push({
        x: centerX + i,
        y: mouthY,
        size: dotSize,
        group: "mouth",
      });
    }

    // Neck
    for (let i = 0; i < 3; i++) {
      dots.push({
        x: centerX,
        y: headCenterY + headRadius + i * dotSpacing,
        size: dotSize,
        group: "neck",
      });
    }

    // Shoulders and torso
    const shoulderY = headCenterY + headRadius + 30;
    const shoulderWidth = 60;
    
    for (let y = shoulderY; y < shoulderY + 80; y += dotSpacing) {
      const w = shoulderWidth - (y - shoulderY) * 0.2;
      for (let x = -w; x <= w; x += dotSpacing) {
        dots.push({
          x: centerX + x,
          y: y,
          size: dotSize,
          group: "torso",
        });
      }
    }

    // Arms
    const armStartY = shoulderY;
    for (let i = 0; i < 6; i++) {
      // Left arm
      dots.push({
        x: centerX - shoulderWidth - i * 8,
        y: armStartY + i * dotSpacing,
        size: dotSize,
        group: "arms",
      });
      // Right arm
      dots.push({
        x: centerX + shoulderWidth + i * 8,
        y: armStartY + i * dotSpacing,
        size: dotSize,
        group: "arms",
      });
    }

      dotsRef.current = dots;

      // Start animation loop immediately after initialization
      startAnimation();
    };

    initializeCanvas();
  }, []); // Only run once on mount

  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Wait for dimensions to be initialized
    if (dimensionsRef.current.width === 0 || dimensionsRef.current.height === 0) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);

    const { width, height, centerX } = dimensionsRef.current;
    const dots = dotsRef.current;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update breath phase using ref
      breathPhaseRef.current = (breathPhaseRef.current + 0.02) % (Math.PI * 2);
      const currentState = stateRef.current;
      const currentAmplitude = audioAmplitudeRef.current;

      // Get colors from CSS variables
      const styles = getComputedStyle(document.documentElement);
      const avatarDotBase = `hsl(${styles.getPropertyValue("--avatar-dot-base")})`;
      const glowListening = `hsl(${styles.getPropertyValue("--avatar-glow-listening")})`;
      const glowProcessing = `hsl(${styles.getPropertyValue("--avatar-glow-processing")})`;
      const glowSpeaking = `hsl(${styles.getPropertyValue("--avatar-glow-speaking")})`;

      // Determine colors and effects based on current state
      let dotColor = avatarDotBase;
      let glowColor = "";
      let glowIntensity = 0;

      switch (currentState) {
        case "listening":
          dotColor = glowListening;
          glowColor = glowListening;
          glowIntensity = 20;
          break;
        case "processing":
          dotColor = glowProcessing;
          glowColor = glowProcessing;
          glowIntensity = 15;
          break;
        case "speaking":
          dotColor = glowSpeaking;
          glowColor = glowSpeaking;
          glowIntensity = 10;
          break;
        default:
          dotColor = avatarDotBase;
      }

      // Draw dots
      dots.forEach((dot) => {
        let x = dot.x;
        let y = dot.y;
        let size = dot.size;

        // Breathing animation for idle state
        if (currentState === "idle") {
          const breathScale = 1 + Math.sin(breathPhaseRef.current) * 0.03;
          const offsetX = (x - centerX) * (breathScale - 1);
          const offsetY = (y - height / 2) * (breathScale - 1);
          x += offsetX;
          y += offsetY;
          size *= 1 + Math.sin(breathPhaseRef.current) * 0.1;
        }

        // Shimmer effect for listening
        if (currentState === "listening") {
          const shimmer = Math.sin(breathPhaseRef.current * 2 + dot.x * 0.1) * 0.3;
          size *= 1 + shimmer;
        }

        // Pulsing for processing
        if (currentState === "processing") {
          const pulse = Math.sin(breathPhaseRef.current * 3) * 0.4;
          size *= 1 + pulse;
        }

        // Lip-sync animation for speaking
        if (currentState === "speaking" && dot.group === "mouth") {
          const mouthMove = currentAmplitude * 8;
          y += Math.sin(breathPhaseRef.current * 4) * mouthMove;
          size *= 1 + currentAmplitude * 0.8;
        }

        // Draw dot with glow
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        
        if (glowIntensity > 0) {
          ctx.shadowBlur = glowIntensity;
          ctx.shadowColor = glowColor;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = dotColor;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center p-8">
      <canvas
        ref={canvasRef}
        className="w-64 h-80 md:w-80 md:h-96 lg:w-96 lg:h-[28rem]"
        style={{ width: "100%", maxWidth: "384px", height: "auto", aspectRatio: "4/5" }}
        data-testid="avatar-canvas"
      />
    </div>
  );
}
