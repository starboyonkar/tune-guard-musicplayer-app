
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAudio } from '@/lib/audioContext';
import { Playlist } from '@/lib/types';
import { Plus, Play, Trash2, Music } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PlaylistManager = () => {
  const { songs, playlists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, playSong } = useAudio();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
      toast({
        title: "Playlist Created",
        description: `"${newPlaylistName}" has been created`,
      });
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      deletePlaylist(playlistId);
      toast({
        title: "Playlist Deleted",
        description: `"${playlist.name}" has been deleted`,
        variant: "destructive",
      });
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songIds.length > 0) {
      const firstSong = songs.find(song => song.id === playlist.songIds[0]);
      if (firstSong) {
        playSong(firstSong.id);
        toast({
          title: "Playing Playlist",
          description: `Started playing "${playlist.name}"`,
        });
      }
    }
  };

  const getSongById = (songId: string) => {
    return songs.find(song => song.id === songId);
  };

  return (
    <Card className="border-futuristic-border bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-futuristic-accent1 flex items-center">
          <Music className="mr-2 h-5 w-5" />
          Playlists
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new playlist */}
        <div className="space-y-2">
          {!isCreating ? (
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Playlist
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                autoFocus
              />
              <Button onClick={handleCreatePlaylist} size="sm">
                Create
              </Button>
              <Button
                onClick={() => {
                  setIsCreating(false);
                  setNewPlaylistName('');
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Playlist list */}
        <div className="space-y-3">
          {playlists.length === 0 ? (
            <p className="text-futuristic-muted text-sm text-center py-4">
              No playlists yet. Create your first playlist!
            </p>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="border border-futuristic-border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-futuristic-text">{playlist.name}</h4>
                    <p className="text-xs text-futuristic-muted">
                      {playlist.songIds.length} song{playlist.songIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => handlePlayPlaylist(playlist)}
                      size="sm"
                      variant="ghost"
                      disabled={playlist.songIds.length === 0}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Songs in playlist */}
                {playlist.songIds.length > 0 && (
                  <div className="space-y-1">
                    {playlist.songIds.slice(0, 3).map((songId) => {
                      const song = getSongById(songId);
                      return song ? (
                        <div key={songId} className="flex items-center justify-between text-xs">
                          <span className="text-futuristic-muted truncate">
                            {song.title} - {song.artist}
                          </span>
                          <Button
                            onClick={() => removeFromPlaylist(playlist.id, songId)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                    {playlist.songIds.length > 3 && (
                      <p className="text-xs text-futuristic-muted">
                        +{playlist.songIds.length - 3} more songs
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add songs to playlists */}
        {playlists.length > 0 && songs.length > 0 && (
          <div className="border-t border-futuristic-border pt-3">
            <h5 className="text-sm font-medium text-futuristic-text mb-2">Quick Add</h5>
            <div className="space-y-2">
              {songs.slice(0, 3).map((song) => (
                <div key={song.id} className="flex items-center justify-between text-xs">
                  <span className="text-futuristic-muted truncate">
                    {song.title} - {song.artist}
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addToPlaylist(e.target.value, song.id);
                        e.target.value = '';
                        toast({
                          title: "Song Added",
                          description: `"${song.title}" added to playlist`,
                        });
                      }
                    }}
                    className="text-xs bg-black/60 border border-futuristic-border rounded px-2 py-1"
                  >
                    <option value="">Add to...</option>
                    {playlists.map((playlist) => (
                      <option key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistManager;
