
import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceCommandProcessor } from '@/lib/voiceCommands';
import { dispatchVoiceCommandEvent } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { soundEffects } from '@/lib/soundEffects';

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const voiceProcessorRef = useRef<VoiceCommandProcessor | null>(null);
  
  // Initialize voice command processor
  useEffect(() => {
    // Check browser support
    const supported = VoiceCommandProcessor.isSupported();
    setIsSupported(supported);
    
    if (!supported) {
      toast({
        title: "Voice Control Unavailable",
        description: "Your browser doesn't support voice recognition. Please try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    
    // Create processor
    voiceProcessorRef.current = new VoiceCommandProcessor();
    
    // Set up callbacks
    voiceProcessorRef.current.onCommand((command) => {
      setLastCommand(command);
      
      // Play feedback sound
      soundEffects.playCommandRecognized();
      
      // Show toast notification
      toast({
        title: "Command Recognized",
        description: `Executing: ${command}`,
        duration: 2000,
      });
      
      // Dispatch the appropriate event
      dispatchVoiceCommandEvent(command);
    });
    
    voiceProcessorRef.current.onError((error) => {
      console.error("Voice recognition error:", error);
      
      // Only show certain errors to the user
      if (error.includes("Microphone access denied")) {
        toast({
          title: "Microphone Access Required",
          description: error,
          variant: "destructive",
        });
        
        // Auto-stop if permission denied
        stopListening();
      }
    });
    
    voiceProcessorRef.current.onStatus((status) => {
      // We only update if status has actually changed
      if (status === "active" && !isListening) {
        setIsListening(true);
      } else if (status === "inactive" && isListening) {
        // Don't update state here - let the restart logic handle it
      }
    });
    
    return () => {
      if (voiceProcessorRef.current) {
        voiceProcessorRef.current.stop();
      }
    };
  }, []);
  
  // Start listening for commands
  const startListening = useCallback(() => {
    if (!voiceProcessorRef.current) return false;
    
    const success = voiceProcessorRef.current.start();
    if (success) {
      setIsListening(true);
      soundEffects.playActivation();
      
      toast({
        title: "Voice Control Activated",
        description: "Listening for commands...",
      });
    }
    
    return success;
  }, []);
  
  // Stop listening for commands
  const stopListening = useCallback(() => {
    if (!voiceProcessorRef.current) return;
    
    voiceProcessorRef.current.stop();
    setIsListening(false);
    soundEffects.playDeactivation();
    
    toast({
      title: "Voice Control Deactivated",
      description: "Voice commands are now disabled",
    });
  }, []);
  
  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);
  
  return {
    isListening,
    isSupported,
    lastCommand,
    startListening,
    stopListening,
    toggleListening
  };
}
