
import { ReactNode } from 'react';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer not to say';
  hearingLevel: 'normal' | 'mild' | 'moderate' | 'severe';
  preferredEnvironment: string;
  eqPreferences?: EQSettings;
  safetyPreferences?: SafetyPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
  volume: number;
}

export interface VoiceCommand {
  text: string;
  timestamp: string;
  processed: boolean;
  recognized: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  duration: number;
  source: string;
  originalFileName?: string;
}

export interface WaveformData {
  original: number[];
  processed: number[];
  timeData: number[];
  frequencyData: number[];
}

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

export interface SirenDetection {
  isEnabled: boolean;
  sensitivity: number;
  lastDetection: string | null;
  detectionCount: number;
  detectionThreshold: number;
  isSirenDetected: boolean;
  isCalibrating: boolean;
  resultCallback?: (result: SirenDetectionResult) => void;
  notificationType: 'visual' | 'audio' | 'both';
}

export interface SirenDetectionResult {
  detected: boolean;
  confidence: number;
  timestamp: string;
  audioFeatures?: {
    dominantFrequency: number;
    amplitude: number;
    duration: number;
  };
}

export interface SafetyPreferences {
  maxVolume: number;
  sirenDetectionEnabled: boolean;
  sirenNotificationType: 'visual' | 'audio' | 'both';
  environmentalAwarenessLevel: 'low' | 'medium' | 'high';
  hearingProtectionEnabled: boolean;
  hearingProtectionThreshold: number;
}

export interface VisSettings {
  scale: number;
  timeScale: number;
  amplitudeScale: number;
  showProcessed: boolean;
  showOriginal: boolean;
  overlay: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  songs: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: ReactNode;
}
