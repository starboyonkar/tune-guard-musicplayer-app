
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, EQSettings, Song, PlayerState, VoiceCommand } from './types';
import { toast } from '@/components/ui/use-toast';

// Sample songs data
const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: "Blinding Lights",
    artist: 'The Weeknd',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273aad49f1f5c14ebdbe5b6250a',
    duration: 200,
    source: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3' // Using free audio
  },
  {
    id: '2',
    title: "Shape of You",
    artist: 'Ed Sheeran',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
    duration: 234,
    source: 'https://assets.mixkit.co/music/preview/mixkit-dance-with-me-3.mp3' // Using free audio
  },
  {
    id: '3',
    title: "Dance Monkey",
    artist: 'Tones and I',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c6f7af36eccd256764e0a9f6',
    duration: 210,
    source: 'https://assets.mixkit.co/music/preview/mixkit-uplift-breakbeat-loop-180.mp3' // Using free audio
  },
  {
    id: '4',
    title: "Don't Start Now",
    artist: 'Dua Lipa',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
    duration: 183,
    source: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3' // Using free audio
  }
];

// Get EQ settings based on age
const getEQSettingsByAge = (age: number, gender: string): EQSettings => {
  // Different EQ profiles based on age groups
  if (age < 20) {
    return {
      bass: gender === 'male' ? 75 : 70,
      mid: 65,
      treble: 80,
      volume: 70
    };
  } else if (age < 40) {
    return {
      bass: 70,
      mid: 70,
      treble: 75,
      volume: 65
    };
  } else if (age < 60) {
    return {
      bass: 75,
      mid: 75, 
      treble: 65,
      volume: 60
    };
  } else {
    return {
      bass: 80,
      mid: 70,
      treble: 55,
      volume: 75
    };
  }
};

interface AudioContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  eqSettings: EQSettings;
  setEQSettings: (settings: EQSettings) => void;
  songs: Song[];
  addSong: (file: File) => void;
  playerState: PlayerState;
  voiceCommand: string;
  setVoiceCommand: (command: string) => void;
  isVoiceListening: boolean;
  toggleVoiceListening: () => void;
  commandHistory: VoiceCommand[];
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  currentSong: Song | null;
  waveformData: number[];
  isSignedUp: boolean;
  processingVoice: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  isLoading: boolean;
}

