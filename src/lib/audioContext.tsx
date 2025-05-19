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
import { toast } from '@/components/ui/use-toast';
import { matchesVoiceCommand } from '@/lib/utils';

// Updated sample songs with more reliable audio sources
const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: "Tune Guard Theme",
    artist: 'Audio Studio',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 200,
    source: 'https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-132.mp3'
  },
  {
    id: '2',
    title: "Ambient Melody",
    artist: 'Sound Waves',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 234,
    source: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3'
  },
  {
    id: '3',
    title: "Digital Harmony",
    artist: 'Music Lab',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 210,
    source: 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3'
  },
  {
    id: '4',
    title: "Serene Waves",
    artist: 'Echo Studio',
    albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
    duration: 183,
    source: 'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3'
  }
];

const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist1',
    name: 'Favorites',
    songs: ['1', '3'],
    createdAt: new Date().toISOString()
  }
];

const getEQSettingsByAge = (age: number, gender: string): EQSettings => {
  if (age < 20) {
    return {
      bass: gender === 'male' ? 75 : 70,
      mid: 65,
      treble: 80,
      volume: 70
    };
  } else if (age < 40) {
    return {
      bass: 70,
      mid: 70,
      treble: 75,
      volume: 65
    };
  } else if (age < 60) {
    return {
      bass: 75,
      mid: 75, 
      treble: 65,
      volume: 60
    };
  } else {
    return {
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

const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  volume: 70,
  isMuted: false,
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
  overlay: true
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [eqSettings, setEQSettings] = useState<EQSettings>({
    bass: 70,
    mid: 70,
    treble: 70,
    volume: 70
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
  
  const songs = [...SAMPLE_SONGS, ...customSongs];
  
  const currentSong = playerState.currentSongId 
    ? songs.find(song => song.id === playerState.currentSongId) 
    : null;

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
          description: 'Failed to initialize audio processing. Please check your browser settings.',
          variant: 'destructive'
        });
        return false;
      }
    }
    return true;
  };

  const updateEQSettings = () => {
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
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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
      
      const audio = new Audio();
      audio.preload = 'metadata';
      
      // Set up event handlers before setting src
      const metadataPromise = new Promise<number>((resolve) => {
        audio.onloadedmetadata = () => {
          resolve(audio.duration);
        };
        
        // Fallback in case metadata loading fails
        setTimeout(() => {
          if (audio.duration === 0 || isNaN(audio.duration)) {
            resolve(180); // Default 3 minutes if we can't get duration
          }
        }, 3000);
      });
      
      // Set source and start loading
      audio.src = fileUrl;
      
      // Wait for metadata to load with a timeout
      let duration = 0;
      try {
        duration = await metadataPromise;
      } catch (e) {
        console.warn("Could not get audio duration, using default", e);
        duration = 180;
      }
      
      const songId = `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newSong: Song = {
        id: songId,
        title: file.name.replace(/\.[^/.]+$/, "").slice(0, 50),
        artist: 'Unknown Artist',
        albumArt: '/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png',
        duration: Math.round(duration) || 180,
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
      
      // If this is the first song added, play it automatically
      if (updatedCustomSongs.length === 1 && !playerState.isPlaying) {
        setTimeout(() => {
          setPlayerState(prevState => ({
            ...prevState,
            currentSongId: newSong.id,
            currentTime: 0,
            isPlaying: true
          }));
        }, 500);
      }
      
      toast({
        title: "Song Added Successfully",
        description: `"${newSong.title}" has been added to your library and saved for future sessions.`,
      });
      
    } catch (error) {
      console.error("Error adding song:", error);
      toast({
        title: "Error Adding Song",
        description: "There was a problem adding your song. Please try a different file format or size.",
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
      songs: playlist.songs.filter(id => id !== songId)
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
    
    // Initialize Web Audio API
    initializeAudioContext();
    
    // Improved song loading with better error handling
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
                        title: songMeta.title || songData.fileName.replace(/\.[^/.]+$/, "").slice(0, 50),
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
      
      // Only show toast for persistent errors, not during song changes
      if (audioRef.current?.error?.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
        toast({
          title: "Playback Error",
          description: "This audio format may not be supported by your browser. Trying another song...",
          variant: "destructive"
        });
      }
      
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
    
    // Disable voice listening by default
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
        try {
          audioContextRef.current.close();
        } catch(e) {
          console.error("Error closing audio context:", e);
        }
      }
    };
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    
    const newEQSettings = getEQSettingsByAge(newProfile.age, newProfile.gender);
    setEQSettings(newEQSettings);
    
    setIsSignedUp(true);
    
    localStorage.setItem('audioPersonaProfile', JSON.stringify(newProfile));
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
      setupAudioGraph();
    }
    
    try {
      if (audioRef.current.src !== currentSong.source) {
        console.log("Setting audio source to:", currentSong.source);
        
        try {
          // Reset the audio element completely before setting new source
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = '';
          audioRef.current.load();
          
          // Now set the new source
          audioRef.current.src = currentSong.source;
          audioRef.current.load();
          
          // Pre-buffer the audio for smoother playback
          audioRef.current.preload = 'auto';
        } catch (error) {
          console.error("Error setting audio source:", error);
          toast({
            title: "Playback Error",
            description: "Could not load this song. Trying another track...",
            variant: "destructive"
          });
          
          // Try to recover by playing another song after a short delay
          setTimeout(() => nextSong(), 1000);
          return;
        }
      }
      
      const playbackTimeout = setTimeout(() => {
        // If we haven't started playback after 5 seconds, something is wrong
        console.warn("Playback taking too long, trying to recover...");
        if (playerState.isPlaying && audioRef.current) {
          try {
            audioRef.current.play().catch(e => console.error("Recovery play failed:", e));
          } catch(e) {
            console.error("Recovery attempt error:", e);
          }
        }
      }, 5000);
      
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
                console.error("Audio play error:", error);
                
                // Only show error if it's not user interaction related
                if (error.name !== 'NotAllowedError') {
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
    
    const effectiveVolume = playerState.isMuted ? 0 : playerState.volume / 100;
    
    audioRef.current.volume = effectiveVolume;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = effectiveVolume;
    }
  }, [playerState.volume, playerState.isMuted]);

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
          // Add a small delay to prevent rapid toggle issues
          setTimeout(() => {
            const playPromise = audioRef.current?.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error("Error playing audio:", error);
                // Auto-retry once for non-user interaction errors
                if (error.name !== 'NotAllowedError') {
                  setTimeout(() => {
                    if (audioRef.current) {
                      audioRef.current.play().catch(e => 
                        console.error("Retry play failed:", e)
                      );
                    }
                  }, 1000);
                }
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
        const currentSongIndex = currentPlaylist.songs.findIndex(id => id === playerState.currentSongId);
        let nextIndex;
        
        if (playerState.shuffleEnabled) {
          const availableSongs = currentPlaylist.songs.filter(id => id !== playerState.currentSongId);
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
        
        nextIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
        const nextSongId = currentPlaylist.songs[nextIndex];
        
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
        const currentSongIndex = currentPlaylist.songs.findIndex(id => id === playerState.currentSongId);
        const prevIndex = (currentSongIndex - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length;
        const prevSongId = currentPlaylist.songs[prevIndex];
        
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
    setPlayerState(prevState => ({ ...prevState, volume, isMuted: false }));
  };

  const toggleMute = () => {
    setPlayerState(prevState => ({ ...prevState, isMuted: !prevState.isMuted }));
  };

  const logout = () => {
    // Stop any playback before logout
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Reset audio context if possible
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error("Error closing audio context during logout:", e);
      }
    }
    
    // Stop voice recognition if active
    if (isVoiceListening) {
      setIsVoiceListening(false);
    }
    
    // Clear user data
    setProfileState(null);
    setIsSignedUp(false);
    localStorage.removeItem('audioPersonaProfile');
    
    // Reset player state
    setPlayerState(defaultPlayerState);
    
    // Reset waveform data
    setWaveformData(defaultWaveformData);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      songs: [],
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
        if (!playlist.songs.includes(songId)) {
          return {
            ...playlist,
            songs: [...playlist.songs, songId],
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
          songs: playlist.songs.filter(id => id !== songId),
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
    if (!playlist || playlist.songs.length === 0) return;
    
    const firstSongId = playlist.songs[0];
    
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
      audioContextRef.current.resume().catch(console.error);
    }

    if (playerState.currentSongId === songId) {
      togglePlayPause();
      return;
    }
    
    // Reset any ongoing playback first
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        console.error("Error resetting current playback:", e);
      }
    }
    
    // Add a small buffer between operations to avoid glitches
    setTimeout(() => {
      setPlayerState(prevState => ({
        ...prevState,
        currentSongId: songId,
        currentTime: 0,
        isPlaying: true
      }));
      
      setWaveformData(defaultWaveformData);
    }, 10);
  };

  const setVoiceCommand = (command: string) => {
    if (!command.trim()) return;
    
    setVoiceCommandText(command);
    setProcessingVoice(true);
    
    const newCommand: VoiceCommand = {
      text: command,
      timestamp: new Date().toISOString(),
      processed: false
    };
    
    setCommandHistory(prev => [newCommand, ...prev].slice(0, 10));
    
    setTimeout(() => {
      processVoiceCommand(command);
      setProcessingVoice(false);
    }, 300);
  };

  const toggleVoiceListening = () => {
    // Toggle voice listening state
    setIsVoiceListening(prev => !prev);
    
    // If enabling, show a toast notification
    if (!isVoiceListening) {
      toast({
        title: "Voice Assistant Activated",
        description: "Listening for commands...",
      });
    } else {
      toast({
        title: "Voice Assistant Deactivated",
        description: "Voice commands turned off.",
      });
    }
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    let commandRecognized = false;
    
    // Basic commands with better matching
    if (matchesVoiceCommand(lowerCommand, ["play", "start", "resume", "begin"])) {
      commandRecognized = true;
      setPlayerState(prevState => ({ ...prevState, isPlaying: true }));
      
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error("Error starting playback via voice command:", err);
        });
      }
      
      toast({
        title: "Playback Started",
        description: currentSong ? `Playing "${currentSong.title}"` : "Playing music",
      });
    } 
    else if (matchesVoiceCommand(lowerCommand, ["pause", "stop", "halt"])) {
      commandRecognized = true;
      setPlayerState(prevState => ({ ...prevState, isPlaying: false }));
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      toast({
        title: "Playback Paused",
        description: "Music paused"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["next", "skip", "next song"])) {
      commandRecognized = true;
      nextSong();
      toast({
        title: "Next Song",
        description: "Playing next track"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["previous", "back", "last song"])) {
      commandRecognized = true;
      prevSong();
      toast({
        title: "Previous Song",
        description: "Playing previous track"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["louder", "volume up", "increase volume"])) {
      commandRecognized = true;
      setPlayerState(prev => {
        const newVolume = Math.min(100, prev.volume + 10);
        return { ...prev, volume: newVolume, isMuted: false };
      });
      toast({
        title: "Volume Up",
        description: "Increasing volume"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["quieter", "volume down", "decrease volume"])) {
      commandRecognized = true;
      setPlayerState(prev => {
        const newVolume = Math.max(0, prev.volume - 10);
        return { ...prev, volume: newVolume, isMuted: false };
      });
      toast({
        title: "Volume Down",
        description: "Decreasing volume"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["mute", "silence", "quiet"])) {
      commandRecognized = true;
      setPlayerState(prev => ({ ...prev, isMuted: true }));
      toast({
        title: "Muted",
        description: "Audio muted"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["unmute", "sound on"])) {
      commandRecognized = true;
      setPlayerState(prev => ({ ...prev, isMuted: false }));
      toast({
        title: "Unmuted",
        description: "Audio unmuted"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["shuffle on", "shuffle", "mix"])) {
      commandRecognized = true;
      setPlayerState(prev => ({ ...prev, shuffleEnabled: true }));
      toast({
        title: "Shuffle Enabled",
        description: "Playing songs in random order"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["shuffle off", "no shuffle", "in order"])) {
      commandRecognized = true;
      setPlayerState(prev => ({ ...prev, shuffleEnabled: false }));
      toast({
        title: "Shuffle Disabled",
        description: "Playing songs in sequence"
      });
    }
    else if (matchesVoiceCommand(lowerCommand, ["logout", "log out", "sign out", "exit"])) {
      commandRecognized = true;
      logout();
    }
    
    // Update command history to mark as processed
    setCommandHistory(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[0].processed = true;
        updated[0].recognized = commandRecognized;
      }
      return updated;
    });
    
    // Only show unrecognized command message for non-empty commands
    if (!commandRecognized && lowerCommand.length > 1) {
      toast({
        title: "Command Not Recognized",
        description: "Try saying: play, pause, next, previous, volume up/down",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    
    const handleEnded = () => {
      if (playerState.repeatMode === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => {
            console.error("Error restarting song:", err);
            toast({
              title: "Playback Error",
              description: "Failed to repeat the song. Playing next song instead.",
              variant: "destructive"
            });
            nextSong();
          });
        }
      } else if (playerState.repeatMode === 'all' || playerState.shuffleEnabled) {
        nextSong();
      } else {
        const currentIndex = songs.findIndex(song => song.id === playerState.currentSongId);
        if (currentIndex < songs.length - 1) {
          nextSong();
        } else {
          setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
          
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
          
          toast({
            title: "Playback Complete",
            description: "Reached the end of your songs."
          });
        }
      }
    };
    
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [playerState.repeatMode, playerState.shuffleEnabled, playerState.currentSongId, songs]);

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

  return (
    <AudioContext.Provider value={{
      profile,
      setProfile,
      eqSettings,
      setEQSettings,
      songs,
      addSong,
      removeSong,
      playerState,
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
