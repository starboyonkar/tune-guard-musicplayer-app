
import React, { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { WaveformData, VisSettings } from '@/lib/types';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, AudioWaveform } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const WaveformAnalyzer: React.FC = () => {
  const { waveformData, playerState, currentSong } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<VisSettings>({
    scale: 1,
    timeScale: 1,
    amplitudeScale: 1,
    showProcessed: true,
    showOriginal: true,
    overlay: true
  });
  
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
      const { seekTo } = useAudio();
      seekTo(seekTime);
    }
  };
  
  const handleScaleChange = (values: number[]) => {
    setSettings(prev => ({ ...prev, scale: values[0] }));
  };
  
  const handleTimeScaleChange = (values: number[]) => {
    setSettings(prev => ({ ...prev, timeScale: values[0] }));
  };
  
  const handleAmplitudeScaleChange = (values: number[]) => {
    setSettings(prev => ({ ...prev, amplitudeScale: values[0] }));
  };
  
  const toggleShowProcessed = () => {
    setSettings(prev => ({ ...prev, showProcessed: !prev.showProcessed }));
  };
  
  const toggleShowOriginal = () => {
    setSettings(prev => ({ ...prev, showOriginal: !prev.showOriginal }));
  };
  
  const toggleOverlay = () => {
    setSettings(prev => ({ ...prev, overlay: !prev.overlay }));
  };
  
  // Draw waveform on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { original, processed } = waveformData;
    const centerY = canvas.height / 2;
    const timeScaleFactor = settings.timeScale;
    const ampScaleFactor = settings.amplitudeScale;
    
    // Draw time position indicator
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.moveTo(canvas.width * timePosition, 0);
    ctx.lineTo(canvas.width * timePosition, canvas.height);
    ctx.stroke();
    
    // Draw original waveform
    if (settings.showOriginal) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
      ctx.lineWidth = 2;
      
      original.forEach((value, i) => {
        const x = (i / original.length) * canvas.width * timeScaleFactor;
        const y = centerY + (value - 0.5) * canvas.height * ampScaleFactor;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
    
    // Draw processed waveform
    if (settings.showProcessed) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
      ctx.lineWidth = 2;
      
      processed.forEach((value, i) => {
        const x = (i / processed.length) * canvas.width * timeScaleFactor;
        const y = centerY + (value - 0.5) * canvas.height * ampScaleFactor;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
  }, [waveformData, settings, timePosition]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Waveform Analysis</h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSettings(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.1) }))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost"
            size="sm" 
            onClick={() => setSettings(prev => ({ ...prev, scale: prev.scale + 0.1 }))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setSettings({
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
      
      <div className="relative bg-gray-900 rounded-lg overflow-hidden h-32">
        <canvas 
          ref={canvasRef}
          width={800}
          height={150}
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
              value={[settings.timeScale]}
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
              value={[settings.amplitudeScale]}
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
              checked={settings.showOriginal} 
              onCheckedChange={toggleShowOriginal} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-processed">Processed</Label>
            <Switch 
              id="show-processed" 
              checked={settings.showProcessed} 
              onCheckedChange={toggleShowProcessed} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="overlay">Overlay</Label>
            <Switch 
              id="overlay" 
              checked={settings.overlay} 
              onCheckedChange={toggleOverlay} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveformAnalyzer;
