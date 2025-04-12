
// User Profile Type
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  createdAt: string;
}

// EQ Settings based on age profile
export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
  volume: number;
}

// Song Type
export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  source: string;
}

// Player State
export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  currentSongId: string | null;
}

// Voice Command
export interface VoiceCommand {
  text: string;
  timestamp: string;
  processed: boolean;
}
