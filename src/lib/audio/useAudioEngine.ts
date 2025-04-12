
import { useRef, useState, useEffect } from 'react';
import { WaveformData, EQSettings } from '../types';
import { processAudioFrame } from './audioUtils';
import { toast } from '@/components/ui/use-toast';

// Default waveform data
const defaultWaveformData: WaveformData = {
  original: Array(30).fill(0),
  processed: Array(30).fill(0),
  timeData: Array(30).fill(0),
  frequencyData: Array(30).fill(0)
};

export const useAudioEngine = (
  currentSongUrl: string | null,
  isPlaying: boolean,
  volume: number,
  isMuted: boolean,
  eqSettings: EQSettings,
  onEnded: () => void,
  onTimeUpdate: (time: number) => void,
  onLoadedMetadata: (duration: number) => void
) => {
  const [waveformData, setWaveformData] = useState<WaveformData>(defaultWaveformData);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);

  // Initialize audio nodes
  const initializeAudioNodes = () => {
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
      } catch (error) {
        console.error('Error initializing Web Audio API:', error);
        toast({
          title: 'Audio Processing Error',
          description: 'Failed to initialize audio processing.',
          variant: 'destructive'
        });
      }
    }
  };

  // Create audio graph
  const createAudioGraph = () => {
    if (!audioRef.current || !audioContextRef.current) return;
    
    try {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      
      const [bassFilter, midFilter, trebleFilter] = eqNodesRef.current;
      
      sourceNodeRef.current.connect(bassFilter);
      bassFilter.connect(midFilter);
      midFilter.connect(trebleFilter);
      trebleFilter.connect(gainNodeRef.current!);
      gainNodeRef.current!.connect(analyserNodeRef.current!);
      analyserNodeRef.current!.connect(audioContextRef.current.destination);
      
      updateEQSettings();
    } catch (error) {
      console.error('Error creating audio graph:', error);
    }
  };

  // Update EQ settings
  const updateEQSettings = () => {
    if (!eqNodesRef.current.length) return;
    
    const [bassFilter, midFilter, trebleFilter] = eqNodesRef.current;
    
    bassFilter.gain.value = (eqSettings.bass - 50) / 5;
    midFilter.gain.value = (eqSettings.mid - 50) / 5;
    trebleFilter.gain.value = (eqSettings.treble - 50) / 5;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;
    }
  };

  // Initialize audio element and set up event listeners
  useEffect(() => {
    audioRef.current = new Audio();
    initializeAudioNodes();
    
    const audio = audioRef.current;
    
    const handleEnded = () => {
      onEnded();
    };
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        onTimeUpdate(Math.floor(audioRef.current.currentTime));
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        onLoadedMetadata(Math.floor(audioRef.current.duration));
      }
    };
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
      audio.src = '';
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Handle song changes and playing state
  useEffect(() => {
    if (!audioRef.current || !currentSongUrl) return;
    
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    if (audioRef.current.src !== currentSongUrl) {
      audioRef.current.src = currentSongUrl;
      audioRef.current.load();
      
      createAudioGraph();
    }
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio play error:", error);
          toast({
            title: "Playback Error",
            description: "There was an error playing this audio file.",
            variant: "destructive"
          });
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [currentSongUrl, isPlaying]);

  // Handle volume and mute changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = isMuted ? 0 : volume / 100;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle EQ settings changes
  useEffect(() => {
    updateEQSettings();
  }, [eqSettings]);

  // Process audio frames for visualization
  useEffect(() => {
    let animationFrameId: number;
    
    const updateAudioData = () => {
      if (isPlaying && audioContextRef.current && analyserNodeRef.current) {
        const newWaveformData = processAudioFrame(analyserNodeRef.current, eqSettings);
        if (newWaveformData) {
          setWaveformData(newWaveformData);
        }
      }
      animationFrameId = requestAnimationFrame(updateAudioData);
    };
    
    if (isPlaying) {
      updateAudioData();
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, eqSettings]);

  // Seek to specified time
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return {
    waveformData,
    seekTo
  };
};
