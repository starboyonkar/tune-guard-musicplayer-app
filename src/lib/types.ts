
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
};

export type PlayerState = {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  currentSongId: string | null;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  muted: boolean;
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
};

export type VoiceCommandPanelState = {
  isListening: boolean;
  transcript: string;
  isOpen: boolean;
  mode: 'listening' | 'commands' | 'help';
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
  safetyScoreHistory: {
    date: string;
    score: number;
  }[];
};

// Toast type extension for ID property
export interface ToastWithId {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  id?: string;
}
