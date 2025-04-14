
import React from 'react';
import { useAudio } from '@/lib/audioContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Plus, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { soundEffects } from '@/lib/soundEffects';

const SongsList: React.FC = () => {
  const { 
    songs, 
    playerState, 
    playSong,
    currentSong,
    addSong
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

  const handleSongClick = (songId: string) => {
    soundEffects.playTouchFeedback();
    playSong(songId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold neon-text">TUNE GUARD Songs</h3>
        <Button 
          variant="outline"
          className="border-futuristic-border text-futuristic-accent1 hover:bg-futuristic-bg/50"
          onClick={handleFileSelect}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Songs
        </Button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-futuristic-muted">
            <Music className="h-12 w-12 mb-2 opacity-50" />
            <p>No songs added yet. Add your first song to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <Card 
                key={song.id} 
                className={`p-2 hover:bg-futuristic-bg/20 transition-colors cursor-pointer ${
                  currentSong?.id === song.id ? 'border-futuristic-accent1 bg-futuristic-bg/10' : ''
                }`}
                onClick={() => handleSongClick(song.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="h-10 w-10 rounded overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={song.albumArt || "/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png"} 
                        alt="TUNE GUARD"
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-futuristic-muted truncate">{song.artist}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-futuristic-muted mr-3">
                      {formatDuration(song.duration)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-futuristic-accent1/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.playTouchFeedback();
                        playSong(song.id);
                      }}
                    >
                      {currentSong?.id === song.id && playerState.isPlaying ? (
                        <Pause className="h-4 w-4" />
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
