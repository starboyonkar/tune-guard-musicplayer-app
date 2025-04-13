import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  EQSettings, 
  Song, 
  PlayerState, 
  VoiceCommand, 
  Playlist,
  WaveformData,
  VisSettings
} from './types';
import { toast } from '@/components/ui/use-toast';

// Sample songs data - update with the new logo
const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: "Blinding Lights",
    artist: 'The Weeknd',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 200,
    source: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
  },
  {
    id: '2',
    title: "Shape of You",
    artist: 'Ed Sheeran',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 234,
    source: 'https://assets.mixkit.co/music/preview/mixkit-dance-with-me-3.mp3'
  },
  {
    id: '3',
    title: "Dance Monkey",
    artist: 'Tones and I',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 210,
    source: 'https://assets.mixkit.co/music/preview/mixkit-uplift-breakbeat-loop-180.mp3'
  },
  {
    id: '4',
    title: "Don't Start Now",
    artist: 'Dua Lipa',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 183,
    source: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3'
  }
];

// Sample playlist data
const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist1',
    name: 'Favorites',
    songs: ['1', '3'],
    createdAt: new Date().toISOString()
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
  waveformData: WaveformData;
  isSignedUp: boolean;
  processingVoice: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  isLoading: boolean;
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, songId: string) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  playPlaylist: (playlistId: string) => void;
  setVisSettings: (settings: Partial<VisSettings>) => void;
  visSettings: VisSettings;
}

const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  volume: 70,
  isMuted: false,
  currentSongId: '1',
  currentPlaylistId: null
};

const defaultWaveformData: WaveformData = {
  original: Array(30).fill(0),
  processed: Array(30).fill(0),
  timeData: Array(30).fill(0),
  frequencyData: Array(30).fill(0)
};

