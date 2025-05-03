
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAudio } from '@/lib/audioContext';
import { toast } from '@/components/ui/use-toast';

// Siren detection parameters
const DETECTION_THRESHOLD = 0.7;
const FREQUENCY_LOWER = 600; // Ambulance sirens typically oscillate between 600-1200Hz
const FREQUENCY_UPPER = 1200;
const PATTERN_DURATION_MIN = 0.5; // Minimum duration of pattern in seconds
const PATTERN_DURATION_MAX = 3.0; // Maximum duration of pattern in seconds
const DETECTION_INTERVAL = 200; // Check every 200ms

const SirenDetector: React.FC = () => {
  const { playerState, togglePlayPause } = useAudio();
  const [isDetecting, setIsDetecting] = useState(false);
  const [sirenDetected, setSirenDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const wasPlayingRef = useRef<boolean>(false);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Request microphone access
  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setPermissionGranted(true);
      setIsDetecting(true);
      
      toast({
        title: "Siren Detection Active",
        description: "The app will automatically pause if an ambulance siren is detected.",
      });
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Siren detection requires microphone permission.",
        variant: "destructive"
      });
      setPermissionGranted(false);
      setIsDetecting(false);
      return false;
    }
  };
  
  const setupAudioAnalysis = () => {
    if (!micStreamRef.current) return false;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
      analyserNodeRef.current = audioContextRef.current.createAnalyser();
      
      analyserNodeRef.current.fftSize = 2048;
      analyserNodeRef.current.smoothingTimeConstant = 0.8;
      
      sourceNodeRef.current.connect(analyserNodeRef.current);
      return true;
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
      return false;
    }
  };
  
  // Start siren detection
  const startDetection = async () => {
    if (isDetecting) return;
    
    const hasPermission = await requestMicrophoneAccess();
    if (!hasPermission) return;
    
    const setupSuccess = setupAudioAnalysis();
    if (!setupSuccess) return;
    
    detectSirenPatterns();
  };
  
  // Stop siren detection
  const stopDetection = () => {
    if (!isDetecting) return;
    
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    
    if (micStreamRef.current) {
      const tracks = micStreamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsDetecting(false);
    setSirenDetected(false);
    setConfidence(0);
    
    toast({
      title: "Siren Detection Deactivated",
      description: "Automatic pause on siren detection has been disabled."
    });
  };
  
  // Frequency analysis and pattern detection for sirens
  const detectSirenPatterns = () => {
    if (!analyserNodeRef.current || !isDetecting) return;
    
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    analyserNodeRef.current.getByteFrequencyData(frequencyData);
    
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binSize = sampleRate / analyserNodeRef.current.fftSize;
    
    // Calculate the bins corresponding to our target frequency range
    const lowerBin = Math.floor(FREQUENCY_LOWER / binSize);
    const upperBin = Math.ceil(FREQUENCY_UPPER / binSize);
    
    // Extract energy in the target frequency range
    let energyInBand = 0;
    for (let i = lowerBin; i <= upperBin; i++) {
      energyInBand += frequencyData[i];
    }
    
    // Normalize between 0-1
    const normalizedEnergy = energyInBand / (255 * (upperBin - lowerBin + 1));
    
    // Check for oscillating pattern characteristic of sirens
    // This is a simplified approach - a real implementation would look for 
    // specific frequency patterns and oscillation over time
    let detectionConfidence = normalizedEnergy;
    
    // Update confidence display
    setConfidence(detectionConfidence * 100);
    
    // Determine if a siren is detected based on confidence threshold
    const isSirenDetected = detectionConfidence > DETECTION_THRESHOLD;
    
    // Handle playback states
    if (isSirenDetected && !sirenDetected) {
      // New siren detection
      setSirenDetected(true);
      
      // Store current playing state before pausing
      wasPlayingRef.current = playerState.isPlaying;
      
      if (playerState.isPlaying) {
        // Pause the music
        togglePlayPause();
        
        toast({
          title: "Emergency Siren Detected",
          description: "Playback paused automatically. Will resume when safe.",
          variant: "destructive"
        });
      }
    } else if (!isSirenDetected && sirenDetected) {
      // Siren stopped
      setSirenDetected(false);
      
      // Resume if it was playing before the siren
      if (wasPlayingRef.current) {
        togglePlayPause();
        
        toast({
          title: "Safe to Resume",
          description: "Siren no longer detected. Playback resumed.",
        });
        
        wasPlayingRef.current = false;
      }
    }
    
    // Continue detection loop
    detectionTimeoutRef.current = setTimeout(detectSirenPatterns, DETECTION_INTERVAL);
  };
  
  useEffect(() => {
    // Auto-start detection when component mounts
    startDetection();
    
    // Cleanup on unmount
    return () => {
      stopDetection();
    };
  }, []);
  
  // Provide a toggle button to enable/disable detection
  return (
    <div className="siren-detector">
      {isDetecting && (
        <div className={`flex items-center justify-center text-xs ${
          sirenDetected ? 'text-red-500 animate-pulse' : 'text-green-500'
        }`}>
          {sirenDetected ? (
            <AlertTriangle className="h-3 w-3 mr-1" />
          ) : null}
          <span className="sr-only">
            {sirenDetected ? 'Siren detected' : 'Monitoring for sirens'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SirenDetector;
