
import React from 'react';
import { useAudio } from '@/lib/audioContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Plus, Music, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { soundEffects } from '@/lib/soundEffects';

const SongsList: React.FC = () => {
  const { 
    songs, 
    playerState, 
    playSong,
    currentSong,
    addSong,
    toggleShuffle,
    toggleRepeat
  } = useAudio();

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle file selection for adding new songs
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/mpeg, .mp3';
    input.multiple = true;
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          if (file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
            addSong(file);
          }
        });
      }
    };
    
    soundEffects.playTouchFeedback();
    input.click();
  };

  // Enhanced song click handler to toggle play/pause
  const handleSongClick = (songId: string) => {
    soundEffects.playTouchFeedback();
    
    // If the song is already playing, pause it; if it's paused, resume it; otherwise play a new song
    if (currentSong?.id === songId) {
      playSong(songId); // This will toggle play/pause for the current song
    } else {
      // Play a new song
      playSong(songId);
    }
  };

  return (
    <div className="space-y-4 relative glass-panel">
      {/* Animated scan line effect */}
      <div className="scan-line absolute"></div>
      
      <div className="flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center">
          <h3 className="text-lg font-bold neon-text">TUNE GUARD Songs</h3>
          
          {/* Shuffle & Repeat controls */}
          <div className="ml-4 flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleShuffle}
              className={`h-8 w-8 rounded-full transition-colors ${
                playerState.shuffleEnabled ? 'text-futuristic-accent1 hover:bg-futuristic-accent1/20' : 'text-futuristic-muted hover:bg-futuristic-bg/30'
              }`}
              title={playerState.shuffleEnabled ? "Shuffle Enabled" : "Shuffle Disabled"}
            >
              <Shuffle className={`h-4 w-4 ${playerState.shuffleEnabled ? 'neon-glow' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleRepeat}
              className={`h-8 w-8 rounded-full transition-colors ${
                playerState.repeatMode !== 'off' ? 'text-futuristic-accent1 hover:bg-futuristic-accent1/20' : 'text-futuristic-muted hover:bg-futuristic-bg/30'
              }`}
              title={`Repeat: ${playerState.repeatMode}`}
            >
              {playerState.repeatMode === 'one' ? (
                <Repeat1 className="h-4 w-4 neon-glow" aria-label="Repeat One" />
              ) : (
                <Repeat className={`h-4 w-4 ${playerState.repeatMode === 'all' ? 'neon-glow' : ''}`} aria-label={`Repeat ${playerState.repeatMode === 'all' ? 'All' : 'Off'}`} />
              )}
            </Button>
          </div>
        </div>
        
        <Button 
          variant="outline"
          className="border-futuristic-border text-futuristic-accent1 hover:bg-futuristic-bg/50 animate-pulse-slow"
          onClick={handleFileSelect}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Songs
        </Button>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-futuristic-muted glass-panel rounded-lg">
            <Music className="h-12 w-12 mb-2 opacity-50 animate-pulse-slow" />
            <p className="font-bold">No songs added yet. Add your first song to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <Card 
                key={song.id} 
                className={`p-2 transition-all duration-300 cursor-pointer glass-element ${
                  currentSong?.id === song.id 
                    ? 'border-futuristic-accent1 bg-futuristic-bg/30 neon-border' 
                    : 'hover:bg-futuristic-bg/20 hover:scale-[1.02]'
                }`}
                onClick={() => handleSongClick(song.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`h-10 w-10 rounded overflow-hidden mr-3 flex-shrink-0 ${
                      currentSong?.id === song.id && playerState.isPlaying ? 'animate-pulse-slow animate-glow' : ''
                    }`}>
                      <img 
                        src={song.albumArt || "/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png"} 
                        alt="TUNE GUARD"
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className={`font-bold truncate ${currentSong?.id === song.id ? 'neon-text' : ''}`}>
                        {song.title}
                      </p>
                      <p className="text-sm text-futuristic-muted truncate">{song.artist}</p>
                      
                      {/* Progress bar for currently playing song */}
                      {currentSong?.id === song.id && (
                        <div className="w-full bg-futuristic-bg/30 h-1 rounded-full mt-1">
                          <div 
                            className="h-1 bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 rounded-full" 
                            style={{ width: `${(playerState.currentTime / (currentSong?.duration || 1)) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-futuristic-muted mr-3">
                      {formatDuration(song.duration)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 rounded-full transition-colors ${
                        currentSong?.id === song.id ? 'hover:bg-futuristic-accent1/40' : 'hover:bg-futuristic-accent2/20'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.playTouchFeedback();
                        playSong(song.id);
                      }}
                    >
                      {currentSong?.id === song.id && playerState.isPlaying ? (
                        <Pause className="h-4 w-4 text-futuristic-accent1" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongsList;
