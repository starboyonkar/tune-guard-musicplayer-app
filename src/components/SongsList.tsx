
import React, { useState } from 'react';
import { useAudio } from '@/lib/audioContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  Play, Pause, Heart, Clock, Music, Plus, MoreVertical, 
  ListPlus, Trash2, PlayCircle
} from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Helper for formatting time in mm:ss
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const CreatePlaylistDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlaylist: (name: string) => void;
}> = ({ isOpen, onOpenChange, onCreatePlaylist }) => {
  const [playlistName, setPlaylistName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;
    
    onCreatePlaylist(playlistName.trim());
    setPlaylistName('');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-futuristic-accent2">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription>
            Enter a name for your new playlist.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Playlist Name</Label>
            <Input 
              id="playlist-name" 
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="My Awesome Playlist"
              className="border-futuristic-border bg-futuristic-bg/30"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={!playlistName.trim()}
              className="bg-futuristic-accent1 hover:bg-futuristic-accent1/80"
            >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AddToPlaylistDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToPlaylist: (playlistId: string) => void;
  playlists: { id: string; name: string }[];
}> = ({ isOpen, onOpenChange, onAddToPlaylist, playlists }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-futuristic-accent2">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Select a playlist to add this song to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[300px] overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="text-center py-4 text-futuristic-muted">
              No playlists yet. Create one first.
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map(playlist => (
                <Button 
                  key={playlist.id}
                  variant="outline"
                  className="w-full justify-start text-left border-futuristic-border hover:bg-futuristic-accent1/10"
                  onClick={() => {
                    onAddToPlaylist(playlist.id);
                    onOpenChange(false);
                  }}
                >
                  <ListPlus className="mr-2 h-4 w-4" />
                  {playlist.name}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SongsList = () => {
  const { 
    songs, 
    playerState, 
    currentSong,
    playSong,
    playlists,
    createPlaylist,
    addToPlaylist,
    playPlaylist,
    deletePlaylist
  } = useAudio();
  
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  
  const handlePlay = (songId: string) => {
    soundEffects.playTouchFeedback();
    playSong(songId);
  };
  
  const handleAddToPlaylist = (songId: string) => {
    setSelectedSong(songId);
    setIsAddingToPlaylist(true);
  };
  
  const handleCreatePlaylist = (name: string) => {
    createPlaylist(name);
    soundEffects.playSuccess();
  };
  
  const handleAddSongToPlaylist = (playlistId: string) => {
    if (selectedSong) {
      addToPlaylist(playlistId, selectedSong);
      soundEffects.playSuccess();
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Songs</h2>
          <Button 
            variant="outline" 
            size="sm"
            className={`border-futuristic-border text-xs ${!showPlaylists ? 'bg-futuristic-accent1/20' : 'bg-transparent'}`}
            onClick={() => setShowPlaylists(false)}
          >
            Songs
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`border-futuristic-border text-xs ${showPlaylists ? 'bg-futuristic-accent1/20' : 'bg-transparent'}`}
            onClick={() => setShowPlaylists(true)}
          >
            Playlists
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="border-futuristic-border bg-futuristic-accent1/10"
          onClick={() => {
            soundEffects.playTouchFeedback();
            setIsCreatingPlaylist(true);
          }}
        >
          <Plus className="mr-1 h-3 w-3" />
          New Playlist
        </Button>
      </div>
      
      {!showPlaylists ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Song</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead className="text-right"><Clock className="h-4 w-4 ml-auto" /></TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((song) => (
                <TableRow 
                  key={song.id} 
                  className={currentSong?.id === song.id ? "bg-futuristic-accent1/10" : ""}
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={currentSong?.id === song.id && playerState.isPlaying ? "text-futuristic-accent1" : "text-futuristic-muted"}
                      onClick={() => handlePlay(song.id)}
                    >
                      {currentSong?.id === song.id && playerState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell className="text-right">{formatTime(song.duration)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePlay(song.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Play
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddToPlaylist(song.id)}>
                          <ListPlus className="mr-2 h-4 w-4" />
                          Add to Playlist
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map(playlist => (
            <Card key={playlist.id} className="border-futuristic-border bg-futuristic-bg/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-base">
                  <span>{playlist.name}</span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-futuristic-muted hover:text-futuristic-accent1"
                      onClick={() => {
                        soundEffects.playTouchFeedback();
                        playPlaylist(playlist.id);
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-futuristic-muted hover:text-destructive"
                      onClick={() => {
                        soundEffects.playTouchFeedback();
                        deletePlaylist(playlist.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="text-futuristic-muted">
                  {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                </div>
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {playlist.songs.length === 0 ? (
                    <div className="text-futuristic-muted text-xs italic">No songs added yet</div>
                  ) : (
                    playlist.songs.map(songId => {
                      const song = songs.find(s => s.id === songId);
                      return song ? (
                        <div key={songId} className="flex justify-between text-xs">
                          <span>{song.title}</span>
                          <span className="text-futuristic-muted">{song.artist}</span>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {playlists.length === 0 && (
            <div className="col-span-full text-center py-8 text-futuristic-muted">
              <Music className="h-12 w-12 mx-auto opacity-50 mb-2" />
              <p>No playlists yet. Create one to get started.</p>
            </div>
          )}
        </div>
      )}
      
      <CreatePlaylistDialog 
        isOpen={isCreatingPlaylist} 
        onOpenChange={setIsCreatingPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
      />
      
      <AddToPlaylistDialog 
        isOpen={isAddingToPlaylist} 
        onOpenChange={setIsAddingToPlaylist}
        onAddToPlaylist={handleAddSongToPlaylist}
        playlists={playlists}
      />
    </div>
  );
};

export default SongsList;
