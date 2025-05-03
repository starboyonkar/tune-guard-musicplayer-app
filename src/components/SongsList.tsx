import React from 'react';
import { useAudio } from '@/lib/audioContext';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const SongsList: React.FC = () => {
  const { songs, playerState, playSong } = useAudio();
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Songs</h3>
      <ScrollArea className="h-[300px] w-full rounded-md border">
        <div className="p-4">
          {songs.map((song) => (
            <div 
              key={song.id} 
              className="flex items-center justify-between py-2 border-b border-futuristic-border last:border-none"
            >
              <div>
                <p className="text-sm font-medium">{song.title}</p>
                <p className="text-xs text-futuristic-muted">{song.artist}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => playSong(song.id)}
                className="h-8 w-8"
                aria-label={playerState.currentSongId === song.id && playerState.isPlaying ? "Pause" : "Play"}
              >
                {playerState.currentSongId === song.id && playerState.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SongsList;
