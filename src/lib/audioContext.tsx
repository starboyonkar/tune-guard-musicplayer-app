import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  EQSettings, 
  Song, 
  PlayerState, 
  VoiceCommand, 
  Playlist,
  WaveformData,
  VisSettings
} from './types';
import { toast } from '@/hooks/use-toast';
import { matchesVoiceCommand } from '@/lib/utils';
import { autoPlayService } from './autoPlayService';
import { VoiceCommandProcessor } from './voiceCommandProcessor';

const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: "Tune Guard Theme",
    artist: 'Audio Studio',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 200,
    source: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
  },
  {
    id: '2',
    title: "Ambient Melody",
    artist: 'Sound Waves',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 234,
    source: 'https://assets.mixkit.co/music/preview/mixkit-dance-with-me-3.mp3'
  },
  {
    id: '3',
    title: "Digital Harmony",
    artist: 'Music Lab',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 210,
    source: 'https://assets.mixkit.co/music/preview/mixkit-uplift-breakbeat-loop-180.mp3'
  },
  {
    id: '4',
    title: "Serene Waves",
    artist: 'Echo Studio',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 183,
    source: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3'
  }
];

const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist1',
    name: 'Favorites',
    songIds: ['1', '3'],
    createdAt: new Date().toISOString()
  }
];

const getEQSettingsByAge = (age: number, gender: string): EQSettings => {
  const baseSettings = {
    preAmp: 0,
    enabled: true,
    preset: 'custom'
  };

  if (age < 20) {
    return {
      ...baseSettings,
      bass: gender === 'male' ? 75 : 70,
      mid: 65,
      treble: 80,
      volume: 70
    };
  } else if (age < 40) {
    return {
      ...baseSettings,
      bass: 70,
      mid: 70,
      treble: 75,
      volume: 65
    };
  } else if (age < 60) {
    return {
      ...baseSettings,
      bass: 75,
      mid: 75, 
      treble: 65,
      volume: 60
    };
  } else {
    return {
      ...baseSettings,
      bass: 80,
      mid: 70,
      treble: 55,
      volume: 75
    };
  }
};

interface AudioContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  eqSettings: EQSettings;
  setEQSettings: (settings: EQSettings) => void;
  updateEQSettings: (settings: Partial<EQSettings>) => void;
  songs: Song[];
  addSong: (file: File) => void;
  removeSong: (songId: string) => void;
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
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

const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  volume: 70,
  muted: false,
  currentSongId: '1',
  currentPlaylistId: null,
  shuffleEnabled: false,
  repeatMode: 'off'
};

const defaultWaveformData: WaveformData = {
  original: Array(30).fill(0),
  processed: Array(30).fill(0),
  timeData: Array(30).fill(0),
  frequencyData: Array(30).fill(0)
};

