
import React, { useRef, useEffect } from 'react';
import { useAudio } from '@/lib/audioContext';

interface WaveformProps {
  className?: string;
}

const Waveform: React.FC<WaveformProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { waveformData, visSettings } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Ensure we have valid array data
    const originalData = Array.isArray(waveformData.original) ? waveformData.original : [];
    const processedData = Array.isArray(waveformData.processed) ? waveformData.processed : [];

    if (originalData.length === 0 && processedData.length === 0) {
      // Draw placeholder when no data
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();
      return;
    }

    const drawWaveform = (data: number[], color: string, alpha: number = 1) => {
      if (!Array.isArray(data) || data.length === 0) return;

      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const barWidth = rect.width / data.length;
      
      data.forEach((value, index) => {
        const normalizedValue = Math.max(-1, Math.min(1, value || 0));
        const barHeight = (normalizedValue * rect.height * 0.4 * visSettings.scale);
        const x = index * barWidth;
        const y = rect.height / 2;

        if (index === 0) {
          ctx.moveTo(x, y + barHeight);
        } else {
          ctx.lineTo(x, y + barHeight);
        }
      });

      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // Draw original waveform
    if (visSettings.showOriginal && originalData.length > 0) {
      drawWaveform(originalData, '#00ffff', 0.6);
    }

    // Draw processed waveform
    if (visSettings.showProcessed && processedData.length > 0) {
      drawWaveform(processedData, '#ff6b00', 0.8);
    }

  }, [waveformData, visSettings]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
      <div className="absolute top-2 right-2 text-xs text-futuristic-muted">
        <div className="flex space-x-2">
          {visSettings.showOriginal && (
            <span className="flex items-center">
              <div className="w-3 h-1 bg-cyan-400 mr-1"></div>
              Original
            </span>
          )}
          {visSettings.showProcessed && (
            <span className="flex items-center">
              <div className="w-3 h-1 bg-orange-400 mr-1"></div>
              Processed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Waveform;
