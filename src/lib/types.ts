
export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  dob: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  createdAt: string;
  updatedAt?: string;
  preferences: string[];
  listeningMetrics: {
    totalListeningTime: number;
    sessionsCount: number;
    averageSessionDuration: number;
    highVolumeTime: number;
    safeVolumeTime: number;
    sessions: Array<{
      date: string;
      duration: number;
      volume: number;
    }>;
  };
  safetyScore: number;
}

export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
  volume: number;
  preAmp: number;
  enabled: boolean;
  preset: string;
  presence: number;
  warmth: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  source: string;
  originalFileName?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  muted: boolean;
  currentSongId: string | null;
  currentPlaylistId: string | null;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

export interface VoiceCommand {
  text: string;
  timestamp: string;
  processed: boolean;
  recognized: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface WaveformData {
  original: number[];
  processed: number[];
  timeData: number[];
  frequencyData: number[];
}

export interface VisSettings {
  scale: number;
  timeScale: number;
  amplitudeScale: number;
  showProcessed: boolean;
  showOriginal: boolean;
  overlay: boolean;
  mode: string;
  color: string;
  sensitivity: number;
  showPeaks: boolean;
}

export interface VoiceCommandPanelState {
  isListening: boolean;
  transcript: string;
  isOpen: boolean;
  mode: 'listening' | 'help' | 'profile';
}

export interface SirenDetectionSettings {
  enabled: boolean;
  sensitivity: number;
  autoLower: boolean;
  targetVolume: number;
  autoResume: boolean;
  pauseDuration: number;
}
