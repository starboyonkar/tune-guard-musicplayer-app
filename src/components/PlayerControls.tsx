
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Mic
} from 'lucide-react';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const PlayerControls: React.FC = () => {
  const { 
    playerState, 
    togglePlayPause, 
    nextSong, 
    prevSong, 
    seekTo, 
    setVolume, 
    toggleMute,
    currentSong,
    isVoiceListening,
    toggleVoiceListening
  } = useAudio();
  
  const { isPlaying, currentTime, volume, isMuted } = playerState;
  
  const handleProgressChange = (newValue: number[]) => {
    seekTo(newValue[0]);
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
  };
  
  return (
    <div className="w-full px-4 py-2">
      {/* Progress slider */}
      <div className="mb-2">
        <Slider
          value={[currentTime]}
          max={currentSong?.duration || 100}
          step={1}
          onValueChange={handleProgressChange}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-futuristic-muted mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentSong?.duration || 0)}</span>
        </div>
      </div>
      
      {/* Main controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={prevSong}
            className="text-futuristic-accent2 hover:text-futuristic-accent1 hover:bg-futuristic-bg"
          >
            <SkipBack />
          </Button>
          
          <Button 
            onClick={togglePlayPause}
            size="icon"
            className="rounded-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90 animate-glow"
          >
            {isPlaying ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={nextSong}
            className="text-futuristic-accent2 hover:text-futuristic-accent1 hover:bg-futuristic-bg"
          >
            <SkipForward />
          </Button>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMute}
            className="text-futuristic-muted hover:text-futuristic-accent1 hover:bg-futuristic-bg"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
          
          <div className="w-24 mx-2">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
          
          <Button 
            variant={isVoiceListening ? "default" : "ghost"}
            size="icon" 
            onClick={toggleVoiceListening}
            className={isVoiceListening 
              ? "bg-futuristic-accent1 text-white hover:bg-futuristic-accent1/90" 
              : "text-futuristic-muted hover:text-futuristic-accent1 hover:bg-futuristic-bg"}
          >
            <Mic className={isVoiceListening ? "animate-pulse" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
