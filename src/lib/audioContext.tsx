
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { UserProfile, PlayerState, Song, WaveformData, EQSettings, SirenDetectionSettings, HearingProtectionSettings, VisSettings, Playlist, ListeningSession } from './types';
import { Howl } from 'howler';
import { toast } from '@/components/ui/use-toast';

interface AudioContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  playerState: PlayerState;
  setPlayerState: (playerState: Partial<PlayerState> | ((prevState: PlayerState) => Partial<PlayerState>)) => void;
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  songs: Song[];
  audio: Howl | null;
  setAudio: (audio: Howl | null) => void;
  togglePlayPause: () => void;
  playSong: (id: string) => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addSong: (file: File) => void;
  removeSong: (id: string) => void;
  voiceCommand: string;
  setVoiceCommand: (command: string) => void;
  isVoiceListening: boolean;
  toggleVoiceListening: () => void;
  waveform: WaveformData;
  waveformData: WaveformData;
  eqSettings: EQSettings;
  updateEQSettings: (settings: Partial<EQSettings>) => void;
  setEQSettings: (settings: EQSettings) => void;
  visSettings: VisSettings;
  setVisSettings: (settings: VisSettings) => void;
  resetWaveform: () => void;
  sirenDetection: SirenDetectionSettings;
  updateSirenDetection: (settings: Partial<SirenDetectionSettings>) => void;
  hearingProtection: HearingProtectionSettings;
  updateHearingProtection: (settings: Partial<HearingProtectionSettings>) => void;
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, songId: string) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  playPlaylist: (playlistId: string) => void;
  isLoading: boolean;
  getHearingSafetyScore: () => number;
  logout: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [playerState, setPlayerStateInternal] = useState<PlayerState>({
    isPlaying: false,
    volume: 50,
    currentTime: 0,
    duration: 0,
    currentSongId: null,
    shuffleEnabled: false,
    repeatMode: 'off',
    muted: false,
  });
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([
    {
      id: '1',
      title: 'Sample Song 1',
      artist: 'Demo Artist',
      duration: 180,
      source: '/demo-audio.mp3',
      albumArt: '/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png'
    },
    {
      id: '2', 
      title: 'Sample Song 2',
      artist: 'Demo Artist 2',
      duration: 240,
      source: '/demo-audio-2.mp3',
      albumArt: '/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png'
    }
  ]);
  const [audio, setAudio] = useState<Howl | null>(null);
  const [voiceCommand, setVoiceCommand] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  const [eqSettings, setEQSettings] = useState<EQSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
    preAmp: 0,
    enabled: false,
    preset: 'default'
  });
  
  const [visSettings, setVisSettings] = useState<VisSettings>({
    mode: 'bars',
    color: '#00ffff',
    sensitivity: 50,
    showPeaks: true
  });
  
  const [sirenDetection, setSirenDetection] = useState<SirenDetectionSettings>({
    enabled: false,
    sensitivity: 70,
    autoResume: true,
    pauseDuration: 5
  });
  
  const [hearingProtection, setHearingProtection] = useState<HearingProtectionSettings>({
    enabled: true,
    maxVolume: 80,
    warningThreshold: 75,
    limitDuration: false,
    maxListeningTime: 60
  });

  const [waveform, setWaveform] = useState<WaveformData>({
    dataArray: new Uint8Array(128),
    bufferLength: 128,
    timestamp: Date.now(),
    original: new Uint8Array(128),
    timeData: new Uint8Array(128),
    frequencyData: new Uint8Array(128),
    processed: new Uint8Array(128)
  });
  
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize audio context
  useEffect(() => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
  }, []);

  const generateWaveformData = useCallback((): WaveformData => {
    if (!analyserRef.current) {
      const emptyData = new Uint8Array(128);
      return {
        dataArray: emptyData,
        bufferLength: 128,
        timestamp: Date.now(),
        original: emptyData,
        timeData: emptyData,
        frequencyData: emptyData,
        processed: emptyData
      };
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    return {
      dataArray,
      bufferLength,
      timestamp: Date.now(),
      original: new Uint8Array(dataArray),
      timeData: new Uint8Array(dataArray),
      frequencyData: new Uint8Array(dataArray),
      processed: new Uint8Array(dataArray)
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveform(generateWaveformData());
    }, 50);
    return () => clearInterval(interval);
  }, [generateWaveformData]);

  const setPlayerState = (state: Partial<PlayerState> | ((prevState: PlayerState) => Partial<PlayerState>)) => {
    if (typeof state === 'function') {
      setPlayerStateInternal(prev => ({ ...prev, ...state(prev) }));
    } else {
      setPlayerStateInternal(prev => ({ ...prev, ...state }));
    }
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...profileUpdates });
    }
  };

  const playSong = (id: string) => {
    const song = songs.find(s => s.id === id);
    if (song) {
      setCurrentSong(song);
      setPlayerState({ currentSongId: id, isPlaying: true });
    }
  };

  const togglePlayPause = () => {
    if (!audio) return;
    if (playerState.isPlaying) {
      audio.pause();
      setPlayerState({ isPlaying: false });
    } else {
      audio.play();
      setPlayerState({ isPlaying: true });
    }
  };

  const nextSong = () => {
    const currentIndex = songs.findIndex(s => s.id === playerState.currentSongId);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex].id);
  };

  const prevSong = () => {
    const currentIndex = songs.findIndex(s => s.id === playerState.currentSongId);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    playSong(songs[prevIndex].id);
  };

  const setVolume = (volume: number) => {
    if (audio) {
      audio.volume(volume / 100);
    }
    setPlayerState({ volume });
  };

  const seekTo = (time: number) => {
    if (audio) {
      audio.seek(time);
    }
    setPlayerState({ currentTime: time });
  };

  const toggleMute = () => {
    setPlayerState({ muted: !playerState.muted });
  };

  const toggleShuffle = () => {
    setPlayerState({ shuffleEnabled: !playerState.shuffleEnabled });
  };

  const toggleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(playerState.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setPlayerState({ repeatMode: nextMode });
  };

  const addSong = (file: File) => {
    const url = URL.createObjectURL(file);
    const newSong: Song = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: 'Unknown Artist',
      duration: 0,
      source: url,
      originalFileName: file.name
    };
    setSongs(prev => [...prev, newSong]);
  };

  const removeSong = (id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  const toggleVoiceListening = () => {
    setIsVoiceListening(!isVoiceListening);
  };

  const updateEQSettings = (settings: Partial<EQSettings>) => {
    setEQSettings(prev => ({ ...prev, ...settings }));
  };

  const updateSirenDetection = (settings: Partial<SirenDetectionSettings>) => {
    setSirenDetection(prev => ({ ...prev, ...settings }));
  };

  const updateHearingProtection = (settings: Partial<HearingProtectionSettings>) => {
    setHearingProtection(prev => ({ ...prev, ...settings }));
  };

  const resetWaveform = () => {
    setWaveform(generateWaveformData());
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songIds: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addToPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId 
        ? { ...p, songIds: [...p.songIds, songId], modifiedAt: new Date().toISOString() }
        : p
    ));
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId 
        ? { ...p, songIds: p.songIds.filter(id => id !== songId), modifiedAt: new Date().toISOString() }
        : p
    ));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const playPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && playlist.songIds.length > 0) {
      playSong(playlist.songIds[0]);
    }
  };

  const getHearingSafetyScore = () => {
    return profile?.safetyScore || 100;
  };

  const logout = () => {
    setProfile(null);
    setPlayerState({
      isPlaying: false,
      volume: 50,
      currentTime: 0,
      duration: 0,
      currentSongId: null,
      shuffleEnabled: false,
      repeatMode: 'off',
      muted: false,
    });
    setCurrentSong(null);
    setAudio(null);
    setVoiceCommand('');
    setIsVoiceListening(false);
    localStorage.removeItem('userProfile');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const value: AudioContextType = {
    profile,
    setProfile,
    updateProfile,
    playerState,
    setPlayerState,
    currentSong,
    setCurrentSong,
    songs,
    audio,
    setAudio,
    togglePlayPause,
    playSong,
    nextSong,
    prevSong,
    setVolume,
    seekTo,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addSong,
    removeSong,
    voiceCommand,
    setVoiceCommand,
    isVoiceListening,
    toggleVoiceListening,
    waveform,
    waveformData: waveform,
    eqSettings,
    updateEQSettings,
    setEQSettings,
    visSettings,
    setVisSettings,
    resetWaveform,
    sirenDetection,
    updateSirenDetection,
    hearingProtection,
    updateHearingProtection,
    playlists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    playPlaylist,
    isLoading,
    getHearingSafetyScore,
    logout,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
