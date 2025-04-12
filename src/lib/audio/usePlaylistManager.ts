
import { useState, useEffect } from 'react';
import { Playlist } from '../types';
import { SAMPLE_PLAYLISTS } from './audioUtils';
import { toast } from '@/components/ui/use-toast';

export const usePlaylistManager = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(SAMPLE_PLAYLISTS);
  
  // Load playlists from local storage on mount
  useEffect(() => {
    const savedPlaylists = localStorage.getItem('audioPersonaPlaylists');
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists);
        if (Array.isArray(parsedPlaylists)) {
          setPlaylists(parsedPlaylists);
        }
      } catch (error) {
        console.error("Error loading playlists:", error);
      }
    }
  }, []);
  
  // Create a new playlist
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      songs: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    
    localStorage.setItem('audioPersonaPlaylists', JSON.stringify(updatedPlaylists));
    
    toast({
      title: "Playlist Created",
      description: `Created new playlist "${name}"`
    });
  };
  
  // Add a song to a playlist
  const addToPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        if (!playlist.songs.includes(songId)) {
          return {
            ...playlist,
            songs: [...playlist.songs, songId],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('audioPersonaPlaylists', JSON.stringify(updatedPlaylists));
  };
  
  // Remove a song from a playlist
  const removeFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(id => id !== songId),
          updatedAt: new Date().toISOString()
        };
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('audioPersonaPlaylists', JSON.stringify(updatedPlaylists));
  };
  
  // Delete a playlist
  const deletePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('audioPersonaPlaylists', JSON.stringify(updatedPlaylists));
    
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been removed"
    });
    
    return playlistId;
  };
  
  return {
    playlists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist
  };
};
