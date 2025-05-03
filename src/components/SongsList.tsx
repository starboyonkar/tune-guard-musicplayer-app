import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';
import { Play, Pause, Plus, MoreHorizontal, ListMusic } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { soundEffects } from '@/lib/soundEffects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SongsList: React.FC = () => {
  const { 
    songs, 
    playerState, 
    playSong, 
    playlists, 
    createPlaylist, 
    addToPlaylist,
    playPlaylist
  } = useAudio();
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  
  const handlePlaySong = (songId: string) => {
    soundEffects.playTouchFeedback();
    playSong(songId);
  };
  
  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsAddingPlaylist(false);
      
      if (selectedSongId) {
        // We'll add the song in the next render cycle
        setTimeout(() => {
          const newPlaylist = playlists[playlists.length - 1];
          if (newPlaylist && selectedSongId) {
            addToPlaylist(newPlaylist.id, selectedSongId);
          }
        }, 100);
      }
    }
  };
  
  const handleAddToPlaylist = (playlistId: string, songId: string) => {
    soundEffects.playTouchFeedback();
    addToPlaylist(playlistId, songId);
  };
  
  const handlePlayPlaylist = (playlistId: string) => {
    soundEffects.playTouchFeedback();
    playPlaylist(playlistId);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreatePlaylist();
    }
  };
  
  return (
    <Card className="w-full glass border-futuristic-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="neon-text">Music Library</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-futuristic-muted hover:text-futuristic-accent2"
                onClick={() => soundEffects.playTouchFeedback()}
                aria-label="Playlists"
              >
                <ListMusic className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass border-futuristic-accent2">
              <DialogHeader>
                <DialogTitle className="neon-text">Playlists</DialogTitle>
                <DialogDescription className="text-futuristic-muted">
                  Manage your music collections
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {playlists.length === 0 ? (
                  <div className="text-center text-futuristic-muted py-4">
                    No playlists yet. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playlists.map(playlist => (
                      <div 
                        key={playlist.id} 
                        className="flex items-center justify-between p-2 rounded-md hover:bg-futuristic-bg/30"
                      >
                        <div>
                          <div className="font-medium">{playlist.name}</div>
                          <div className="text-xs text-futuristic-muted">
                            {playlist.songs.length} songs
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePlayPlaylist(playlist.id)}
                          className="text-futuristic-accent1"
                        >
                          <Play className="h-4 w-4 mr-1" /> Play
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {isAddingPlaylist ? (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="playlist-name">Playlist Name</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="playlist-name"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter playlist name"
                        className="border-futuristic-border bg-futuristic-bg/30"
                        autoFocus
                      />
                      <Button 
                        onClick={handleCreatePlaylist}
                        disabled={!newPlaylistName.trim()}
                        className="bg-futuristic-accent1 hover:bg-futuristic-accent1/90"
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      setSelectedSongId(null);
                      setIsAddingPlaylist(true);
                    }}
                    className="mt-4 w-full bg-futuristic-accent2/20 hover:bg-futuristic-accent2/40 border border-futuristic-accent2/50"
                  >
                    <Plus className="h-4 w-4 mr-2" /> New Playlist
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 max-h-[300px] overflow-y-auto custom-scrollbar">
        {songs.length === 0 ? (
          <div className="text-center text-futuristic-muted py-8">
            No songs available. Add some music to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song) => (
              <div 
                key={song.id} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  playerState.currentSongId === song.id 
                    ? 'bg-futuristic-accent1/20 border border-futuristic-accent1/30' 
                    : 'hover:bg-futuristic-bg/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-full ${
                      playerState.currentSongId === song.id && playerState.isPlaying
                        ? 'bg-futuristic-accent1 text-white'
                        : 'text-futuristic-accent2'
                    }`}
                    onClick={() => handlePlaySong(song.id)}
                    aria-label={playerState.isPlaying && playerState.currentSongId === song.id ? "Pause" : "Play"}
                  >
                    {playerState.isPlaying && playerState.currentSongId === song.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>
                  
                  <div>
                    <div className="font-medium line-clamp-1">{song.title}</div>
                    <div className="text-xs text-futuristic-muted line-clamp-1">{song.artist}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-futuristic-muted">
                    {formatTime(song.duration)}
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-futuristic-muted hover:text-white"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass border-futuristic-border">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePlaySong(song.id)}>
                        {playerState.isPlaying && playerState.currentSongId === song.id ? (
                          <>Pause</>
                        ) : (
                          <>Play</>
                        )}
                      </DropdownMenuItem>
                      
                      {playlists.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Add to playlist</DropdownMenuLabel>
                          {playlists.map(playlist => (
                            <DropdownMenuItem 
                              key={playlist.id}
                              onClick={() => handleAddToPlaylist(playlist.id, song.id)}
                            >
                              {playlist.name}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedSongId(song.id);
                          setIsAddingPlaylist(true);
                        }}
                      >
                        Create new playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SongsList;
