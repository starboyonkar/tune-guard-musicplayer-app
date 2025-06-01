import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Song, PlayerState, UserProfile, Playlist, EQSettings, WaveformData, VisSettings, VoiceCommand } from './types';

interface AudioContextType {
  isSignedUp: boolean;
  currentProfile: UserProfile | null;
  songs: Song[];
  playlists: Playlist[];
  playerState: PlayerState;
  waveformData: WaveformData;
  visSettings: VisSettings;
  eqSettings: EQSettings;
  voiceCommands: VoiceCommand[];
  isVoiceListening: boolean;
  toggleVoiceListening: () => void;
  setVoiceCommand: (command: string) => void;
  playSong: (songId: string) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  logout: () => void;
  currentSong: Song | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    volume: 70,
    muted: false,
    currentSongId: null,
    currentPlaylistId: null,
    shuffleEnabled: false,
    repeatMode: 'off'
  });
  const [waveformData, setWaveformData] = useState<WaveformData>({
    original: [],
    processed: [],
    timeData: [],
    frequencyData: []
  });
  const [visSettings, setVisSettings] = useState<VisSettings>({
    scale: 1,
    timeScale: 1,
    amplitudeScale: 1,
    showProcessed: true,
    showOriginal: true,
    overlay: false,
    mode: 'default',
    color: '#00ffff',
    sensitivity: 0.5,
    showPeaks: true
  });
  const [eqSettings, setEqSettings] = useState<EQSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 70,
    preAmp: 0,
    enabled: true,
    preset: 'flat',
    presence: 0,
    warmth: 0
  });
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Create a safe toast function to avoid errors with unsupported properties
  const createSafeToast = (toastData: any) => {
    try {
      // Remove id property if it exists since it's not supported
      const { id, ...safeToastData } = toastData;
      toast(safeToastData);
    } catch (error) {
      console.error("Toast error:", error);
      // Fallback to console log if toast fails
      console.log("Toast message:", toastData.title, toastData.description);
    }
  };

  const toggleVoiceListening = useCallback(() => {
    setIsVoiceListening(prev => !prev);
  }, []);

  const setVoiceCommand = useCallback((command: string) => {
    setVoiceCommands(prev => [
      ...prev,
      {
        text: command,
        timestamp: new Date().toISOString(),
        processed: false,
        recognized: true
      }
    ]);
  }, []);

  const playSong = useCallback((songId: string) => {
    if (!songId) return;
    if (playerState.currentSongId === songId && playerState.isPlaying) return;

    const songToPlay = songs.find(s => s.id === songId);
    if (!songToPlay) {
      createSafeToast({
        title: "Song Not Found",
        description: "The requested song could not be found",
        variant: "destructive"
      });
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.src = songToPlay.source;
      audioElementRef.current.play().then(() => {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
          currentSongId: songId,
          currentTime: 0
        }));
      }).catch(error => {
        console.error("Playback error:", error);
        createSafeToast({
          title: "Playback Error",
          description: "Unable to play the selected song",
          variant: "destructive"
        });
      });
    }
  }, [songs, playerState.currentSongId, playerState.isPlaying]);

  const togglePlayPause = useCallback(() => {
    if (!audioElementRef.current) return;

    if (playerState.isPlaying) {
      audioElementRef.current.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioElementRef.current.play().then(() => {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      }).catch(error => {
        console.error("Play error:", error);
        createSafeToast({
          title: "Playback Error",
          description: "Unable to resume playback",
          variant: "destructive"
        });
      });
    }
  }, [playerState.isPlaying]);

  const nextSong = useCallback(() => {
    if (songs.length === 0) return;

    let currentIndex = songs.findIndex(s => s.id === playerState.currentSongId);
    if (currentIndex === -1) currentIndex = 0;

    let nextIndex = currentIndex + 1;
    if (nextIndex >= songs.length) {
      if (playerState.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // No next song, stop playback
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        return;
      }
    }

    playSong(songs[nextIndex].id);
  }, [songs, playerState.currentSongId, playerState.repeatMode, playSong]);

  const prevSong = useCallback(() => {
    if (songs.length === 0) return;

    let currentIndex = songs.findIndex(s => s.id === playerState.currentSongId);
    if (currentIndex === -1) currentIndex = 0;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (playerState.repeatMode === 'all') {
        prevIndex = songs.length - 1;
      } else {
        // No previous song, restart current
        if (audioElementRef.current) {
          audioElementRef.current.currentTime = 0;
        }
        return;
      }
    }

    playSong(songs[prevIndex].id);
  }, [songs, playerState.currentSongId, playerState.repeatMode, playSong]);

  const seekTo = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume / 100;
      setPlayerState(prev => ({ ...prev, volume, muted: volume === 0 }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioElementRef.current) {
      const newMuted = !playerState.muted;
      audioElementRef.current.muted = newMuted;
      setPlayerState(prev => ({ ...prev, muted: newMuted }));
    }
  }, [playerState.muted]);

  const toggleShuffle = useCallback(() => {
    setPlayerState(prev => ({ ...prev, shuffleEnabled: !prev.shuffleEnabled }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlayerState(prev => {
      let newMode: PlayerState['repeatMode'];
      if (prev.repeatMode === 'off') newMode = 'all';
      else if (prev.repeatMode === 'all') newMode = 'one';
      else newMode = 'off';
      return { ...prev, repeatMode: newMode };
    });
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out user...");
    
    // Stop audio immediately
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    
    // Reset all state
    setIsSignedUp(false);
    setCurrentProfile(null);
    setPlayerState({
      isPlaying: false,
      currentTime: 0,
      volume: 70,
      muted: false,
      currentSongId: null,
      currentPlaylistId: null,
      shuffleEnabled: false,
      repeatMode: 'off'
    });
    
    // Clear storage
    localStorage.removeItem('tuneGuardProfile');
    localStorage.removeItem('tuneGuardSongs');
    localStorage.removeItem('tuneGuardPlaylists');
    
    createSafeToast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    
    // Force page reload to ensure complete cleanup
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  // Update currentSong derived from currentSongId
  const currentSong = songs.find(s => s.id === playerState.currentSongId) || null;

  // Audio element event listeners for updating currentTime and handling ended event
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    const timeUpdateHandler = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const endedHandler = () => {
      if (playerState.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', timeUpdateHandler);
    audio.addEventListener('ended', endedHandler);

    return () => {
      audio.removeEventListener('timeupdate', timeUpdateHandler);
      audio.removeEventListener('ended', endedHandler);
    };
  }, [playerState.repeatMode, nextSong]);

  // Initialize audio element on mount
  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.volume = playerState.volume / 100;
    }
  }, []);

  return (
    <AudioContext.Provider value={{
      isSignedUp,
      currentProfile,
      songs,
      playlists,
      playerState,
      waveformData,
      visSettings,
      eqSettings,
      voiceCommands,
      isVoiceListening,
      toggleVoiceListening,
      setVoiceCommand,
      playSong,
      togglePlayPause,
      nextSong,
      prevSong,
      seekTo,
      setVolume,
      toggleMute,
      toggleShuffle,
      toggleRepeat,
      logout,
      currentSong
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
