
import { useRef, useState, useEffect } from 'react';
import { useAudio } from '@/lib/audioContext';
import { SirenDetector } from '@/lib/sirenDetection';
import { toast } from '@/components/ui/use-toast';
import { SirenDetectionSettings } from '@/lib/types';

export function useSirenDetection() {
  const { togglePlayPause, playerState } = useAudio();
  const [isDetectingSiren, setIsDetectingSiren] = useState(false);
  const [sirenDetected, setSirenDetected] = useState(false);
  const [settings, setSettings] = useState<SirenDetectionSettings>({
    enabled: true,
    sensitivity: 0.6,
    autoResume: true,
    pauseDuration: 2 // wait 2 seconds after siren is gone before resuming
  });
  
  // We store the state before the siren was detected
  const previousPlayingState = useRef<boolean | null>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const detectorRef = useRef<SirenDetector | null>(null);
  
  // Create the siren detector
  useEffect(() => {
    const onSirenDetected = () => {
      console.log('🚨 Ambulance siren detected!');
      setSirenDetected(true);
      
      // Only pause if we were playing
      if (playerState.isPlaying) {
        previousPlayingState.current = true;
        togglePlayPause(); // Pause the music
        
        toast({
          title: "Ambulance Siren Detected",
          description: "Music paused automatically for safety",
          variant: "default"
        });
      }
    };
    
    const onSirenGone = () => {
      console.log('✓ Ambulance siren gone');
      setSirenDetected(false);
      
      // Clear any existing timeout
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
      
      // If we should auto-resume and we were playing before
      if (settings.autoResume && previousPlayingState.current === true) {
        // Wait the specified pause duration before resuming
        resumeTimeoutRef.current = window.setTimeout(() => {
          if (!playerState.isPlaying) {
            togglePlayPause(); // Resume the music
            previousPlayingState.current = null;
            
            toast({
              title: "Music Resumed",
              description: "Siren no longer detected",
              variant: "default"
            });
          }
        }, settings.pauseDuration * 1000);
      }
    };
    
    detectorRef.current = new SirenDetector(
      onSirenDetected,
      onSirenGone,
      settings.sensitivity
    );
    
    return () => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [togglePlayPause, playerState.isPlaying, settings]);
  
  const startDetection = async () => {
    if (!settings.enabled || isDetectingSiren) return;
    
    try {
      setIsDetectingSiren(true);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      
      analyzer.fftSize = 2048;
      analyzer.smoothingTimeConstant = 0.8;
      source.connect(analyzer);
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Start the detection loop
      const detectLoop = () => {
        if (!isDetectingSiren) return;
        
        analyzer.getByteFrequencyData(dataArray);
        
        if (detectorRef.current) {
          detectorRef.current.sensitivity = settings.sensitivity;
          detectorRef.current.processAudioFrame(dataArray, audioContext.sampleRate);
        }
        
        requestAnimationFrame(detectLoop);
      };
      
      detectLoop();
      
      toast({
        title: "Siren Detection Active",
        description: "Your music will pause if an ambulance siren is detected",
      });
      
    } catch (error) {
      console.error('Error starting siren detection:', error);
      setIsDetectingSiren(false);
      
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to enable siren detection",
        variant: "destructive"
      });
    }
  };
  
  const stopDetection = () => {
    setIsDetectingSiren(false);
    
    if (detectorRef.current) {
      detectorRef.current.reset();
    }
    
    setSirenDetected(false);
  };
  
  const updateSettings = (newSettings: Partial<SirenDetectionSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  
  return {
    isDetectingSiren,
    sirenDetected,
    settings,
    startDetection,
    stopDetection,
    updateSettings
  };
}
