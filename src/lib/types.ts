
// Adding these types to support the enhanced features

export type UserProfile = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  dob: string;
  createdAt: string;
  preferences?: string[];
  listeningMetrics?: ListeningMetrics;
  safetyScore?: number;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  duration: number;
  source: string;
  playCount?: number;
  lastPlayed?: string;
  safetyRating?: number;
  originalFileName?: string; // Added to fix type error
};

export type PlayerState = {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  currentSongId: string | null;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  muted: boolean; // This was called isMuted in some places
  currentPlaylistId?: string | null; // Added to fix type errors
};

export type AudioContextType = {
  isInitialized: boolean;
  isSignedUp: boolean;
  songs: Song[];
  currentSong: Song | null;
  playerState: PlayerState;
  profile: UserProfile | null;
  eqSettings: EQSettings;
  sirenDetection: SirenDetectionSettings;
  hearingProtection: HearingProtectionSettings;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  playSong: (id: string) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextSong: () => void;
  prevSong: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addSong: (file: File) => void;
  removeSong: (id: string) => void;
  updateEQSettings: (settings: Partial<EQSettings>) => void;
  updateSirenDetection: (settings: Partial<SirenDetectionSettings>) => void;
  updateHearingProtection: (settings: Partial<HearingProtectionSettings>) => void;
  setPlayerState: (state: Partial<PlayerState> | ((prevState: PlayerState) => Partial<PlayerState>)) => void;
  getHearingSafetyScore: () => number;
};

export type EQSettings = {
  bass: number;
  mid: number;
  treble: number;
  preAmp: number;
  enabled: boolean;
  preset: string;
  volume?: number;
  presence?: number;
  warmth?: number;
};

export type SirenDetectionSettings = {
  enabled: boolean;
  sensitivity: number;
  autoResume: boolean;
  pauseDuration: number;
};

export type HearingProtectionSettings = {
  enabled: boolean;
  maxVolume: number;
  warningThreshold: number;
  limitDuration: boolean;
  maxListeningTime: number;
};

export type VoiceCommand = {
  command: string;
  confidence: number;
  timestamp: number;
  processed?: boolean;
  recognized?: boolean;
  text?: string; // Adding this to handle existing code
};

export type VoiceCommandPanelState = {
  isListening: boolean;
  transcript: string;
  isOpen: boolean;
  mode: 'listening' | 'commands' | 'help' | 'profile';
};

export type ListeningSession = {
  startTime: string;
  endTime?: string;
  duration: number;
  averageVolume: number;
  maxVolume: number;
  songs: string[];
};

export type ListeningMetrics = {
  totalListeningTime: number;
  sessionsCount: number;
  averageSessionDuration: number;
  highVolumeTime: number;
  safeVolumeTime: number;
  lastSession?: ListeningSession;
  sessions: ListeningSession[];
  safetyScoreHistory: { date: string; score: number; }[];
};

// Toast type extension with action compatibility for shadcn
export interface ToastWithId {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  id?: string;
}

// Adding missing types for Waveform and Playlist
export type WaveformData = {
  dataArray?: Uint8Array;
  bufferLength?: number;
  timestamp?: number;
  processed?: boolean;
  original?: Uint8Array;
  timeData?: Uint8Array;
  frequencyData?: Uint8Array;
};

export type VisSettings = {
  mode: 'bars' | 'line' | 'circle';
  color: string;
  sensitivity: number;
  showPeaks: boolean;
  scale?: number;
  timeScale?: number;
  amplitudeScale?: number;
  showProcessed?: boolean;
  showOriginal?: boolean;
  overlay?: boolean;
};

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
  modifiedAt?: string;
  coverImage?: string;
};
