
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAudio } from '@/lib/audioContext';
import { Playlist } from '@/lib/types';
import { List, ListMusic, Music, Plus, Play, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const PlaylistManager: React.FC = () => {
  const { 
    playlists,
    createPlaylist,
    addToPlaylist, 
    removeFromPlaylist,
    deletePlaylist, 
    playPlaylist,
    currentSong,
    songs
  } = useAudio();
  
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  
  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a playlist name",
        variant: "destructive"
      });
      return;
    }
    
    createPlaylist(playlistName);
    setPlaylistName("");
  };
  
  const handleAddCurrentToPlaylist = (playlistId: string) => {
    if (currentSong) {
      addToPlaylist(playlistId, currentSong.id);
      toast({
        title: "Song Added",
        description: `"${currentSong.title}" added to playlist`
      });
    }
  };
  
  const handlePlayPlaylist = (playlistId: string) => {
    playPlaylist(playlistId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <ListMusic className="mr-2 h-5 w-5" />
        Playlists
      </h3>
      
      <div className="flex items-center space-x-2">
        <Input
          placeholder="New playlist name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <Button onClick={handleCreatePlaylist}>
          <Plus className="h-4 w-4 mr-1" /> Create
        </Button>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {playlists.map(playlist => (
          <Card 
            key={playlist.id}
            className={`p-3 ${selectedPlaylist?.id === playlist.id ? 'border-primary' : ''}`}
            onClick={() => setSelectedPlaylist(playlist)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{playlist.name}</h4>
                <p className="text-xs text-gray-400">{playlist.songs.length} songs</p>
              </div>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleAddCurrentToPlaylist(playlist.id)}
                  disabled={!currentSong}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handlePlayPlaylist(playlist.id)}
                  disabled={playlist.songs.length === 0}
                >
                  <Play className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => deletePlaylist(playlist.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {playlists.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <ListMusic className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No playlists yet</p>
          </div>
        )}
      </div>
      
      {selectedPlaylist && (
        <div className="border rounded-md p-3">
          <h4 className="font-medium mb-2">{selectedPlaylist.name} - Songs</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {selectedPlaylist.songs.map(songId => {
              const song = songs.find(s => s.id === songId);
              return song ? (
                <div key={song.id} className="flex justify-between items-center py-1 border-b">
                  <div className="flex items-center">
                    <Music className="h-3 w-3 mr-2" />
                    <span className="text-sm">{song.title}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeFromPlaylist(selectedPlaylist.id, song.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : null;
            })}
            
            {selectedPlaylist.songs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-2">No songs in this playlist</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;
