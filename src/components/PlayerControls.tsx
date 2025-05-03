
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Mic, Shuffle, Repeat, Repeat1
} from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import { formatTime } from '@/lib/utils';

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
    toggleVoiceListening,
    toggleShuffle,
    toggleRepeat
  } = useAudio();
  
  const { isPlaying, currentTime, volume, isMuted, shuffleEnabled, repeatMode } = playerState;
  
  const handleProgressChange = (newValue: number[]) => {
    seekTo(newValue[0]);
  };
  
  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
  };

  const handlePlayPause = () => {
    soundEffects.playTouchFeedback();
    togglePlayPause();
  };

  const handleNext = () => {
    soundEffects.playTouchFeedback();
    nextSong();
  };

  const handlePrev = () => {
    soundEffects.playTouchFeedback();
    prevSong();
  };

  const handleToggleMute = () => {
    soundEffects.playTouchFeedback();
    toggleMute();
  };

  const handleToggleVoice = () => {
    soundEffects.playNotification();
    toggleVoiceListening();
  };

  const handleToggleShuffle = () => {
    soundEffects.playTouchFeedback();
    toggleShuffle();
  };

  const handleToggleRepeat = () => {
    soundEffects.playTouchFeedback();
    toggleRepeat();
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
        <div className="flex items-center space-x-2">
          {/* Shuffle button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleShuffle}
            className={`text-futuristic-muted hover:text-futuristic-accent1 hover:bg-futuristic-bg ${
              shuffleEnabled ? 'text-futuristic-accent1' : ''
            }`}
            title={shuffleEnabled ? "Shuffle Enabled" : "Shuffle Disabled"}
          >
            <Shuffle className={`h-4 w-4 ${shuffleEnabled ? 'neon-glow' : ''}`} />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrev}
            className="text-futuristic-accent2 hover:text-futuristic-accent1 hover:bg-futuristic-bg"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handlePlayPause}
            size="icon"
            className="rounded-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90 animate-glow h-12 w-12"
          >
            {isPlaying ? <Pause fill="white" className="h-5 w-5" /> : <Play fill="white" className="ml-1 h-5 w-5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleNext}
            className="text-futuristic-accent2 hover:text-futuristic-accent1 hover:bg-futuristic-bg"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          {/* Repeat button with tooltip */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleRepeat}
            className={`text-futuristic-muted hover:text-futuristic-accent1 hover:bg-futuristic-bg ${
              repeatMode !== 'off' ? 'text-futuristic-accent1' : ''
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="h-4 w-4 neon-glow" />
            ) : (
              <Repeat className={`h-4 w-4 ${repeatMode === 'all' ? 'neon-glow' : ''}`} />
            )}
          </Button>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleMute}
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
          
          {/* Voice control icon - made more prominent */}
          <Button 
            variant={isVoiceListening ? "default" : "outline"}
            size="icon" 
            onClick={handleToggleVoice}
            className={isVoiceListening 
              ? "bg-futuristic-accent1 text-white hover:bg-futuristic-accent1/90 relative" 
              : "text-futuristic-muted hover:text-futuristic-accent1 hover:bg-futuristic-accent1/20 border-futuristic-accent2"}
            title={isVoiceListening ? "Voice Control Active" : "Enable Voice Control"}
          >
            <Mic className={isVoiceListening ? "animate-pulse" : ""} />
            {isVoiceListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
