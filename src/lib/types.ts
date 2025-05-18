
// User Profile Type
export interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  name: string;
  age: number;
  gender: string;
  preferences?: string[];
  createdAt: string;
  updatedAt?: string;
  dob?: string;
  musicExperience?: string;
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
  originalFileName?: string;
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

// Siren Detection Settings
export interface SirenDetectionSettings {
  enabled: boolean;
  sensitivity: number;
  autoResume: boolean;
  pauseDuration: number;
}

// Voice Command Panel State
export interface VoiceCommandPanelState {
  isOpen: boolean;
  mode: 'help' | 'profile' | null;
}

// Extend AudioContextType to include removeSong
export interface AudioContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  eqSettings: EQSettings;
  setEQSettings: (settings: EQSettings) => void;
  songs: Song[];
  addSong: (file: File) => void;
  removeSong: (songId: string) => void;
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
