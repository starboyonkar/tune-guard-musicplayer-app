import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { UserProfile, PlayerState, Song, WaveformData } from './types';
import { Howl } from 'howler';
import { toast } from '@/components/ui/use-toast';

interface AudioContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  playerState: PlayerState;
  setPlayerState: (playerState: PlayerState) => void;
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  audio: Howl | null;
  setAudio: (audio: Howl | null) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (volume: number) => void;
  setSeek: (seek: number) => void;
  voiceCommand: string;
  setVoiceCommand: (command: string) => void;
  isVoiceListening: boolean;
  toggleVoiceListening: () => void;
  waveform: WaveformData;
  logout: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isLoading: false,
    volume: 0.5,
    seek: 0,
    duration: 0,
    isMuted: false,
    playbackRate: 1,
    isLooping: false,
    shuffle: false,
  });
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [audio, setAudio] = useState<Howl | null>(null);
  const [voiceCommand, setVoiceCommand] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
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

  // Fix the waveform data generation
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
        processed: emptyData // Include processed property
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
      processed: new Uint8Array(dataArray) // Include processed property
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveform(generateWaveformData());
    }, 50); // Update every 50ms for smooth visuals

    return () => clearInterval(interval);
  }, [generateWaveformData]);

  const togglePlayPause = () => {
    if (!audio) return;

    if (playerState.isPlaying) {
      audio.pause();
      setPlayerState({ ...playerState, isPlaying: false });
    } else {
      audio.play();
      setPlayerState({ ...playerState, isPlaying: true });
    }
  };

  const nextSong = () => {
    // Placeholder for next song logic
    showToast('Next Song', 'Playing next song');
  };

  const prevSong = () => {
    // Placeholder for previous song logic
    showToast('Previous Song', 'Playing previous song');
  };

  const setVolume = (volume: number) => {
    if (!audio) return;
    audio.volume(volume);
    setPlayerState({ ...playerState, volume });
  };

  const setSeek = (seek: number) => {
    if (!audio) return;
    audio.seek(seek);
    setPlayerState({ ...playerState, seek });
  };

  const toggleVoiceListening = () => {
    setIsVoiceListening(!isVoiceListening);
  };

  const logout = () => {
    setProfile(null);
    setPlayerState({
      isPlaying: false,
      isLoading: false,
      volume: 0.5,
      seek: 0,
      duration: 0,
      isMuted: false,
      playbackRate: 1,
      isLooping: false,
      shuffle: false,
    });
    setCurrentSong(null);
    setAudio(null);
    setVoiceCommand('');
    setIsVoiceListening(false);
    localStorage.removeItem('userProfile');
    showToast('Logged Out', 'You have been successfully logged out.');
  };

  // Fix toast calls by removing id property
  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    toast({
      title,
      description,
      variant
    });
  };

  // Fix the safety score update
  const updateSafetyScore = useCallback((newScore: number) => {
    if (profileRef.current) {
      profileRef.current.safetyScore = Math.max(0, Math.min(100, newScore));
      setProfile({ ...profileRef.current });
    }
  }, []);

  const profileRef = useRef(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const value: AudioContextType = {
    profile,
    setProfile,
    playerState,
    setPlayerState,
    currentSong,
    setCurrentSong,
    audio,
    setAudio,
    togglePlayPause,
    nextSong,
    prevSong,
    setVolume,
    setSeek,
    voiceCommand,
    setVoiceCommand,
    isVoiceListening,
    toggleVoiceListening,
    waveform,
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
