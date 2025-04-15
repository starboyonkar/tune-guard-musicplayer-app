import React, { useState } from 'react';
import { ChevronUp, Music3, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useAudio } from '@/lib/audioContext';
import { soundEffects } from '@/lib/soundEffects';
import { cn } from '@/lib/utils';

const SongsList: React.FC = () => {
  const { songs, currentSong, playSong } = useAudio();
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const toggleExpand = () => {
    soundEffects.playTouchFeedback();
    setIsExpanded(!isExpanded);
  };
  
  const toggleViewMode = () => {
    soundEffects.playTouchFeedback();
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };
  
  const handleSongSelect = (songId: string) => {
    soundEffects.playTouchFeedback();
    playSong(songId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Toggle 
            variant="outline" 
            size="sm" 
            aria-label="Grid View"
            onPressedChange={toggleViewMode}
          >
            {viewMode === 'grid' 
              ? <Grid 
                  className="h-4 w-4" 
                  aria-label="Grid View"
                /> 
              : <List 
                  className="h-4 w-4" 
                  aria-label="List View"
                />
            }
          </Toggle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleExpand}
          className="text-xs flex items-center"
        >
          {isExpanded ? 'Show Less' : 'Show All'}
          <ChevronUp className={cn(
            "h-4 w-4 ml-1 transition-transform",
            isExpanded ? "rotate-0" : "rotate-180"
          )} />
        </Button>
      </div>
      
      <div className={cn(
        "grid gap-2 transition-all duration-300",
        viewMode === 'grid' 
          ? "grid-cols-2 sm:grid-cols-3" 
          : "grid-cols-1",
        !isExpanded && "max-h-[300px] overflow-hidden"
      )}>
        {songs.map((song) => (
          <div 
            key={song.id}
            onClick={() => handleSongSelect(song.id)}
            className={cn(
              "p-3 rounded-md cursor-pointer transition-all",
              "border border-futuristic-border hover:border-futuristic-accent1",
              "bg-futuristic-bg/30 hover:bg-futuristic-bg/50",
              currentSong?.id === song.id && "border-futuristic-accent1 bg-futuristic-bg/70"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-futuristic-accent2/20 flex items-center justify-center">
                <Music3 className="h-4 w-4 text-futuristic-accent1" />
              </div>
              <div>
                <div className="font-medium text-sm">{song.title}</div>
                <div className="text-xs text-futuristic-muted">{song.artist}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongsList;