const defaultVisSettings: VisSettings = {
  scale: 1,
  timeScale: 1,
  amplitudeScale: 1,
  showProcessed: true,
  showOriginal: true,
  overlay: true,
  mode: 'spectrum',
  color: '#00ff00',
  sensitivity: 0.5,
  showPeaks: true
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [eqSettings, setEQSettings] = useState<EQSettings>({
    bass: 70,
    mid: 70,
    treble: 70,
    volume: 70,
    preAmp: 0,
    enabled: true,
    preset: 'custom'
  });
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [voiceCommand, setVoiceCommandText] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [waveformData, setWaveformData] = useState<WaveformData>(defaultWaveformData);
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [processingVoice, setProcessingVoice] = useState<boolean>(false);
  const [customSongs, setCustomSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(SAMPLE_PLAYLISTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visSettings, setVisSettings] = useState<VisSettings>(defaultVisSettings);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const audioGraphSetup = useRef<boolean>(false);
  const songBufferCache = useRef<Map<string, ArrayBuffer>>(new Map());
  const autoPlayAttempted = useRef<boolean>(false);
  const voiceCommandProcessorRef = useRef<VoiceCommandProcessor | null>(null);
  
  const songs = [...SAMPLE_SONGS, ...customSongs];
  
  const currentSong = playerState.currentSongId 
    ? songs.find(song => song.id === playerState.currentSongId) 
    : null;
    
  // Initialize the voice command processor
  useEffect(() => {
    if (!voiceCommandProcessorRef.current) {
      voiceCommandProcessorRef.current = new VoiceCommandProcessor();
    }
  }, []);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          console.warn("Web Audio API not supported in this browser");
          return false;
        }
        
        audioContextRef.current = new AudioContextClass();
        
        analyserNodeRef.current = audioContextRef.current.createAnalyser();
        analyserNodeRef.current.fftSize = 2048;
        analyserNodeRef.current.smoothingTimeConstant = 0.8;
        
        gainNodeRef.current = audioContextRef.current.createGain();
        
        const bassFilter = audioContextRef.current.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;
        
        const midFilter = audioContextRef.current.createBiquadFilter();
        midFilter.type = 'peaking';
        midFilter.frequency.value = 1000;
        midFilter.Q.value = 1;
        
        const trebleFilter = audioContextRef.current.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.value = 3000;
        
        eqNodesRef.current = [bassFilter, midFilter, trebleFilter];
        
        console.log("Audio context initialized successfully");
        return true;
      } catch (error) {
        console.error('Error initializing Web Audio API:', error);
        toast({
          title: 'Audio Processing Error',
          description: 'Failed to initialize audio processing.',
          variant: 'destructive'
        });
        return false;
      }
    }
    return true;
  };

  const updateEQSettings = (newSettings?: Partial<EQSettings>) => {
    if (newSettings) {
      setEQSettings(prev => ({ ...prev, ...newSettings }));
    }
    
    if (!eqNodesRef.current.length) return;
    
    const [bassFilter, midFilter, trebleFilter] = eqNodesRef.current;
    
    bassFilter.gain.value = (eqSettings.bass - 50) / 5;
    midFilter.gain.value = (eqSettings.mid - 50) / 5;
    trebleFilter.gain.value = (eqSettings.treble - 50) / 5;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = eqSettings.volume / 100;
    }
  };

  const setupAudioGraph = () => {
    if (!audioRef.current || !audioContextRef.current) {
      console.error("Audio element or context not available");
      return false;
    }
    
    try {
      if (!audioGraphSetup.current) {
        console.log("Setting up audio graph");
        
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch (e) {
            console.log("Error disconnecting old source node:", e);
          }
        }
        
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        
        const [bassFilter, midFilter, trebleFilter] = eqNodesRef.current;
        
        sourceNodeRef.current.connect(bassFilter);
        bassFilter.connect(midFilter);
        midFilter.connect(trebleFilter);
        trebleFilter.connect(gainNodeRef.current!);
        gainNodeRef.current!.connect(analyserNodeRef.current!);
        analyserNodeRef.current!.connect(audioContextRef.current.destination);
        
        audioGraphSetup.current = true;
        console.log("Audio graph setup completed successfully");
      }
      
      updateEQSettings();
      return true;
    } catch (error) {
      console.error('Error creating audio graph:', error);
      toast({
        title: "Audio Setup Error",
        description: "There was a problem setting up audio processing. Trying to recover...",
        variant: "destructive"
      });

      setTimeout(() => {
        try {
          audioGraphSetup.current = false;
          setupAudioGraph();
        } catch (e) {
          console.error("Recovery attempt failed:", e);
        }
      }, 1000);
      
      return false;
    }
  };

  const processAudioFrame = () => {
    if (!analyserNodeRef.current) return;
    
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const timeDataArray = new Uint8Array(bufferLength);
    const frequencyDataArray = new Uint8Array(bufferLength);
    
    analyserNodeRef.current.getByteTimeDomainData(timeDataArray);
    analyserNodeRef.current.getByteFrequencyData(frequencyDataArray);
    
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const timeStep = bufferLength / sampleRate; // Time in seconds for the whole buffer
    
    const downsampleFactor = Math.floor(bufferLength / 30);
    
    const timeData = Array(30).fill(0).map((_, i) => 
      (i * downsampleFactor / sampleRate) * 1000 // Convert to milliseconds
    );
    
    const original = Array(30).fill(0).map((_, i) => 
      (timeDataArray[i * downsampleFactor] / 128.0) - 1.0
    );
    
    const processed = Array(30).fill(0).map((_, i) => {
      const value = (timeDataArray[i * downsampleFactor] / 128.0) - 1.0;
      
      const bassBoost = (eqSettings.bass - 50) / 100;
      const trebleBoost = (eqSettings.treble - 50) / 100;
      
      if (i < 10) {
        return value * (1 + bassBoost);
      } else if (i >= 20) {
        return value * (1 + trebleBoost);
      }
      return value;
    });
    
    const frequencyData = Array(30).fill(0).map((_, i) => 
      frequencyDataArray[i * downsampleFactor] / 256
    );
    
    setWaveformData({
      original,
      processed,
      timeData,
      frequencyData
    });
  };

  useEffect(() => {
    let animationFrameId: number;
    let lastFrameTime = 0;
    const frameRate = 30; // Target 30fps for visualization updates
    const frameInterval = 1000 / frameRate;
    
    const updateAudioData = (timestamp: number) => {
      if (playerState.isPlaying && audioContextRef.current && analyserNodeRef.current) {
        // Only update visualization at the target frame rate
        if (timestamp - lastFrameTime >= frameInterval) {
          processAudioFrame();
          lastFrameTime = timestamp;
        }
      }
      animationFrameId = requestAnimationFrame(updateAudioData);
    };
    
    if (playerState.isPlaying) {
      animationFrameId = requestAnimationFrame(updateAudioData);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [playerState.isPlaying, eqSettings]);

  const addSong = async (file: File) => {
    try {
      setIsLoading(true);
      
      const fileReader = new FileReader();
      
      const fileLoadPromise = new Promise<ArrayBuffer>((resolve, reject) => {
        fileReader.onload = () => {
          if (fileReader.result instanceof ArrayBuffer) {
            resolve(fileReader.result);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        fileReader.onerror = () => reject(fileReader.error);
      });
      
      fileReader.readAsArrayBuffer(file);
      
      const arrayBuffer = await fileLoadPromise;
      
      const blob = new Blob([arrayBuffer], { type: file.type });
      const fileUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(fileUrl);
      
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => resolve(), 3000);
        
        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeoutId);
          resolve();
        });
        
        audio.addEventListener('error', (e) => {
          clearTimeout(timeoutId);
          console.error("Error loading audio metadata:", e);
          reject(e);
        });
      });
      
      const songId = `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newSong: Song = {
        id: songId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Unknown Artist',
        albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
        duration: Math.round(audio.duration) || 180,
        source: fileUrl,
        originalFileName: file.name
      };
      
      const songForStorage = {
        ...newSong,
        source: null,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        lastModified: file.lastModified
      };
      
      const updatedCustomSongs = [...customSongs, newSong];
      setCustomSongs(updatedCustomSongs);
      
      try {
        const existingMetadata = localStorage.getItem('tuneGuardSongMetadata') || '[]';
        const songMetadata = JSON.parse(existingMetadata);
        
        songMetadata.push(songForStorage);
        
        localStorage.setItem('tuneGuardSongMetadata', JSON.stringify(songMetadata));
      } catch (error) {
        console.error("Error saving song metadata to localStorage:", error);
      }
      
      try {
        songBufferCache.current.set(songId, arrayBuffer);
        
        const dbRequest = indexedDB.open('TuneGuardSongs', 1);
        
        dbRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('songs')) {
            db.createObjectStore('songs', { keyPath: 'id' });
          }
        };
        
        dbRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['songs'], 'readwrite');
          const objectStore = transaction.objectStore('songs');
          
          const songData = {
            id: songId,
            audioData: arrayBuffer,
            fileName: file.name,
            fileType: file.type,
            dateAdded: new Date().toISOString()
          };
          
          const request = objectStore.add(songData);
          
          request.onsuccess = () => {
            console.log("Song audio data stored successfully in IndexedDB");
          };
          
          request.onerror = (e) => {
            console.error("Error storing song in IndexedDB:", e);
          };
        };
        
        dbRequest.onerror = (event) => {
          console.error("IndexedDB error:", event);
        };
      } catch (dbError) {
        console.error("Error accessing IndexedDB:", dbError);
      }
      
      setPlayerState(prevState => ({
        ...prevState,
        currentSongId: newSong.id,
        currentTime: 0,
        isPlaying: true
      }));
      
      toast({
        title: "Song Added Successfully",
        description: `"${newSong.title}" has been added to your library and saved for future sessions.`,
      });
      
    } catch (error) {
      console.error("Error adding song:", error);
      toast({
        title: "Error Adding Song",
        description: "There was a problem adding your song. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeSong = (songId: string) => {
    if (playerState.currentSongId === songId) {
      if (songs.length > 1) {
        nextSong();
      } else {
        setPlayerState(prevState => ({
          ...prevState,
          isPlaying: false,
          currentSongId: null
        }));
      }
    }
    
    const songToRemove = customSongs.find(song => song.id === songId);
    if (!songToRemove) return;
    
    if (songBufferCache.current.has(songId)) {
      songBufferCache.current.delete(songId);
    }
    
    if (songToRemove.source && songToRemove.source.startsWith('blob:')) {
      URL.revokeObjectURL(songToRemove.source);
    }
    
    const updatedCustomSongs = customSongs.filter(song => song.id !== songId);
    setCustomSongs(updatedCustomSongs);
    
    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      songIds: playlist.songIds.filter(id => id !== songId)
    }));
    setPlaylists(updatedPlaylists);
    
    try {
      const existingMetadata = localStorage.getItem('tuneGuardSongMetadata') || '[]';
      let songMetadata = JSON.parse(existingMetadata);
      songMetadata = songMetadata.filter((song: any) => song.id !== songId);
      localStorage.setItem('tuneGuardSongMetadata', JSON.stringify(songMetadata));
      
      const dbRequest = indexedDB.open('TuneGuardSongs', 1);
      
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['songs'], 'readwrite');
        const objectStore = transaction.objectStore('songs');
        
        const request = objectStore.delete(songId);
        
        request.onsuccess = () => {
          console.log("Song removed from IndexedDB successfully");
        };
        
        request.onerror = (e) => {
          console.error("Error removing song from IndexedDB:", e);
        };
      };
    } catch (error) {
      console.error("Error updating localStorage or IndexedDB:", error);
    }
    
    localStorage.setItem('tuneGuardPlaylists', JSON.stringify(updatedPlaylists));
    
    toast({
      title: "Song Removed",
      description: `"${songToRemove.title}" has been removed from your library.`
    });
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    
    initializeAudioContext();
    
    const loadSavedSongs = async () => {
      try {
        const savedMetadata = localStorage.getItem('tuneGuardSongMetadata');
        if (savedMetadata) {
          const parsedMetadata = JSON.parse(savedMetadata);
          
          if (Array.isArray(parsedMetadata) && parsedMetadata.length > 0) {
            const dbRequest = indexedDB.open('TuneGuardSongs', 1);
            
            dbRequest.onupgradeneeded = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              if (!db.objectStoreNames.contains('songs')) {
                db.createObjectStore('songs', { keyPath: 'id' });
              }
            };
            
            dbRequest.onsuccess = async (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              const recoveredSongs: Song[] = [];
              let loadedCount = 0;
              let errorCount = 0;
              
              for (const songMeta of parsedMetadata) {
                try {
                  const transaction = db.transaction(['songs'], 'readonly');
                  const objectStore = transaction.objectStore('songs');
                  const request = objectStore.get(songMeta.id);
                  
                  request.onsuccess = (e) => {
                    const songData = request.result;
                    
                    if (songData && songData.audioData) {
                      const blob = new Blob([songData.audioData], { type: songData.fileType || 'audio/mpeg' });
                      const url = URL.createObjectURL(blob);
                      
                      songBufferCache.current.set(songMeta.id, songData.audioData);
                      
                      const recoveredSong: Song = {
                        id: songMeta.id,
                        title: songMeta.title || songData.fileName.replace(/\.[^/.]+$/, ""),
                        artist: songMeta.artist || 'Unknown Artist',
                        albumArt: songMeta.albumArt || '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
                        duration: songMeta.duration || 0,
                        source: url,
                        originalFileName: songData.fileName
                      };
                      
                      recoveredSongs.push(recoveredSong);
                      loadedCount++;
                      
                      if (loadedCount + errorCount === parsedMetadata.length) {
                        setCustomSongs(recoveredSongs);
                        
                        if (loadedCount > 0) {
                          toast({
                            title: "Library Loaded",
                            description: `Successfully loaded ${loadedCount} song${loadedCount !== 1 ? 's' : ''} from your library.`
                          });
                        }
                        
                        if (errorCount > 0) {
                          toast({
                            title: "Some Songs Not Loaded",
                            description: `${errorCount} song${errorCount !== 1 ? 's' : ''} could not be loaded from your library.`,
                            variant: "destructive"
                          });
                        }
                      }
                    } else {
                      errorCount++;
                      console.error("Song data not found in IndexedDB:", songMeta.id);
                    }
                  };
                  
                  request.onerror = (e) => {
                    errorCount++;
                    console.error("Error loading song from IndexedDB:", e);
                    
                    if (loadedCount + errorCount === parsedMetadata.length) {
                      setCustomSongs(recoveredSongs);
                    }
                  };
                } catch (error) {
                  errorCount++;
                  console.error("Error processing song:", error);
                }
              }
              
              if (parsedMetadata.length > 0 && recoveredSongs.length === 0) {
                toast({
                  title: "Unable to Load Songs",
                  description: "Your saved songs could not be loaded. Please add them again.",
                  variant: "destructive"
                });
              }
            };
            
            dbRequest.onerror = (event) => {
              console.error("Error opening IndexedDB:", event);
              toast({
                title: "Library Error",
                description: "There was a problem loading your song library.",
                variant: "destructive"
              });
            };
          }
        }
      } catch (error) {
        console.error("Error loading saved songs:", error);
        toast({
          title: "Error Loading Library",
          description: "There was a problem loading your song library.",
          variant: "destructive"
        });
      }
    };
    
    loadSavedSongs();
    
    const onEnded = () => {
      nextSong();
    };
    
    const onTimeUpdate = () => {
      if (audioRef.current) {
        setPlayerState(prevState => ({
          ...prevState,
          currentTime: Math.floor(audioRef.current!.currentTime)
        }));
      }
    };
    
    const onLoadedMetadata = () => {
      if (audioRef.current && currentSong) {
        const duration = Math.floor(audioRef.current.duration);
        
        if (duration && duration !== currentSong.duration) {
          const updatedSongs = songs.map(song => 
            song.id === currentSong.id ? { ...song, duration } : song
          );
          
          if (customSongs.some(song => song.id === currentSong.id)) {
            setCustomSongs(customSongs.map(song => 
              song.id === currentSong.id ? { ...song, duration } : song
            ));
            
            try {
              const existingMetadata = localStorage.getItem('tuneGuardSongMetadata') || '[]';
              let songMetadata = JSON.parse(existingMetadata);
              songMetadata = songMetadata.map((song: any) => 
                song.id === currentSong.id ? { ...song, duration } : song
              );
              localStorage.setItem('tuneGuardSongMetadata', JSON.stringify(songMetadata));
            } catch (error) {
              console.error("Error updating song metadata in localStorage:", error);
            }
          }
        }
      }
    };
    
    const onError = (e: Event) => {
      console.error("Audio element error:", e);
      const currentSongId = playerState.currentSongId;
      
      toast({
        title: "Playback Error",
        description: "There was an error playing this song. Trying to recover...",
        variant: "destructive"
      });
      
      setTimeout(() => {
        if (currentSongId === playerState.currentSongId) {
          nextSong();
        }
      }, 1000);
    };
    
    const onPlaySong = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { songId } = customEvent.detail;
      
      setPlayerState(prevState => ({
        ...prevState,
        currentSongId: songId,
        currentTime: 0,
        isPlaying: true
      }));
    };
    
    const audio = audioRef.current;
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);
    document.addEventListener('play-song', onPlaySong);
    
    setIsVoiceListening(false);
    
    const savedPlaylists = localStorage.getItem('tuneGuardPlaylists');
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists);
        if (Array.isArray(parsedPlaylists)) {
          setPlaylists(parsedPlaylists);
        }
      } catch (error) {
        console.error("Error loading playlists:", error);
      }
    }
    
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
      document.removeEventListener('play-song', onPlaySong);
      
      audio.pause();
      audio.src = '';
      
      customSongs.forEach(song => {
        if (song.source && song.source.startsWith('blob:')) {
          URL.revokeObjectURL(song.source);
        }
      });
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    
    const newEQSettings = getEQSettingsByAge(newProfile.age, newProfile.gender);
    setEQSettings(newEQSettings);
    
    setIsSignedUp(true);
    
    localStorage.setItem('audioPersonaProfile', JSON.stringify(newProfile));
    
    // Prepare audio elements for immediate playback after profile creation
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => {
        console.warn("Could not resume audio context on profile creation:", err);
      });
    }
  };

  const updateProfile = (partialProfile: Partial<UserProfile>) => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      ...partialProfile,
      updatedAt: new Date().toISOString()
    };
    
    setProfileState(updatedProfile);
    
    if (partialProfile.age !== undefined || partialProfile.gender !== undefined) {
      const newEQSettings = getEQSettingsByAge(
        updatedProfile.age, 
        updatedProfile.gender
      );
      setEQSettings(newEQSettings);
    }
    
    localStorage.setItem('audioPersonaProfile', JSON.stringify(updatedProfile));
    
    toast({
      title: "Profile Updated",
      description: "Your audio profile has been updated with new settings."
    });
    
    updateEQSettings();
  };

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    
    console.log("Current song changed:", currentSong);
    
    const resumeAudioContext = async () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
          console.log("AudioContext resumed successfully");
        } catch (err) {
          console.error("Failed to resume AudioContext:", err);
          
          audioContextRef.current = null;
          initializeAudioContext();
        }
      }
    };
    
    resumeAudioContext();
    
    if (!audioGraphSetup.current) {
      console.log("Setting up audio graph for the first time");
      setupAudioGraph();
    }
    
    try {
      if (audioRef.current.src !== currentSong.source) {
        console.log("Setting audio source to:", currentSong.source);
        
        try {
          audioRef.current.src = currentSong.source;
          audioRef.current.load();
        } catch (error) {
          console.error("Error setting audio source:", error);
          toast({
            title: "Playback Error",
            description: "Could not load this song. It may have been from a previous session.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Improved canplaythrough handler with timeout backup
      const playbackTimeout = setTimeout(() => {
        // If we haven't started playing after a reasonable time, force it
        if (playerState.isPlaying && audioRef.current) {
          try {
            console.log("Forcing playback after timeout");
            audioRef.current.play().catch(e => console.error("Forced play error:", e));
          } catch (e) {
            console.error("Timeout force play error:", e);
          }
        }
      }, 2000);
      
      audioRef.current.oncanplaythrough = () => {
        console.log("Audio can play through");
        clearTimeout(playbackTimeout);
        
        if (playerState.isPlaying) {
          console.log("Starting playback");
          const playPromise = audioRef.current!.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Playback started successfully");
              })
              .catch(error => {
                if (error.name === 'NotAllowedError') {
                  console.log("Automatic playback prevented by browser. User interaction required.");
                  // We'll just keep the player state as playing and let the user interact
                } else {
                  console.error("Audio play error:", error);
                  setPlayerState(prevState => ({ ...prevState, isPlaying: false }));
                  toast({
                    title: "Playback Error",
                    description: "There was an error playing this song. Please try again.",
                    variant: "destructive"
                  });
                }
              });
          }
        } else {
          audioRef.current!.pause();
        }
        
        audioRef.current!.oncanplaythrough = null;
      };
    } catch (error) {
      console.error("Error updating current song:", error);
      setTimeout(() => nextSong(), 1000);
    }
  }, [currentSong, playerState.isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const effectiveVolume = playerState.muted ? 0 : playerState.volume / 100;
    
    audioRef.current.volume = effectiveVolume;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = effectiveVolume;
    }
  }, [playerState.volume, playerState.muted]);

  useEffect(() => {
    updateEQSettings();
  }, [eqSettings]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('audioPersonaProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileState(parsedProfile);
        setEQSettings(getEQSettingsByAge(parsedProfile.age, parsedProfile.gender));
        setIsSignedUp(true);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }
  }, []);

  const togglePlayPause = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => {
        console.error("Failed to resume AudioContext:", err);
      });
    }
    
    setPlayerState(prevState => {
      const newIsPlaying = !prevState.isPlaying;
      
      if (audioRef.current) {
        if (newIsPlaying) {
          setTimeout(() => {
            const playPromise = audioRef.current?.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error("Error playing audio:", error);
                if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                  toast({
                    title: "Playback Issue",
                    description: "There was a problem with playback. Please try again.",
                    variant: "destructive"
                  });
                }
                return prevState;
              });
            }
          }, 50);
        } else {
          audioRef.current.pause();
        }
      }
      
      return { ...prevState, isPlaying: newIsPlaying };
    });
  };

  const nextSong = () => {
    if (playerState.currentPlaylistId) {
      const currentPlaylist = playlists.find(p => p.id === playerState.currentPlaylistId);
      if (currentPlaylist) {
        const currentSongIndex = currentPlaylist.songIds.findIndex(id => id === playerState.currentSongId);
        let nextIndex;
        
        if (playerState.shuffleEnabled) {
          const availableSongs = currentPlaylist.songIds.filter(id => id !== playerState.currentSongId);
          if (availableSongs.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableSongs.length);
            const nextSongId = availableSongs[randomIndex];
            
            setPlayerState(prevState => ({
              ...prevState,
              currentSongId: nextSongId,
              currentTime: 0,
              isPlaying: true
            }));
            return;
          }
        }
        
        nextIndex = (currentSongIndex + 1) % currentPlaylist.songIds.length;
        const nextSongId = currentPlaylist.songIds[nextIndex];
        
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: nextSongId,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    if (playerState.shuffleEnabled) {
      const availableSongs = songs.filter(song => song.id !== playerState.currentSongId);
      if (availableSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        const nextSong = availableSongs[randomIndex];
        
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: nextSong.id,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const nextIndex = (currentIndex + 1) % songs.length;
    
    setPlayerState(prevState => ({
      ...prevState,
      currentSongId: songs[nextIndex].id,
      currentTime: 0,
      isPlaying: true
    }));
  };

  const prevSong = () => {
    if (playerState.currentPlaylistId) {
      const currentPlaylist = playlists.find(p => p.id === playerState.currentPlaylistId);
      if (currentPlaylist) {
        const currentSongIndex = currentPlaylist.songIds.findIndex(id => id === playerState.currentSongId);
        const prevIndex = (currentSongIndex - 1 + currentPlaylist.songIds.length) % currentPlaylist.songIds.length;
        const prevSongId = currentPlaylist.songIds[prevIndex];
        
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: prevSongId,
          currentTime: 0,
          isPlaying: true
        }));
        return;
      }
    }
    
    const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    
    setPlayerState(prevState => ({
      ...prevState,
      currentSongId: songs[prevIndex].id,
      currentTime: 0,
      isPlaying: true
    }));
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prevState => ({ ...prevState, currentTime: time }));
    }
  };

  const setVolume = (volume: number) => {
    setPlayerState(prevState => ({ ...prevState, volume, muted: false }));
  };

  const toggleMute = () => {
    setPlayerState(prevState => ({ ...prevState, muted: !prevState.muted }));
  };

  const logout = () => {
    // Stop all playback immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop voice listening
    setIsVoiceListening(false);
    
    // Clean up audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(err => {
        console.error("Error closing audio context:", err);
      });
      audioContextRef.current = null;
    }
    
    // Reset all state
    setPlayerState(defaultPlayerState);
    setProfileState(null);
    setIsSignedUp(false);
    setWaveformData(defaultWaveformData);
    setCommandHistory([]);
    setVoiceCommandText('');
    setProcessingVoice(false);
    
    // Clear local storage
    localStorage.removeItem('audioPersonaProfile');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      songIds: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    
    localStorage.setItem('tuneGuardPlaylists', JSON.stringify(updatedPlaylists));
    
    toast({
      title: "Playlist Created",
      description: `Created new playlist "${name}"`
    });
  };

  const addToPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        if (!playlist.songIds.includes(songId)) {
          return {
            ...playlist,
            songIds: [...playlist.songIds, songId],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('tuneGuardPlaylists', JSON.stringify(updatedPlaylists));
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songIds: playlist.songIds.filter(id => id !== songId),
          updatedAt: new Date().toISOString()
        };
      }
      return playlist;
    });
    
    setPlaylists(updatedPlaylists);
    localStorage.setItem('tuneGuardPlaylists', JSON.stringify(updatedPlaylists));
  };

  const deletePlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('tuneGuardPlaylists', JSON.stringify(updatedPlaylists));
    
    if (playerState.currentPlaylistId === playlistId) {
      setPlayerState(prev => ({
        ...prev,
        currentPlaylistId: null
      }));
    }
    
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been removed"
    });
  };

  const playPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.songIds.length === 0) return;
    
    const firstSongId = playlist.songIds[0];
    
    setPlayerState(prev => ({
      ...prev,
      currentSongId: firstSongId,
      currentPlaylistId: playlistId,
      currentTime: 0,
      isPlaying: true
    }));
    
    toast({
      title: "Playing Playlist",
      description: `Now playing "${playlist.name}"`
    });
  };

  const playSong = (songId: string) => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(error => {
        console.error("Failed to resume AudioContext:", error);
        
        setTimeout(() => {
          audioContextRef.current = null;
          audioGraphSetup.current = false;
          initializeAudioContext();
        }, 100);
      });
    }

    if (playerState.currentSongId === songId) {
      togglePlayPause();
      return;
    }
    
    const song = songs.find(s => s.id === songId);
    if (!song) {
      console.error(`Song with id ${songId} not found`);
      toast({
        title: "Song Not Found",
        description: "The requested song could not be played.",
        variant: "destructive"
      });
      return;
    }
    
    setTimeout(() => {
      try {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
        
        autoPlayService.updateLastPlayedSong(songId);
        
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: songId,
          currentTime: 0,
          isPlaying: true
        }));
        
        setWaveformData(defaultWaveformData);
      } catch (error) {
        console.error("Error in playSong:", error);
        toast({
          title: "Playback Error",
          description: "Failed to play the selected song.",
          variant: "destructive"
        });
      }
    }, 10);
  };

  const setVoiceCommand = (command: string) => {
    setVoiceCommandText(command);
    setProcessingVoice(true);
    
    const newCommand: VoiceCommand = {
      text: command,
      timestamp: new Date().toISOString(),
      processed: false,
      recognized: false
    };
    
    setCommandHistory(prev => [newCommand, ...prev].slice(0, 10));
    
    setTimeout(() => {
      processVoiceCommand(command);
      setProcessingVoice(false);
    }, 500);
  };

  const toggleVoiceListening = () => {
    setIsVoiceListening(prev => !prev);
    if (!isVoiceListening) {
      toast({
        title: "Voice Assistant Activated",
        description: "Listening for commands...",
      });
    }
  };

  const processVoiceCommand = (command: string) => {
    if (!command) return;
    
    let commandRecognized = false;
    const lowerCommand = command.toLowerCase();
    
    // Enhanced command processing with logout support
    if (matchesVoiceCommand(lowerCommand, ["play", "start", "resume"])) {
      commandRecognized = true;
      if (!playerState.isPlaying) {
        togglePlayPause();
        toast({
          title: "Playback Started",
          description: currentSong ? `Playing "${currentSong.title}"` : "Playing music",
        });
      }
    } 
    else if (matchesVoiceCommand(lowerCommand, ["pause", "stop"])) {
      commandRecognized = true;
      if (playerState.isPlaying) {
        togglePlayPause();
        toast({
          title: "Playback Paused",
          description: "Music paused"
        });
      }
    }
    else if (matchesVoiceCommand(lowerCommand, ["next", "skip", "forward"])) {
      commandRecognized = true;
      nextSong();
      toast({
        title: "Next Song",
        description: "Playing next song"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["previous", "prev", "back"])) {
      commandRecognized = true;
      prevSong();
      toast({
        title: "Previous Song",
        description: "Playing previous song"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["logout", "log out", "sign out", "exit"])) {
      commandRecognized = true;
      toast({
        title: "Logging Out",
        description: "Stopping all tasks and logging out..."
      });
      
      // Immediate logout with cleanup
      setTimeout(() => {
        logout();
      }, 100);
    }
    
    // Update command history
    setCommandHistory(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[0].processed = true;
        updated[0].recognized = commandRecognized;
      }
      return updated;
    });
    
    if (!commandRecognized) {
      toast({
        title: "Command Not Recognized",
        description: "Say 'help' to see available commands",
        variant: "destructive"
      });
    }
  };

  const toggleShuffle = () => {
    setPlayerState(prevState => ({
      ...prevState,
      shuffleEnabled: !prevState.shuffleEnabled
    }));
    
    toast({
      title: playerState.shuffleEnabled ? "Shuffle Disabled" : "Shuffle Enabled",
      description: playerState.shuffleEnabled ? "Songs will play in order" : "Songs will play in random order"
    });
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(playerState.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    setPlayerState(prevState => ({
      ...prevState,
      repeatMode: nextMode
    }));
    
    const messages = {
      off: "Repeat disabled",
      all: "Repeating all songs",
      one: "Repeating current song"
    };
    
    toast({
      title: `Repeat Mode: ${nextMode}`,
      description: messages[nextMode]
    });
  };

  const resetWaveform = () => {
    setWaveformData(defaultWaveformData);
    toast({
      title: "Waveform Reset",
      description: "Visualization has been reset"
    });
  };

  // Improved auto-play after login effect - removed in favor of the approach in Index.tsx
  
  return (
    <AudioContext.Provider value={{
      profile,
      setProfile,
      eqSettings,
      setEQSettings,
      updateEQSettings,
      songs,
      addSong,
      removeSong,
      playerState,
      setPlayerState,
      voiceCommand,
      setVoiceCommand,
      isVoiceListening,
      toggleVoiceListening,
      commandHistory,
      togglePlayPause,
      nextSong,
      prevSong,
      seekTo,
      setVolume,
      toggleMute,
      currentSong,
      waveformData,
      isSignedUp,
      processingVoice,
      updateProfile,
      isLoading,
      playlists,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      playPlaylist,
      setVisSettings: (newSettings) => setVisSettings(prev => ({ ...prev, ...newSettings })),
      visSettings,
      logout,
      playSong,
      toggleShuffle,
      toggleRepeat,
      resetWaveform
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
