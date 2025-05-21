
import React, { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { WaveformData, VisSettings } from '@/lib/types';
import { ZoomIn, ZoomOut, Maximize2, AudioWaveform } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const WaveformAnalyzer: React.FC = () => {
  const { waveformData, playerState, currentSong, seekTo, visSettings, setVisSettings } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [timePosition, setTimePosition] = useState<number>(0);
  
  // Effect for time position based on current playback time
  useEffect(() => {
    if (playerState.isPlaying && currentSong) {
      setTimePosition(playerState.currentTime / currentSong.duration);
    }
  }, [playerState.currentTime, currentSong, playerState.isPlaying]);
  
  // Manual time position change handler
  const handleTimePositionChange = (values: number[]) => {
    const newPosition = values[0];
    setTimePosition(newPosition);
    
    // If we have a current song, seek to that position
    if (currentSong) {
      const seekTime = currentSong.duration * newPosition;
      seekTo(seekTime);
    }
  };
  
  const handleScaleChange = (values: number[]) => {
    setVisSettings({ scale: values[0] });
  };
  
  const handleTimeScaleChange = (values: number[]) => {
    setVisSettings({ timeScale: values[0] });
  };
  
  const handleAmplitudeScaleChange = (values: number[]) => {
    setVisSettings({ amplitudeScale: values[0] });
  };
  
  const toggleShowProcessed = () => {
    setVisSettings({ showProcessed: !visSettings.showProcessed });
  };
  
  const toggleShowOriginal = () => {
    setVisSettings({ showOriginal: !visSettings.showOriginal });
  };
  
  const toggleOverlay = () => {
    setVisSettings({ overlay: !visSettings.overlay });
  };
  
  // Draw waveform on canvas with accurate amplitude vs. time representation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { original, processed, timeData } = waveformData;
    const centerY = canvas.height / 2;
    const timeScaleFactor = visSettings.timeScale;
    const ampScaleFactor = visSettings.amplitudeScale;
    
    // Draw dark background with grid
    ctx.fillStyle = "rgba(17, 24, 39, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw axis labels and grid
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw horizontal center line (amplitude = 0)
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw amplitude grid lines
    const amplitudeLines = 4; // Number of lines above and below center
    const amplitudeStep = canvas.height / (2 * amplitudeLines);
    
    for (let i = 1; i <= amplitudeLines; i++) {
      // Lines above center (positive amplitude)
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(0, centerY - i * amplitudeStep);
      ctx.lineTo(canvas.width, centerY - i * amplitudeStep);
      ctx.stroke();
      
      // Lines below center (negative amplitude)
      ctx.beginPath();
      ctx.moveTo(0, centerY + i * amplitudeStep);
      ctx.lineTo(canvas.width, centerY + i * amplitudeStep);
      ctx.stroke();
    }
    
    // Draw vertical time markers
    const timeLines = 10;
    for (let i = 0; i <= timeLines; i++) {
      const x = (canvas.width / timeLines) * i;
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw axis labels
    ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
    ctx.font = '10px Arial';
    
    // Time labels (in milliseconds)
    ctx.textAlign = 'center';
    const maxTimeMs = timeData && Array.isArray(timeData) && timeData.length > 0 
      ? Math.max(...timeData) 
      : 1000;
      
    for (let i = 0; i <= timeLines; i++) {
      const x = (canvas.width / timeLines) * i;
      const timeMs = (i / timeLines) * maxTimeMs * timeScaleFactor;
      ctx.fillText(`${Math.round(timeMs)} ms`, x, canvas.height - 5);
    }
    
    // Amplitude labels (-1 to 1 range)
    ctx.textAlign = 'right';
    for (let i = -amplitudeLines; i <= amplitudeLines; i++) {
      const y = centerY - i * amplitudeStep;
      const amplitude = i / amplitudeLines;
      if (i !== 0) { // Skip zero since we already have the center line
        ctx.fillText(amplitude.toFixed(1), 20, y + 4);
      } else {
        ctx.fillText('0.0', 20, y + 4);
      }
    }
    
    // X-Axis Label - "Time (ms)"
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
    ctx.fillText('Time (ms)', canvas.width / 2, canvas.height - 20);
    
    // Y-Axis Label - "Amplitude"
    ctx.save();
    ctx.translate(10, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitude', 0, 0);
    ctx.restore();
    
    // Draw time position indicator
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.moveTo(canvas.width * timePosition, 0);
    ctx.lineTo(canvas.width * timePosition, canvas.height);
    ctx.stroke();
    
    // Draw original waveform
    if (visSettings.showOriginal && original && original instanceof Uint8Array && original.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
      ctx.lineWidth = 2;
      
      // Plot points with proper time and amplitude scaling
      for (let i = 0; i < original.length; i++) {
        // Scale x position based on relative time
        const relativeTimePosition = i / original.length;
        const x = relativeTimePosition * canvas.width * timeScaleFactor;
        
        // Scale y position based on amplitude (-1 to 1)
        const y = centerY - (original[i] * (canvas.height / 2) * ampScaleFactor);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
    
    // Draw processed waveform
    if (visSettings.showProcessed && processed && processed instanceof Uint8Array && processed.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
      ctx.lineWidth = 2;
      
      // Plot points with proper time and amplitude scaling
      for (let i = 0; i < processed.length; i++) {
        // Scale x position based on relative time
        const relativeTimePosition = i / processed.length;
        const x = relativeTimePosition * canvas.width * timeScaleFactor;
        
        // Scale y position based on amplitude (-1 to 1)
        const y = centerY - (processed[i] * (canvas.height / 2) * ampScaleFactor);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
    
    // Add legend
    if (visSettings.showOriginal || visSettings.showProcessed) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(canvas.width - 120, 10, 110, visSettings.showOriginal && visSettings.showProcessed ? 50 : 30);
      
      if (visSettings.showOriginal) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.moveTo(canvas.width - 110, 20);
        ctx.lineTo(canvas.width - 70, 20);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'left';
        ctx.fillText('Original', canvas.width - 65, 24);
      }
      
      if (visSettings.showProcessed) {
        const y = visSettings.showOriginal ? 40 : 20;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
        ctx.lineWidth = 2;
        ctx.moveTo(canvas.width - 110, y);
        ctx.lineTo(canvas.width - 70, y);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'left';
        ctx.fillText('Processed', canvas.width - 65, y + 4);
      }
    }
  }, [waveformData, visSettings, timePosition]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Waveform Analysis - Amplitude vs Time</h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setVisSettings({ scale: Math.max(visSettings.scale - 0.1, 0.1) })}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost"
            size="sm" 
            onClick={() => setVisSettings({ scale: visSettings.scale + 0.1 })}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setVisSettings({
              scale: 1,
              timeScale: 1,
              amplitudeScale: 1,
              showProcessed: true,
              showOriginal: true,
              overlay: true
            })}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative bg-gray-900 rounded-lg overflow-hidden h-48">
        <canvas 
          ref={canvasRef}
          width={800}
          height={250}
          className="w-full h-full"
        />
        
        {!playerState.isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <AudioWaveform className="h-10 w-10 text-gray-500 opacity-50" />
          </div>
        )}
      </div>
      
      <div className="py-2">
        <Slider
          value={[timePosition]}
          min={0}
          max={1}
          step={0.001}
          onValueChange={handleTimePositionChange}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0:00</span>
          <span>{currentSong ? `${Math.floor(currentSong.duration / 60)}:${String(currentSong.duration % 60).padStart(2, '0')}` : '0:00'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="time-scale">Time Scale</Label>
            <Slider
              id="time-scale"
              className="w-32"
              value={[visSettings.timeScale]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={handleTimeScaleChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="amp-scale">Amplitude</Label>
            <Slider
              id="amp-scale"
              className="w-32"
              value={[visSettings.amplitudeScale]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={handleAmplitudeScaleChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-original">Original</Label>
            <Switch 
              id="show-original" 
              checked={visSettings.showOriginal} 
              onCheckedChange={toggleShowOriginal} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-processed">Processed</Label>
            <Switch 
              id="show-processed" 
              checked={visSettings.showProcessed} 
              onCheckedChange={toggleShowProcessed} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="overlay">Overlay</Label>
            <Switch 
              id="overlay" 
              checked={visSettings.overlay} 
              onCheckedChange={toggleOverlay} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveformAnalyzer;
