
export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  source: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  preferences?: {
    theme?: string;
    volume?: number;
    hearingProtection?: boolean;
  };
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  trackProgress: number;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

export interface AudioContextType {
  playerState: PlayerState;
  audioContext: AudioContext | null;
  currentSong: Song | null;
  songsList: Song[];
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addSong: (song: Song) => void;
  removeSong: (id: string) => void;
  isSignedUp: boolean;
  signUp: (profile: UserProfile) => void;
  logout: () => void;
  profile: UserProfile | null;
}
