import { useState } from 'react';
import { 
  Song, 
  PlayerState, 
  EQSettings, 
  VoiceCommand,
  VisSettings
} from '../types';
import { useAudioEngine } from './useAudioEngine';
import { usePlaylistManager } from './usePlaylistManager';
import { useProfileManager } from './useProfileManager';
import { createSongFromFile, SAMPLE_SONGS, processVoiceCommand } from './audioUtils';
import { toast } from '@/components/ui/use-toast';

// Default player state
const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  volume: 70,
  isMuted: false,
  currentSongId: '1',
  currentPlaylistId: null
};

// Default visualization settings
const defaultVisSettings: VisSettings = {
  scale: 1,
  timeScale: 1,
  amplitudeScale: 1,
  showProcessed: true,
  showOriginal: true,
  overlay: true
};

export const useAudio = () => {
  // State management
  const [customSongs, setCustomSongs] = useState<Song[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [eqSettings, setEQSettings] = useState<EQSettings>({
    bass: 70,
    mid: 70,
    treble: 70,
    volume: 70
  });
  const [voiceCommand, setVoiceCommandText] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [processingVoice, setProcessingVoice] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visSettings, setVisSettings] = useState<VisSettings>(defaultVisSettings);
  
  // Combine sample and custom songs
  const songs = [...SAMPLE_SONGS, ...customSongs];
  
  // Get the current song based on the currentSongId
  const currentSong = playerState.currentSongId 
    ? songs.find(song => song.id === playerState.currentSongId) 
    : null;
  
  // Get access to playlist management functions
  const { 
    playlists, 
    createPlaylist, 
    addToPlaylist, 
    removeFromPlaylist,
    deletePlaylist 
  } = usePlaylistManager();
  
  // Get access to profile management functions
  const { 
    profile, 
    isSignedUp, 
    setProfile: setUserProfile, 
    updateProfile 
  } = useProfileManager();
  
  // Handle song ended event
  const handleSongEnded = () => {
    nextSong();
  };
  
  // Handle time update event
  const handleTimeUpdate = (time: number) => {
    setPlayerState(prev => ({
      ...prev,
      currentTime: time
    }));
  };
  
  // Handle metadata loaded event
  const handleLoadedMetadata = (duration: number) => {
    if (currentSong) {
      if (customSongs.some(song => song.id === currentSong.id)) {
        setCustomSongs(customSongs.map(song => 
          song.id === currentSong.id ? { ...song, duration } : song
        ));
      }
    }
  };
  
  // Use audio engine for playing songs and processing audio
  const { waveformData, seekTo: engineSeekTo } = useAudioEngine(
    currentSong?.source || null,
    playerState.isPlaying,
    playerState.volume,
    playerState.isMuted,
    eqSettings,
    handleSongEnded,
    handleTimeUpdate,
    handleLoadedMetadata
  );
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };
  
  // Play the next song
  const nextSong = () => {
    if (playerState.currentPlaylistId) {
      const currentPlaylist = playlists.find(p => p.id === playerState.currentPlaylistId);
      if (currentPlaylist) {
        const currentSongIndex = currentPlaylist.songs.findIndex(id => id === playerState.currentSongId);
        const nextIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
        const nextSongId = currentPlaylist.songs[nextIndex];
        
        setPlayerState(prev => ({
          ...prev,
          currentSongId: nextSongId,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const nextIndex = (currentIndex + 1) % songs.length;
    
    setPlayerState(prev => ({
      ...prev,
      currentSongId: songs[nextIndex].id,
      currentTime: 0,
      isPlaying: true
    }));
  };
  
  // Play the previous song
  const prevSong = () => {
    if (playerState.currentPlaylistId) {
      const currentPlaylist = playlists.find(p => p.id === playerState.currentPlaylistId);
      if (currentPlaylist) {
        const currentSongIndex = currentPlaylist.songs.findIndex(id => id === playerState.currentSongId);
        const prevIndex = (currentSongIndex - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length;
        const prevSongId = currentPlaylist.songs[prevIndex];
        
        setPlayerState(prev => ({
          ...prev,
          currentSongId: prevSongId,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    
    setPlayerState(prev => ({
      ...prev,
      currentSongId: songs[prevIndex].id,
      currentTime: 0,
      isPlaying: true
    }));
  };
  
  // Seek to specific time in the song
  const seekTo = (time: number) => {
    engineSeekTo(time);
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  };
  
  // Set volume level
  const setVolume = (volume: number) => {
    setPlayerState(prev => ({ ...prev, volume, isMuted: false }));
  };
  
  // Toggle mute
  const toggleMute = () => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };
  
  // Add a song from file
  const addSong = async (file: File) => {
    try {
      setIsLoading(true);
      
      const newSong = await createSongFromFile(file);
      
      setCustomSongs(prev => [...prev, newSong]);
      
      setPlayerState(prev => ({
        ...prev,
        currentSongId: newSong.id,
        currentTime: 0,
        isPlaying: true
      }));
      
      toast({
        title: "Song Added",
        description: `Now playing "${newSong.title}"`,
      });
    } catch (error) {
      console.error("Error adding song:", error);
      toast({
        title: "Error",
        description: "Failed to add song. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set user profile
  const setProfile = (newProfile: UserProfile) => {
    const newEQSettings = setUserProfile(newProfile);
    setEQSettings(newEQSettings);
  };
  
  // Process voice command
  const setVoiceCommand = (command: string) => {
    setVoiceCommandText(command);
    setProcessingVoice(true);
    
    const newCommand: VoiceCommand = {
      text: command,
      timestamp: new Date().toISOString(),
      processed: false
    };
    
    setCommandHistory(prev => [newCommand, ...prev].slice(0, 10));
    
    setTimeout(() => {
      processVoiceCommand(command, songs, currentSong, setPlayerState, nextSong, prevSong);
      setProcessingVoice(false);
      
      setCommandHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0].processed = true;
        }
        return updated;
      });
    }, 1500);
  };
  
  // Toggle voice listening
  const toggleVoiceListening = () => {
    setIsVoiceListening(!isVoiceListening);
    if (!isVoiceListening) {
      toast({
        title: "Voice Assistant Activated",
        description: "Listening for commands...",
      });
    }
  };
  
  // Play a playlist
  const playPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.songs.length === 0) return;
    
    const firstSongId = playlist.songs[0];
    
    setPlayerState(prev => ({
      ...prev,
      currentSongId: firstSongId,
      currentPlaylistId: playlistId,
      currentTime: 0,
      isPlaying: true
    }));
    
    toast({
      title: "Playing Playlist",
      description: `Now playing "${playlist.name}"`
    });
  };

  return {
    profile,
    setProfile,
    eqSettings,
    setEQSettings,
    songs,
    addSong,
    playerState,
    voiceCommand,
    setVoiceCommand,
    isVoiceListening,
    toggleVoiceListening,
    commandHistory,
    togglePlayPause,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    currentSong,
    waveformData,
    isSignedUp,
    processingVoice,
    updateProfile,
    isLoading,
    playlists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    playPlaylist,
    setVisSettings: (newSettings: Partial<VisSettings>) => setVisSettings(prev => ({ ...prev, ...newSettings })),
    visSettings
  };
};

export { useAudio };
export default useAudio;
