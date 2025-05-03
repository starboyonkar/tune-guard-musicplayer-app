
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAudio } from '@/lib/audioContext';
import { 
  MoreHorizontal, Play, Pause, Plus, Search, 
  Music, Clock, Heart, HeartOff, ListMusic, UserCircle
} from 'lucide-react';
import PlaylistManager from '@/components/PlaylistManager';
import { soundEffects } from '@/lib/soundEffects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// A utility function to format time in mm:ss
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const SongsList: React.FC = () => {
  const { 
    songs, 
    playerState, 
    playSong, 
    playlists, 
    playPlaylist, 
    addToPlaylist,
    profile
  } = useAudio();
  const [searchTerm, setSearchTerm] = useState('');

  const [showPlaylistManager, setShowPlaylistManager] = useState(false);

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaySong = (songId: string) => {
    soundEffects.playTouchFeedback();
    playSong(songId);
  };

  const handlePlaylistClick = (playlistId: string) => {
    soundEffects.playTouchFeedback();
    playPlaylist(playlistId);
  };

  const handleAddToPlaylist = (songId: string, playlistId: string) => {
    soundEffects.playTouchFeedback();
    addToPlaylist(playlistId, songId);
  };

  const togglePlaylistManager = () => {
    soundEffects.playTouchFeedback();
    setShowPlaylistManager(prev => !prev);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-futuristic-accent1">My Music</h2>
        <div className="flex gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-futuristic-muted" />
            <Input
              type="search"
              placeholder="Search music..."
              className="pl-8 border-futuristic-border bg-futuristic-bg/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline"
            size="icon"
            className="border-futuristic-border bg-futuristic-bg/30"
            onClick={togglePlaylistManager}
            aria-label="Manage playlists"
          >
            <ListMusic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="songs">
        <TabsList className="mb-4">
          <TabsTrigger value="songs" className="data-[state=active]:bg-futuristic-accent1">
            <Music className="h-4 w-4 mr-2" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="playlists" className="data-[state=active]:bg-futuristic-accent1">
            <ListMusic className="h-4 w-4 mr-2" />
            Playlists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <div className="rounded-md border border-futuristic-border overflow-hidden">
            <Table>
              <TableHeader className="bg-futuristic-bg/30">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead className="text-right"><Clock className="h-4 w-4 inline" aria-label="Duration" /></TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song, index) => (
                    <TableRow 
                      key={song.id}
                      className={playerState.currentSongId === song.id ? 
                        'bg-futuristic-accent1/10 hover:bg-futuristic-accent1/20' : 
                        'hover:bg-futuristic-bg/20'
                      }
                    >
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                          onClick={() => handlePlaySong(song.id)}
                        >
                          {playerState.currentSongId === song.id && playerState.isPlaying ? 
                            <Pause className="h-4 w-4" aria-label="Pause" /> : 
                            <Play className="h-4 w-4" aria-label="Play" />
                          }
                        </Button>
                      </TableCell>
                      <TableCell 
                        className={`font-medium ${playerState.currentSongId === song.id ? 'text-futuristic-accent1' : ''}`}
                      >
                        {song.title}
                      </TableCell>
                      <TableCell>{song.artist}</TableCell>
                      <TableCell className="text-right">{formatTime(song.duration)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 p-0"
                              onClick={() => soundEffects.playTouchFeedback()}
                            >
                              <MoreHorizontal className="h-4 w-4" aria-label="More options" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-futuristic-bg border-futuristic-border">
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-futuristic-border" />
                            <DropdownMenuItem 
                              onClick={() => handlePlaySong(song.id)}
                              className="cursor-pointer"
                            >
                              <Play className="h-4 w-4 mr-2" aria-label="Play" />
                              Play
                            </DropdownMenuItem>
                            
                            {playlists.length > 0 && (
                              <>
                                <DropdownMenuSeparator className="bg-futuristic-border" />
                                <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
                                {playlists.map(playlist => (
                                  <DropdownMenuItem
                                    key={playlist.id}
                                    onClick={() => handleAddToPlaylist(song.id, playlist.id)}
                                    className="cursor-pointer"
                                  >
                                    <Plus className="h-4 w-4 mr-2" aria-label="Add to playlist" />
                                    {playlist.name}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-futuristic-muted">
                      No songs found. Try another search term.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="playlists">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.length > 0 ? (
              playlists.map(playlist => (
                <Card 
                  key={playlist.id} 
                  className="border-futuristic-border bg-futuristic-bg/30 hover:bg-futuristic-bg/50 cursor-pointer transition-colors"
                  onClick={() => handlePlaylistClick(playlist.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-futuristic-accent1">{playlist.name}</h3>
                        <p className="text-xs text-futuristic-muted">{playlist.songs.length} songs</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaylistClick(playlist.id);
                        }}
                      >
                        <Play className="h-5 w-5" aria-label="Play playlist" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-futuristic-muted">
                <ListMusic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No playlists yet. Create one to get started.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-futuristic-border"
                  onClick={togglePlaylistManager}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Playlist
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showPlaylistManager && (
        <PlaylistManager onClose={togglePlaylistManager} />
      )}
    </div>
  );
};

export default SongsList;