const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  volume: 70,
  isMuted: false,
  currentSongId: '1' // Start with the first song
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [eqSettings, setEQSettings] = useState<EQSettings>({
    bass: 70,
    mid: 70,
    treble: 70,
    volume: 70
  });
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [voiceCommand, setVoiceCommandText] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>(Array(30).fill(0));
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [processingVoice, setProcessingVoice] = useState<boolean>(false);
  const [customSongs, setCustomSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Merge sample songs with user-uploaded songs
  const songs = [...SAMPLE_SONGS, ...customSongs];
  
  const currentSong = playerState.currentSongId 
    ? songs.find(song => song.id === playerState.currentSongId) 
    : null;

  // Add song from file
  const addSong = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Generate an object URL for the MP3 file
      const fileUrl = URL.createObjectURL(file);
      
      // Create a temporary audio element to get metadata
      const audio = new Audio(fileUrl);
      
      // Wait for metadata to load
      await new Promise<void>((resolve) => {
        audio.addEventListener('loadedmetadata', () => resolve());
      });
      
      // Create a new song object
      const newSong: Song = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        artist: 'Local File',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273c6f7af36eccd256764e0a9f6', // Default artwork
        duration: Math.round(audio.duration),
        source: fileUrl
      };
      
      setCustomSongs(prev => [...prev, newSong]);
      
      // Automatically play the new song
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
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error adding song:", error);
      toast({
        title: "Error",
        description: "Failed to add song. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Set profile and update EQ settings based on age
  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    
    // Update EQ settings based on age
    const newEQSettings = getEQSettingsByAge(newProfile.age, newProfile.gender);
    setEQSettings(newEQSettings);
    
    // Mark user as signed up
    setIsSignedUp(true);
    
    // Save profile to localStorage
    localStorage.setItem('audioPersonaProfile', JSON.stringify(newProfile));
  };

  // Update profile partially
  const updateProfile = (partialProfile: Partial<UserProfile>) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      ...partialProfile,
      updatedAt: new Date().toISOString()
    };
    
    setProfileState(updatedProfile);
    
    // Update EQ settings if age or gender changed
    if (partialProfile.age || partialProfile.gender) {
      const newEQSettings = getEQSettingsByAge(
        updatedProfile.age, 
        updatedProfile.gender
      );
      setEQSettings(newEQSettings);
    }
    
    // Save updated profile to localStorage
    localStorage.setItem('audioPersonaProfile', JSON.stringify(updatedProfile));
    
    toast({
      title: "Profile Updated",
      description: "Your audio profile has been updated with new settings."
    });
  };

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('audioPersonaProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileState(parsedProfile);
      setEQSettings(getEQSettingsByAge(parsedProfile.age, parsedProfile.gender));
      setIsSignedUp(true);
    }
  }, []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Event listeners for audio element
    const onEnded = () => {
      nextSong();
    };
    
    const onTimeUpdate = () => {
      if (audioRef.current) {
        setPlayerState(prev => ({
          ...prev,
          currentTime: Math.floor(audioRef.current!.currentTime)
        }));
      }
    };
    
    const onLoadedMetadata = () => {
      if (audioRef.current) {
        const duration = Math.floor(audioRef.current.duration);
        if (currentSong) {
          // Update the song's duration with actual duration
          const updatedSongs = songs.map(song => 
            song.id === currentSong.id ? { ...song, duration } : song
          );
          if (customSongs.some(song => song.id === currentSong.id)) {
            setCustomSongs(customSongs.map(song => 
              song.id === currentSong.id ? { ...song, duration } : song
            ));
          }
        }
      }
    };
    
    const audio = audioRef.current;
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.pause();
      audio.src = '';
    };
  }, []);
  
  // Handle song changes and play/pause
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    
    // If current song changes or source changes, load new source
    if (audioRef.current.src !== currentSong.source) {
      audioRef.current.src = currentSong.source;
      audioRef.current.load();
    }
    
    // Handle play/pause
    if (playerState.isPlaying) {
      const playPromise = audioRef.current.play();
      
      // Handle play promise to avoid DOMException
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio play error:", error);
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
          toast({
            title: "Playback Error",
            description: "There was an error playing this audio file.",
            variant: "destructive"
          });
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [currentSong, playerState.isPlaying]);
  
  // Handle volume and mute changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Apply volume settings
    audioRef.current.volume = playerState.isMuted ? 0 : playerState.volume / 100;
  }, [playerState.volume, playerState.isMuted]);

  // Generate waveform data when song is playing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (playerState.isPlaying && audioRef.current) {
      interval = setInterval(() => {
        // Generate random waveform data that somewhat correlates to volume
        const baseAmplitude = audioRef.current?.volume || 0.5;
        const newWaveformData = Array(30).fill(0).map(() => 
          Math.min(Math.random() * baseAmplitude * 1.5 + 0.2, 1)
        );
        setWaveformData(newWaveformData);
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [playerState.isPlaying]);

  const togglePlayPause = () => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const nextSong = () => {
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const nextIndex = (currentIndex + 1) % songs.length;
    
    setPlayerState(prev => ({
      ...prev,
      currentSongId: songs[nextIndex].id,
      currentTime: 0,
      isPlaying: true
    }));
  };

  const prevSong = () => {
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    
    setPlayerState(prev => ({
      ...prev,
      currentSongId: songs[prevIndex].id,
      currentTime: 0,
      isPlaying: true
    }));
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    setPlayerState(prev => ({ ...prev, volume, isMuted: false }));
  };

  const toggleMute = () => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const setVoiceCommand = (command: string) => {
    setVoiceCommandText(command);
    setProcessingVoice(true);
    
    // Add to command history
    const newCommand: VoiceCommand = {
      text: command,
      timestamp: new Date().toISOString(),
      processed: false
    };
    
    setCommandHistory(prev => [newCommand, ...prev].slice(0, 10));
    
    // Process command after a delay
    setTimeout(() => {
      processVoiceCommand(command);
      setProcessingVoice(false);
    }, 1500);
  };

  const toggleVoiceListening = () => {
    setIsVoiceListening(!isVoiceListening);
    if (!isVoiceListening) {
      toast({
        title: "Voice Assistant Activated",
        description: "Listening for commands...",
      });
    }
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Process different voice commands
    if (lowerCommand.includes('play') && !lowerCommand.includes('next') && !lowerCommand.includes('previous')) {
      // Search for specific song
      if (lowerCommand.includes('play ')) {
        const songName = lowerCommand.replace('play ', '').trim();
        const foundSong = songs.find(
          song => song.title.toLowerCase().includes(songName) || 
                 song.artist.toLowerCase().includes(songName)
        );
        
        if (foundSong) {
          setPlayerState(prev => ({ ...prev, currentSongId: foundSong.id, isPlaying: true }));
          toast({
            title: "Playing Song",
            description: `Now playing "${foundSong.title}" by ${foundSong.artist}`,
          });
        } else {
          toast({
            title: "Song Not Found",
            description: `Sorry, I couldn't find "${songName}"`,
            variant: "destructive"
          });
        }
      } else {
        // Just play current song
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
        toast({
          title: "Playback Started",
          description: currentSong ? `Playing "${currentSong.title}"` : "Playing music",
        });
      }
    } else if (lowerCommand.includes('pause')) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      toast({
        title: "Playback Paused",
        description: "Music paused"
      });
    } else if (lowerCommand.includes('next')) {
      nextSong();
      toast({
        title: "Next Track",
        description: "Playing next song"
      });
    } else if (lowerCommand.includes('previous') || lowerCommand.includes('last')) {
      prevSong();
      toast({
        title: "Previous Track",
        description: "Playing previous song"
      });
    } else if (lowerCommand.includes('volume')) {
      // Change volume
      if (lowerCommand.includes('up')) {
        setVolume(Math.min(playerState.volume + 10, 100));
        toast({
          title: "Volume Increased",
          description: `Volume set to ${Math.min(playerState.volume + 10, 100)}%`
        });
      } else if (lowerCommand.includes('down')) {
        setVolume(Math.max(playerState.volume - 10, 0));
        toast({
          title: "Volume Decreased",
          description: `Volume set to ${Math.max(playerState.volume - 10, 0)}%`
        });
      }
    } else {
      toast({
        title: "Command Not Recognized",
        description: "I didn't understand that command",
        variant: "destructive"
      });
    }
    
    // Mark the last command as processed
    setCommandHistory(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[0].processed = true;
      }
      return updated;
    });
  };

  return (
    <AudioContext.Provider value={{
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
      isLoading
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
