
import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceRecognitionService } from '../lib/voiceCommands';
import { toast } from '@/components/ui/use-toast';
import { recognizeVoiceCommand } from '@/lib/utils';
import { VOICE_COMMANDS } from '@/lib/voiceCommands';
import { soundEffects } from '@/lib/soundEffects';

interface UseVoiceRecognitionProps {
  onCommand: (command: string) => void;
  enabled: boolean;
}

export function useVoiceRecognition({ onCommand, enabled }: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const voiceServiceRef = useRef<VoiceRecognitionService | null>(null);
  
  const initializeVoiceService = useCallback(() => {
    if (!voiceServiceRef.current) {
      voiceServiceRef.current = new VoiceRecognitionService();
    }
    return voiceServiceRef.current;
  }, []);
  
  const handleVoiceResult = useCallback((text: string) => {
    setTranscript(text);
    
    // Process commands based on the recognized text
    const commandDetected = Object.entries(VOICE_COMMANDS).some(([command, variations]) => {
      if (recognizeVoiceCommand(text, variations)) {
        console.log(`Voice command detected: ${command}`);
        onCommand(text);
        return true;
      }
      return false;
    });
    
    if (!commandDetected && text.length > 0) {
      console.log('Voice input not recognized as a command:', text);
    }
  }, [onCommand]);
  
  const startListening = useCallback(() => {
    const voiceService = initializeVoiceService();
    
    if (voiceService.start(handleVoiceResult)) {
      setIsListening(true);
      
      toast({
        title: "Voice Recognition Active",
        description: "Listening for commands...",
        duration: 2000,
      });
      
      try {
        soundEffects.playNotification();
      } catch (error) {
        console.error("Error playing notification sound:", error);
      }
      
      return true;
    }
    
    toast({
      title: "Voice Recognition Failed",
      description: "Could not start voice recognition",
      variant: "destructive",
    });
    
    return false;
  }, [handleVoiceResult, initializeVoiceService]);
  
  const stopListening = useCallback(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stop();
      setIsListening(false);
    }
  }, []);
  
  // Setup and cleanup
  useEffect(() => {
    if (enabled) {
      if (!voiceServiceRef.current) {
        initializeVoiceService();
      }
    }
    
    return () => {
      if (voiceServiceRef.current) {
        stopListening();
      }
    };
  }, [enabled, initializeVoiceService, stopListening]);
  
  // Start/stop listening based on enabled state
  useEffect(() => {
    if (enabled && !isListening) {
      startListening();
    } else if (!enabled && isListening) {
      stopListening();
    }
  }, [enabled, isListening, startListening, stopListening]);
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening
  };
}