const defaultVisSettings: VisSettings = {
  scale: 1,
  timeScale: 1,
  amplitudeScale: 1,
  showProcessed: true,
  showOriginal: true,
  overlay: true
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
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(true);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [waveformData, setWaveformData] = useState<WaveformData>(defaultWaveformData);
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [processingVoice, setProcessingVoice] = useState<boolean>(false);
  const [customSongs, setCustomSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(SAMPLE_PLAYLISTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visSettings, setVisSettings] = useState<VisSettings>(defaultVisSettings);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const audioGraphSetup = useRef<boolean>(false);

  const songs = [...SAMPLE_SONGS, ...customSongs];
  
  const currentSong = playerState.currentSongId 
    ? songs.find(song => song.id === playerState.currentSongId) 
    : null;

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        analyserNodeRef.current.fftSize = 2048;
        analyserNodeRef.current.smoothingTimeConstant = 0.8;
        
        gainNodeRef.current = audioContextRef.current.createGain();
        
        const bassFilter = audioContextRef.current.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;
        
        const midFilter = audioContextRef.current.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 1000;
        midFilter.Q.value = 1;
        
        const trebleFilter = audioContextRef.current.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.value = 3000;
        
        eqNodesRef.current = [bassFilter, midFilter, trebleFilter];
        
        console.log("Audio context initialized successfully");
      } catch (error) {
        console.error('Error initializing Web Audio API:', error);
        toast({
          title: 'Audio Processing Error',
          description: 'Failed to initialize audio processing.',
          variant: 'destructive'
        });
      }
    }
  };

  const updateEQSettings = () => {
    if (!eqNodesRef.current.length) return;
    
    const [bassFilter, midFilter, trebleFilter] = eqNodesRef.current;
    
    bassFilter.gain.value = (eqSettings.bass - 50) / 5;
    midFilter.gain.value = (eqSettings.mid - 50) / 5;
    trebleFilter.gain.value = (eqSettings.treble - 50) / 5;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = eqSettings.volume / 100;
    }
  };

  const setupAudioGraph = () => {
    if (!audioRef.current || !audioContextRef.current) {
      console.error("Audio element or context not available");
      return;
    }
    
    try {
      if (!audioGraphSetup.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        console.log("Source node created:", sourceNodeRef.current);
        
        const [bassFilter, midFilter, trebleFilter] = eqNodesRef.current;
        
        sourceNodeRef.current.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(gainNodeRef.current!);
        gainNodeRef.current!.connect(analyserNodeRef.current!);
        analyserNodeRef.current!.connect(audioContextRef.current.destination);
        
        audioGraphSetup.current = true;
        console.log("Audio graph setup completed successfully");
      }
      
      updateEQSettings();
    } catch (error) {
      console.error('Error creating audio graph:', error);
    }
  };

  const processAudioFrame = () => {
    if (!analyserNodeRef.current) return;
    
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const timeDataArray = new Uint8Array(bufferLength);
    const frequencyDataArray = new Uint8Array(bufferLength);
    
    analyserNodeRef.current.getByteTimeDomainData(timeDataArray);
    analyserNodeRef.current.getByteFrequencyData(frequencyDataArray);
    
    const downsampleFactor = Math.floor(bufferLength / 30);
    
    const original = Array(30).fill(0).map((_, i) => 
      timeDataArray[i * downsampleFactor] / 256
    );
    
    const processed = Array(30).fill(0).map((_, i) => {
      const value = timeDataArray[i * downsampleFactor] / 256;
      
      const bassBoost = (eqSettings.bass - 50) / 100;
      const trebleBoost = (eqSettings.treble - 50) / 100;
      
      if (i < 10) {
        return value * (1 + bassBoost);
      } else if (i >= 20) {
        return value * (1 + trebleBoost);
      }
      return value;
    });
    
    const frequencyData = Array(30).fill(0).map((_, i) => 
      frequencyDataArray[i * downsampleFactor] / 256
    );
    
    setWaveformData({
      original,
      processed,
      timeData: Array.from(timeDataArray).slice(0, 30).map(v => v / 256),
      frequencyData: frequencyData
    });
  };

  useEffect(() => {
    let animationFrameId: number;
    
    const updateAudioData = () => {
      if (playerState.isPlaying && audioContextRef.current && analyserNodeRef.current) {
        processAudioFrame();
      }
      animationFrameId = requestAnimationFrame(updateAudioData);
    };
    
    if (playerState.isPlaying) {
      updateAudioData();
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [playerState.isPlaying, eqSettings]);

  const addSong = async (file: File) => {
    try {
      setIsLoading(true);
      
      const fileUrl = URL.createObjectURL(file);
      
      const audio = new Audio(fileUrl);
      
      await new Promise<void>((resolve) => {
        audio.addEventListener('loadedmetadata', () => resolve());
        audio.addEventListener('error', () => {
          console.error("Error loading audio metadata for file:", file.name);
          resolve();
        });
        
        setTimeout(() => resolve(), 5000);
      });
      
      const newSong: Song = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Local File',
        albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
        duration: Math.round(audio.duration) || 180,
        source: fileUrl
      };
      
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

  useEffect(() => {
    audioRef.current = new Audio();
    initializeAudioContext();
    
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
    audio.addEventListener('error', (e) => {
      console.error("Audio element error:", e);
    });
    
    setupAudioGraph();
    
    setIsVoiceListening(true);
    
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
    
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.pause();
      audio.src = '';
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    
    const newEQSettings = getEQSettingsByAge(newProfile.age, newProfile.gender);
    setEQSettings(newEQSettings);
    
    setIsSignedUp(true);
    
    localStorage.setItem('audioPersonaProfile', JSON.stringify(newProfile));
  };

  const updateProfile = (partialProfile: Partial<UserProfile>) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      ...partialProfile,
      updatedAt: new Date().toISOString()
    };
    
    setProfileState(updatedProfile);
    
    if (partialProfile.age !== undefined || partialProfile.gender !== undefined) {
      const newEQSettings = getEQSettingsByAge(
        updatedProfile.age, 
        updatedProfile.gender
      );
      setEQSettings(newEQSettings);
    }
    
    localStorage.setItem('audioPersonaProfile', JSON.stringify(updatedProfile));
    
    toast({
      title: "Profile Updated",
      description: "Your audio profile has been updated with new settings."
    });
    
    updateEQSettings();
  };

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log("AudioContext resumed successfully");
      }).catch(err => {
        console.error("Failed to resume AudioContext:", err);
      });
    }
    
    if (audioRef.current.src !== currentSong.source) {
      audioRef.current.src = currentSong.source;
      audioRef.current.load();
      
      setupAudioGraph();
    }
    
    if (playerState.isPlaying) {
      const playPromise = audioRef.current.play();
      
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

  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = playerState.isMuted ? 0 : playerState.volume / 100;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = playerState.isMuted ? 0 : playerState.volume / 100;
    }
  }, [playerState.volume, playerState.isMuted]);

  useEffect(() => {
    updateEQSettings();
  }, [eqSettings]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('audioPersonaProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileState(parsedProfile);
        setEQSettings(getEQSettingsByAge(parsedProfile.age, parsedProfile.gender));
        setIsSignedUp(true);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }
  }, []);

  const togglePlayPause = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

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

  const deletePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('audioPersonaPlaylists', JSON.stringify(updatedPlaylists));
    
    if (playerState.currentPlaylistId === playlistId) {
      setPlayerState(prev => ({
        ...prev,
        currentPlaylistId: null
      }));
    }
    
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been removed"
    });
  };

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
      processVoiceCommand(command);
      setProcessingVoice(false);
    }, 1000);
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
    
    if (lowerCommand.includes('play') && !lowerCommand.includes('next') && !lowerCommand.includes('previous')) {
      if (lowerCommand === 'play') {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
        toast({
          title: "Playback Started",
          description: currentSong ? `Playing "${currentSong.title}"` : "Playing music",
        });
      } else if (lowerCommand.includes('play ')) {
        const songName = lowerCommand.replace('play ', '').trim();
        const foundSong = songs.find(
          song => song.title.toLowerCase().includes(songName) || 
                 song.artist.toLowerCase().includes(songName)
        );
        
        if (foundSong) {
          setPlayerState(prev => ({ ...prev, currentSongId: foundSong.id, isPlaying: true, currentTime: 0 }));
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
      }
    } else if (lowerCommand.includes('pause') || lowerCommand.includes('stop')) {
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
    } else if (lowerCommand.includes('previous') || lowerCommand.includes('last') || lowerCommand.includes('back')) {
      prevSong();
      toast({
        title: "Previous Track",
        description: "Playing previous song"
      });
    } else if (lowerCommand.includes('volume')) {
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
      } else if (lowerCommand.includes('mute')) {
        setPlayerState(prev => ({ ...prev, isMuted: true }));
        toast({
          title: "Volume Muted",
          description: "Audio muted"
        });
      } else if (lowerCommand.includes('unmute')) {
        setPlayerState(prev => ({ ...prev, isMuted: false }));
        toast({
          title: "Volume Unmuted",
          description: "Audio unmuted"
        });
      }
    } else if (lowerCommand.includes('voice') || lowerCommand.includes('listen')) {
      if (lowerCommand.includes('off') || lowerCommand.includes('disable') || lowerCommand.includes('stop')) {
        setIsVoiceListening(false);
        toast({
          title: "Voice Assistant Deactivated",
          description: "Voice commands are now disabled"
        });
      } else if (lowerCommand.includes('on') || lowerCommand.includes('enable') || lowerCommand.includes('start')) {
        setIsVoiceListening(true);
        toast({
          title: "Voice Assistant Activated", 
          description: "Listening for commands..."
        });
      } else {
        toggleVoiceListening();
      }
    } else {
      toast({
        title: "Command Not Recognized",
        description: "I didn't understand that command",
        variant: "destructive"
      });
    }
    
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
      isLoading,
      playlists,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      playPlaylist,
      setVisSettings: (newSettings) => setVisSettings(prev => ({ ...prev, ...newSettings })),
      visSettings
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
