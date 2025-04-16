import React, { useState, useEffect } from 'react';
import { useAudio } from '@/lib/audioContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTime } from '@/lib/utils';
import { Play, Pause, Heart, ListPlus, Music } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SongsList: React.FC = () => {
  const { songs, playerState, playSong, playlists, addToPlaylist } = useAudio();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handlePlaySong = (songId: string) => {
    soundEffects.playTouchFeedback();
    playSong(songId);
  };
  
  const handleAddToPlaylist = (songId: string) => {
    setSelectedSongId(songId);
    setIsAddToPlaylistOpen(true);
    soundEffects.playTouchFeedback();
  };
  
  const handleAddToPlaylistConfirm = (playlistId: string) => {
    if (selectedSongId) {
      addToPlaylist(playlistId, selectedSongId);
      setIsAddToPlaylistOpen(false);
      soundEffects.playNotification();
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-futuristic-accent1">Music Library</h2>
        <Input
          placeholder="Search songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs border-futuristic-border bg-futuristic-bg/30"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSongs.map((song) => (
          <div 
            key={song.id}
            className={`flex items-center p-2 rounded-md ${
              playerState.currentSongId === song.id 
                ? 'bg-futuristic-accent1/20 border border-futuristic-accent1/50' 
                : 'hover:bg-futuristic-bg/30'
            }`}
          >
            <div 
              className="w-10 h-10 rounded bg-futuristic-bg/50 mr-3 flex-shrink-0 flex items-center justify-center cursor-pointer"
              onClick={() => handlePlaySong(song.id)}
            >
              {playerState.currentSongId === song.id && playerState.isPlaying ? (
                <Pause className="h-5 w-5 text-futuristic-accent1" />
              ) : (
                <Play className="h-5 w-5 text-white" />
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="font-medium truncate">{song.title}</div>
              <div className="text-sm text-futuristic-muted truncate">{song.artist}</div>
            </div>
            
            <div className="text-sm text-futuristic-muted mr-3">
              {formatTime(song.duration)}
            </div>
            
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => {}}
              >
                <Heart className="h-4 w-4 text-gray-400 hover:text-red-400" aria-label="Add to favorites" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => handleAddToPlaylist(song.id)}
              >
                <ListPlus className="h-4 w-4 text-gray-400 hover:text-blue-400" aria-label="Add to playlist" />
              </Button>
            </div>
          </div>
        ))}
        
        {filteredSongs.length === 0 && (
          <div className="col-span-2 text-center py-8 text-futuristic-muted">
            <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No songs found. Try a different search term or add some songs.</p>
            <Button 
              variant="outline" 
              className="mt-4 border-futuristic-accent1 text-futuristic-accent1"
              onClick={() => {
                const event = new CustomEvent('trigger-file-upload');
                document.dispatchEvent(event);
              }}
            >
              Add Songs
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
        <DialogContent className="sm:max-w-md glass border-futuristic-border">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription>
              Select a playlist to add this song to
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {playlists.length === 0 ? (
              <p className="text-center text-futuristic-muted">
                No playlists available. Create a playlist first.
              </p>
            ) : (
              playlists.map(playlist => (
                <Button
                  key={playlist.id}
                  variant="outline"
                  className="justify-start border-futuristic-border hover:bg-futuristic-accent1/20"
                  onClick={() => handleAddToPlaylistConfirm(playlist.id)}
                >
                  <ListPlus className="mr-2 h-4 w-4" />
                  {playlist.name} ({playlist.songs.length} songs)
                </Button>
              ))
            )}
          </div>
          
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SongsList;
