
import React, { useRef, useEffect } from 'react';
import { useAudio } from '@/lib/audioContext';

const Waveform: React.FC = () => {
  const { waveformData, playerState } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw waveform on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { processed } = waveformData;
    
    // Set up styles
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 100, 255, 0.2)');
    
    // Draw processed waveform
    ctx.beginPath();
    ctx.strokeStyle = playerState.isPlaying ? gradient : 'rgba(100, 100, 100, 0.3)';
    
    const barWidth = canvas.width / processed.length;
    const centerY = canvas.height / 2;
    
    processed.forEach((value, i) => {
      const x = i * barWidth;
      // Exaggerate the visual effect for better visuals
      const barHeight = value * canvas.height * 0.8; 
      
      ctx.moveTo(x, centerY - barHeight / 2);
      ctx.lineTo(x, centerY + barHeight / 2);
    });
    
    ctx.stroke();
    
    // Add glow effect when playing
    if (playerState.isPlaying) {
      ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
      ctx.shadowBlur = 10;
    }
    
  }, [waveformData, playerState.isPlaying]);
  
  return (
    <div className="flex items-end justify-center h-24 gap-[1px] px-4 mb-2 relative">
      <canvas 
        ref={canvasRef}
        width={800}
        height={150}
        className="w-full h-full absolute top-0 left-0"
      />
      
      {/* Static bars for visual effect when not playing */}
      {!playerState.isPlaying && Array.from(waveformData.processed).map((height, index) => (
        <div
          key={index}
          style={{ height: `${(height / 255) * 100}%` }}
          className="waveform-bar w-[2px] bg-gray-500/20"
        />
      ))}
    </div>
  );
};

export default Waveform;
