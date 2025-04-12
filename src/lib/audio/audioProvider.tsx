
import React, { createContext, useContext } from 'react';
import { useAudio } from './useAudio';
import { 
  UserProfile, 
  EQSettings, 
  Song, 
  PlayerState, 
  VoiceCommand, 
  Playlist,
  WaveformData,
  VisSettings
} from '../types';

// Define the context type
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
}

// Create the context
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Create the provider component
export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioData = useAudio();
  
  return (
    <AudioContext.Provider value={audioData}>
      {children}
    </AudioContext.Provider>
  );
};

// Export the context hook
export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
