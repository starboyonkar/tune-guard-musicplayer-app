
"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ParticleProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  color?: string;
  minSize?: number;
  maxSize?: number;
  minOpacity?: number;
  maxOpacity?: number;
  particleDensity?: number;
  background?: string;
  particleColor?: string;
}

export const SparklesCore = ({
  className,
  background = "transparent",
  minOpacity = 0.5,
  maxOpacity = 1,
  particleColor = "#FFF",
  minSize = 0.5,
  maxSize = 1.5,
  particleDensity = 100,
  ...rest
}: ParticleProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate particles
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    
    // Calculate number of particles based on density and screen size
    const particleCount = Math.floor((containerRect.width * containerRect.height) / (10000 / particleDensity));
    
    // Create particles
    const newParticles = Array(particleCount)
      .fill(null)
      .map(() => ({
        x: Math.random() * containerRect.width,
        y: Math.random() * containerRect.height,
        size: minSize + Math.random() * (maxSize - minSize),
        opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      }));
    
    setParticles(newParticles);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [particleDensity, minSize, maxSize, minOpacity, maxOpacity]);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particles[index].speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particles[index].speedY *= -1;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor}${Math.round(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      });
      
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [particles, particleColor]);
  
  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ background }}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  );
};

export default SparklesCore;
