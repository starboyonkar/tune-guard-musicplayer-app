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

const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist1',
    name: 'Favorites',
    songs: ['1', '3'],
    createdAt: new Date().toISOString()
  }
];

const getEQSettingsByAge = (age: number, gender: string): EQSettings => {
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
  logout: () => void;
  playSong: (songId: string) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  resetWaveform: () => void;
}

const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  volume: 70,
  isMuted: false,
  currentSongId: '1',
  currentPlaylistId: null,
  shuffleEnabled: false,
  repeatMode: 'off'
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
      return false;
    }
    
    try {
      if (!audioGraphSetup.current) {
        console.log("Setting up audio graph");
        
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch (e) {
            console.log("Error disconnecting old source node:", e);
          }
        }
        
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
      return true;
    } catch (error) {
      console.error('Error creating audio graph:', error);
      toast({
        title: "Audio Setup Error",
        description: "There was a problem setting up audio processing.",
        variant: "destructive"
      });
      return false;
    }
  };

  const processAudioFrame = () => {
    if (!analyserNodeRef.current) return;
    
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const timeDataArray = new Uint8Array(bufferLength);
    const frequencyDataArray = new Uint8Array(bufferLength);
    
    analyserNodeRef.current.getByteTimeDomainData(timeDataArray);
    analyserNodeRef.current.getByteFrequencyData(frequencyDataArray);
    
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const timeStep = bufferLength / sampleRate; // Time in seconds for the whole buffer
    
    const downsampleFactor = Math.floor(bufferLength / 30);
    
    const timeData = Array(30).fill(0).map((_, i) => 
      (i * downsampleFactor / sampleRate) * 1000 // Convert to milliseconds
    );
    
    const original = Array(30).fill(0).map((_, i) => 
      (timeDataArray[i * downsampleFactor] / 128.0) - 1.0
    );
    
    const processed = Array(30).fill(0).map((_, i) => {
      const value = (timeDataArray[i * downsampleFactor] / 128.0) - 1.0;
      
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
      timeData,
      frequencyData
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
      
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => resolve());
        audio.addEventListener('error', (e) => {
          console.error("Error loading audio metadata for file:", file.name, e);
          reject(e);
        });
        
        setTimeout(() => resolve(), 5000);
      });
      
      const newSong: Song = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'TUNE GUARD',
        albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
        duration: Math.round(audio.duration) || 180,
        source: fileUrl
      };
      
      setCustomSongs(prevSongs => [...prevSongs, newSong]);
      
      setPlayerState(prevState => ({
        ...prevState,
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

  useEffect(() => {
    audioRef.current = new Audio();
    initializeAudioContext();
    
    const onEnded = () => {
      nextSong();
    };
    
    const onTimeUpdate = () => {
      if (audioRef.current) {
        setPlayerState(prevState => ({
          ...prevState,
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
    
    const onPlaySong = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { songId } = customEvent.detail;
      
      setPlayerState(prevState => ({
        ...prevState,
        currentSongId: songId,
        currentTime: 0,
        isPlaying: true
      }));
    };
    
    const audio = audioRef.current;
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', (e) => {
      console.error("Audio element error:", e);
      toast({
        title: "Audio Error",
        description: "Error playing audio file. Trying next song...",
        variant: "destructive"
      });
      setTimeout(() => nextSong(), 1000);
    });
    
    document.addEventListener('play-song', onPlaySong);
    
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
      document.removeEventListener('play-song', onPlaySong);
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
    
    console.log("Current song changed:", currentSong);
    
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log("AudioContext resumed successfully");
      }).catch(err => {
        console.error("Failed to resume AudioContext:", err);
      });
    }
    
    if (audioRef.current.src !== currentSong.source) {
      console.log("Setting audio source to:", currentSong.source);
      audioRef.current.src = currentSong.source;
      audioRef.current.load();
      
      if (!audioGraphSetup.current) {
        console.log("Setting up audio graph for the first time");
        setupAudioGraph();
      }
    }
    
    audioRef.current.oncanplaythrough = () => {
      console.log("Audio can play through");
      
      if (playerState.isPlaying) {
        console.log("Starting playback");
        const playPromise = audioRef.current!.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio play error:", error);
            setPlayerState(prevState => ({ ...prevState, isPlaying: false }));
            toast({
              title: "Playback Error",
              description: "There was an error playing this song.",
              variant: "destructive"
            });
          });
        }
      } else {
        audioRef.current!.pause();
      }
      
      audioRef.current!.oncanplaythrough = null;
    };
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
    
    setPlayerState(prevState => {
      const newIsPlaying = !prevState.isPlaying;
      
      if (audioRef.current) {
        if (newIsPlaying) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            toast({
              title: "Playback Error",
              description: "There was an error playing this song.",
              variant: "destructive"
            });
            return prevState; // Don't update state if play fails
          });
        } else {
          audioRef.current.pause();
        }
      }
      
      return { ...prevState, isPlaying: newIsPlaying };
    });
  };

  const nextSong = () => {
    if (playerState.currentPlaylistId) {
      const currentPlaylist = playlists.find(p => p.id === playerState.currentPlaylistId);
      if (currentPlaylist) {
        const currentSongIndex = currentPlaylist.songs.findIndex(id => id === playerState.currentSongId);
        let nextIndex;
        
        if (playerState.shuffleEnabled) {
          const availableSongs = currentPlaylist.songs.filter(id => id !== playerState.currentSongId);
          if (availableSongs.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableSongs.length);
            const nextSongId = availableSongs[randomIndex];
            
            setPlayerState(prevState => ({
              ...prevState,
              currentSongId: nextSongId,
              currentTime: 0,
              isPlaying: true
            }));
            return;
          }
        }
        
        nextIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
        const nextSongId = currentPlaylist.songs[nextIndex];
        
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: nextSongId,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    if (playerState.shuffleEnabled) {
      const availableSongs = songs.filter(song => song.id !== playerState.currentSongId);
      if (availableSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        const nextSong = availableSongs[randomIndex];
        
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: nextSong.id,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const nextIndex = (currentIndex + 1) % songs.length;
    
    setPlayerState(prevState => ({
      ...prevState,
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
        
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: prevSongId,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    
    setPlayerState(prevState => ({
      ...prevState,
      currentSongId: songs[prevIndex].id,
      currentTime: 0,
      isPlaying: true
    }));
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prevState => ({ ...prevState, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    setPlayerState(prevState => ({ ...prevState, volume, isMuted: false }));
  };

  const toggleMute = () => {
    setPlayerState(prevState => ({ ...prevState, isMuted: !prevState.isMuted }));
  };

  const logout = () => {
    setProfileState(null);
    setIsSignedUp(false);
    localStorage.removeItem('audioPersonaProfile');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
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

  const playSong = (songId: string) => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (playerState.currentSongId === songId) {
      setPlayerState(prevState => ({
        ...prevState,
        isPlaying: !prevState.isPlaying
      }));
      
      if (audioRef.current) {
        if (playerState.isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            toast({
              title: "Playback Error",
              description: "Failed to play audio",
              variant: "destructive"
            });
          });
        }
      }
    } else {
      setPlayerState(prevState => ({
        ...prevState,
        currentSongId: songId,
        currentTime: 0,
        isPlaying: true
      }));
    }
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
    setIsVoiceListening(prev => !prev);
    if (!isVoiceListening) {
      toast({
        title: "Voice Assistant Activated",
        description: "Listening for commands...",
      });
    }
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    let commandRecognized = false;
    
    const playCommands = ['play', 'start', 'begin', 'resume'];
    const pauseCommands = ['pause', 'stop', 'halt', 'wait'];
    const nextCommands = ['next', 'skip', 'forward', 'advance'];
    const prevCommands = ['previous', 'last', 'back', 'backward', 'earlier', 'return'];
    const volumeUpCommands = ['volume up', 'louder', 'increase volume', 'turn it up'];
    const volumeDownCommands = ['volume down', 'lower', 'decrease volume', 'quieter', 'turn it down'];
    const muteCommands = ['mute', 'silence', 'quiet', 'no sound'];
    const unmuteCommands = ['unmute', 'sound on', 'enable sound'];
    const playlistCommands = ['playlist', 'play list', 'list'];
    const shuffleOnCommands = ['shuffle', 'shuffle on', 'random', 'mix'];
    const shuffleOffCommands = ['shuffle off', 'no shuffle', 'sequential'];
    const repeatAllCommands = ['repeat all', 'repeat playlist', 'loop all'];
    const repeatOneCommands = ['repeat one', 'repeat song', 'loop one', 'loop song'];
    const repeatOffCommands = ['repeat off', 'no repeat', 'stop repeating'];
    const profileCommands = ['profile', 'edit profile', 'edit account', 'user settings', 'account settings'];
    const addSongCommands = ['add song', 'upload song', 'new song', 'browse file', 'add music'];
    const closeCommands = ['close', 'back', 'return', 'exit', 'dismiss', 'cancel'];
    const resetWaveformCommands = ['reset waveform', 'clear waveform', 'restart visualization'];
    const logoutCommands = ['logout', 'log out', 'sign out', 'exit app', 'end session'];
    
    const bassCommands = ['more bass', 'increase bass', 'boost bass', 'bass up'];
    const lessBassCommands = ['less bass', 'decrease bass', 'reduce bass', 'bass down'];
    const trebleCommands = ['more treble', 'increase treble', 'boost treble', 'treble up'];
    const lessTrebleCommands = ['less treble', 'decrease treble', 'reduce treble', 'treble down'];
    const presenceCommands = ['more presence', 'increase presence', 'boost presence', 'presence up'];
    const warmthCommands = ['more warmth', 'increase warmth', 'warmer', 'warmth up'];
    
    const matchesCommand = (cmd: string, variations: string[]) => {
      return variations.some(variation => cmd.includes(variation));
    };
    
    if (matchesCommand(lowerCommand, playCommands)) {
      commandRecognized = true;
      
      if (lowerCommand === 'play' || lowerCommand === 'start' || lowerCommand === 'resume') {
        setPlayerState(prevState => ({ ...prevState, isPlaying: true }));
        toast({
          title: "Playback Started",
          description: currentSong ? `Playing "${currentSong.title}"` : "Playing music",
        });
      } else {
        const searchTerm = lowerCommand.replace(/play |start |begin /i, '').trim();
        if (searchTerm) {
          const foundSong = songs.find(
            song => song.title.toLowerCase().includes(searchTerm) || 
                  song.artist.toLowerCase().includes(searchTerm)
          );
          
          if (foundSong) {
            setPlayerState(prevState => ({ ...prevState, currentSongId: foundSong.id, isPlaying: true, currentTime: 0 }));
            toast({
              title: "Playing Song",
              description: `Now playing "${foundSong.title}" by ${foundSong.artist}`,
            });
          } else {
            const foundPlaylist = playlists.find(pl => pl.name.toLowerCase().includes(searchTerm));
            if (foundPlaylist && foundPlaylist.songs.length > 0) {
              playPlaylist(foundPlaylist.id);
            } else {
              toast({
                title: "Not Found",
                description: `Sorry, I couldn't find "${searchTerm}"`,
                variant: "destructive"
              });
            }
          }
        }
      }
    } else if (matchesCommand(lowerCommand, pauseCommands)) {
      commandRecognized = true;
      setPlayerState(prevState => ({ ...prevState, isPlaying: false }));
      toast({
        title: "Playback Paused",
        description: "Music paused"
      });
    } else if (matchesCommand(lowerCommand, nextCommands)) {
      commandRecognized = true;
      nextSong();
      toast({
        title: "Next Track",
        description: "Playing next song"
      });
    } else if (matchesCommand(lowerCommand, prevCommands)) {
      commandRecognized = true;
      prevSong();
      toast({
        title: "Previous Track",
        description: "Playing previous song"
      });
    } else if (matchesCommand(lowerCommand, volumeUpCommands)) {
      commandRecognized = true;
      setVolume(Math.min(playerState.volume + 10, 100));
      toast({
        title: "Volume Increased",
        description: `Volume set to ${Math.min(playerState.volume + 10, 100)}%`
      });
    } else if (matchesCommand(lowerCommand, volumeDownCommands)) {
      commandRecognized = true;
      setVolume(Math.max(playerState.volume - 10, 0));
      toast({
        title: "Volume Decreased",
        description: `Volume set to ${Math.max(playerState.volume - 10, 0)}%`
      });
    } else if (matchesCommand(lowerCommand, muteCommands)) {
      commandRecognized = true;
      setPlayerState(prevState => ({ ...prevState, isMuted: true }));
      toast({
        title: "Volume Muted",
        description: "Audio muted"
      });
    } else if (matchesCommand(lowerCommand, unmuteCommands)) {
      commandRecognized = true;
      setPlayerState(prevState => ({ ...prevState, isMuted: false }));
      toast({
        title: "Volume Unmuted",
        description: "Audio unmuted"
      });
    } else if (matchesCommand(lowerCommand, playlistCommands)) {
      commandRecognized = true;
      const playlistName = lowerCommand.replace(/playlist |play list |list /i, '').trim();
      if (playlistName) {
        const foundPlaylist = playlists.find(pl => pl.name.toLowerCase().includes(playlistName));
        if (foundPlaylist) {
          playPlaylist(foundPlaylist.id);
          toast({
            title: "Playing Playlist",
            description: `Playing playlist "${foundPlaylist.name}"`
          });
        } else {
          toast({
            title: "Playlist Not Found",
            description: `Couldn't find a playlist named "${playlistName}"`,
            variant: "destructive"
          });
        }
      } else {
        const playlistNames = playlists.map(pl => pl.name).join(", ");
        toast({
          title: "Available Playlists",
          description: playlistNames || "No playlists available"
        });
      }
    } else if (matchesCommand(lowerCommand, bassCommands)) {
      commandRecognized = true;
      setEQSettings(prevSettings => ({
        ...prevSettings,
        bass: Math.min(prevSettings.bass + 10, 100)
      }));
      toast({
        title: "Bass Increased",
        description: "Bass level increased"
      });
    } else if (matchesCommand(lowerCommand, lessBassCommands)) {
      commandRecognized = true;
      setEQSettings(prevSettings => ({
        ...prevSettings,
        bass: Math.max(prevSettings.bass - 10, 0)
      }));
      toast({
        title: "Bass Decreased",
        description: "Bass level decreased"
      });
    } else if (matchesCommand(lowerCommand, trebleCommands)) {
      commandRecognized = true;
      setEQSettings(prevSettings => ({
        ...prevSettings,
        treble: Math.min(prevSettings.treble + 10, 100)
      }));
      toast({
        title: "Treble Increased",
        description: "Treble level increased"
      });
    } else if (matchesCommand(lowerCommand, lessTrebleCommands)) {
      commandRecognized = true;
      setEQSettings(prevSettings => ({
        ...prevSettings,
        treble: Math.max(prevSettings.treble - 10, 0)
      }));
      toast({
        title: "Treble Decreased",
        description: "Treble level decreased"
      });
    } else if (matchesCommand(lowerCommand, presenceCommands)) {
      commandRecognized = true;
      setEQSettings(prevSettings => ({
        ...prevSettings,
        presence: Math.min((prevSettings.presence || 50) + 10, 100)
      }));
      toast({
        title: "Presence Increased",
        description: "Audio presence increased"
      });
    } else if (matchesCommand(lowerCommand, warmthCommands)) {
      commandRecognized = true;
      setEQSettings(prevSettings => ({
        ...prevSettings,
        warmth: Math.min((prevSettings.warmth || 50) + 10, 100)
      }));
      toast({
        title: "Warmth Increased",
        description: "Audio warmth increased"
      });
    } else if (lowerCommand.includes('voice') || lowerCommand.includes('listen')) {
      commandRecognized = true;
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
    } else if (matchesCommand(lowerCommand, logoutCommands)) {
      commandRecognized = true;
      toast({
        title: "Logging out",
        description: "Signing out of your account..."
      });
      setTimeout(() => logout(), 1000);
    } else if (matchesCommand(lowerCommand, profileCommands)) {
      commandRecognized = true;
      const event = new CustomEvent('open-profile-editor');
      document.dispatchEvent(event);
      toast({
        title: "Profile Editor",
        description: "Opening profile editor"
      });
    } else if (matchesCommand(lowerCommand, addSongCommands)) {
      commandRecognized = true;
      const event = new CustomEvent('trigger-file-upload');
      document.dispatchEvent(event);
      toast({
        title: "Add Song",
        description: "Opening file browser"
      });
    } else if (matchesCommand(lowerCommand, closeCommands)) {
      commandRecognized = true;
      const event = new CustomEvent('close-active-panel');
      document.dispatchEvent(event);
      toast({
        title: "Closed",
        description: "Closing current view"
      });
    } else if (matchesCommand(lowerCommand, resetWaveformCommands)) {
      commandRecognized = true;
      resetWaveform();
    } else if (lowerCommand.includes('eq') || lowerCommand.includes('equalizer')) {
      commandRecognized = true;
      toast({
        title: "Equalizer Settings",
        description: "Try 'more bass', 'less treble' or specific EQ commands"
      });
    } else if (lowerCommand.includes('help')) {
      commandRecognized = true;
      const event = new CustomEvent('show-command-reference');
      document.dispatchEvent(event);
      toast({
        title: "Help",
        description: "Showing available commands"
      });
    }
    
    if (!commandRecognized) {
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

  useEffect(() => {
    if (!audioRef.current) return;
    
    const handleEnded = () => {
      if (playerState.repeatMode === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.error("Error restarting song:", err));
        }
      } else if (playerState.repeatMode === 'all' || playerState.shuffleEnabled) {
        nextSong();
      } else {
        const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
        if (currentIndex < songs.length - 1) {
          nextSong();
        } else {
          setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
          
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }
      }
    };
    
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [playerState.repeatMode, playerState.shuffleEnabled, playerState.currentSongId, songs]);

  const toggleShuffle = () => {
    setPlayerState(prevState => ({
      ...prevState,
      shuffleEnabled: !prevState.shuffleEnabled
    }));
    
    toast({
      title: playerState.shuffleEnabled ? "Shuffle Disabled" : "Shuffle Enabled",
      description: playerState.shuffleEnabled ? "Songs will play in order" : "Songs will play in random order"
    });
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(playerState.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    setPlayerState(prevState => ({
      ...prevState,
      repeatMode: nextMode
    }));
    
    const messages = {
      off: "Repeat disabled",
      all: "Repeating all songs",
      one: "Repeating current song"
    };
    
    toast({
      title: `Repeat Mode: ${nextMode}`,
      description: messages[nextMode]
    });
  };

  const resetWaveform = () => {
    setWaveformData(defaultWaveformData);
    toast({
      title: "Waveform Reset",
      description: "Waveform visualization has been reset"
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
      visSettings,
      logout,
      playSong,
      toggleShuffle,
      toggleRepeat,
      resetWaveform
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
