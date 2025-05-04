
import React, { useState } from 'react';
import { Play, Pause, Plus, MoreVertical } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAudio } from '@/lib/audioContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const SongsList = () => {
  const { songs, playSong, currentSong, playerState, playlists, addToPlaylist } = useAudio();
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  
  // Handle showing of dropdown menu for a song
  const handleToggleDropdown = (songId: string) => {
    setShowDropdown(showDropdown === songId ? null : songId);
  };
  
  // Add a song to the selected playlist
  const handleAddToPlaylist = (songId: string, playlistId: string) => {
    addToPlaylist(playlistId, songId);
    setShowDropdown(null);
  };
  
  return (
    <Card className="border border-futuristic-border overflow-hidden">
      <div className="flex justify-between items-center bg-futuristic-bg/80 p-3">
        <h2 className="text-lg font-semibold">Library</h2>
        <span className="text-xs text-futuristic-muted">{songs.length} songs</span>
      </div>
      
      <ScrollArea className="h-[260px]">
        <div className="space-y-1 p-2">
          {songs.map((song) => {
            const isPlaying = playerState.isPlaying && currentSong?.id === song.id;
            
            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2 rounded-md hover:bg-futuristic-bg/50 ${
                  currentSong?.id === song.id ? 'bg-futuristic-bg/70' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => playSong(song.id)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      isPlaying
                        ? 'bg-futuristic-accent1 text-black'
                        : 'bg-futuristic-bg/50 hover:bg-futuristic-accent1/30'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" aria-label="Pause" />
                    ) : (
                      <Play className="h-4 w-4" aria-label="Play" />
                    )}
                  </button>
                  
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{song.title}</span>
                    <span className="text-xs text-futuristic-muted">{song.artist}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DropdownMenu open={showDropdown === song.id} onOpenChange={() => setShowDropdown(null)}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDropdown(song.id);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" aria-label="More options" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <div className="w-full">
                          <p className="text-xs font-medium mb-1">Add to playlist</p>
                          {playlists.length > 0 ? (
                            <div className="space-y-1">
                              {playlists.map((playlist) => (
                                <Button
                                  key={playlist.id}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs h-6"
                                  onClick={() => handleAddToPlaylist(song.id, playlist.id)}
                                >
                                  {playlist.name}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-futuristic-muted italic">No playlists</p>
                          )}
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default SongsList;
