// User Profile Type
export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  preferences: string[];
  createdAt: string;
  updatedAt?: string;
}

// EQ Settings based on age profile
export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
  volume: number;
  presence?: number;
  warmth?: number;
}

// Song Type
export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  duration: number;
  source: string;
}

// Playlist Type
export interface Playlist {
  id: string;
  name: string;
  songs: string[];
  createdAt: string;
  updatedAt?: string;
}

// Player State
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  currentSongId: string | null;
  currentPlaylistId: string | null;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

// Voice Command
export interface VoiceCommand {
  text: string;
  timestamp: string;
  processed: boolean;
}

// Waveform Data
export interface WaveformData {
  original: number[];
  processed: number[];
  timeData: number[];
  frequencyData: number[];
}

// Waveform Visualization Settings
export interface VisSettings {
  scale: number;
  timeScale: number;
  amplitudeScale: number;
  showProcessed: boolean;
  showOriginal: boolean;
  overlay: boolean;
}
