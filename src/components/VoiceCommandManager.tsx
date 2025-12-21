
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAudio } from '@/lib/audioContext';
import { Mic, MicOff, X, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VoiceCommandPanelState } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const VoiceCommandManager: React.FC = () => {
  const { 
    toggleVoiceListening, 
    isVoiceListening, 
    setVoiceCommand,
    togglePlayPause,
    nextSong,
    prevSong,
    playerState,
    logout
  } = useAudio();
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [panelState, setPanelState] = useState<VoiceCommandPanelState>({
    isListening: false,
    transcript: "",
    isOpen: false,
    mode: "listening"
  });
  
  const initAttempts = useRef(0);
  const maxInitAttempts = 3;
  const recognitionResetTimer = useRef<number | null>(null);
  
  // Debouncing refs for instant, reliable command execution
  const lastCommandTime = useRef<number>(0);
  const lastCommand = useRef<string>('');
  const commandDebounceMs = 800; // Minimum time between same commands
  const processingCommand = useRef<boolean>(false);
  
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      try {
        if (typeof window !== 'undefined') {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';
            recognition.current.maxAlternatives = 1;
            
            setIsReady(true);
            console.log("Speech recognition initialized successfully");
            return true;
          } else if (initAttempts.current < maxInitAttempts) {
            initAttempts.current += 1;
            if (initAttempts.current === 1) {
              toast({
                title: "Voice Commands Limited",
                description: "Your browser doesn't support speech recognition",
                variant: "destructive"
              });
            }
          }
        }
        return false;
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        if (initAttempts.current < maxInitAttempts) {
          initAttempts.current += 1;
          if (initAttempts.current === 1) {
            toast({
              title: "Voice Commands Unavailable",
              description: "Could not initialize speech recognition",
              variant: "destructive"
            });
          }
        }
        return false;
      }
    };
    
    if (isVoiceListening && !isReady) {
      initializeSpeechRecognition();
    }

    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (e) {
          console.log("Error stopping speech recognition:", e);
        }
      }
      
      if (recognitionResetTimer.current) {
        clearTimeout(recognitionResetTimer.current);
      }
    };
  }, [isVoiceListening]);

  useEffect(() => {
    if (!recognition.current || !isReady) return;

    if (isVoiceListening) {
      startListening();
    } else {
      stopListening();
    }
  }, [isVoiceListening, isReady]);

  const startListening = () => {
    if (!recognition.current || !isReady) return;

    try {
      recognition.current.start();
      console.log("Voice recognition started - listening for commands");
      
      recognition.current.onresult = (event) => {
        const result = event.results[event.resultIndex];
        if (result?.isFinal) {
          const text = result[0].transcript.trim().toLowerCase();
          const confidence = result[0].confidence;
          
          // Accept results with reasonable confidence
          if (confidence > 0.5) {
            setTranscript(text);
            setPanelState(prev => ({
              ...prev,
              transcript: text
            }));
            processCommand(text);
          } else {
            console.log("Low confidence speech result ignored:", text, confidence);
          }
        }
      };

      recognition.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          // Silent - continue listening
        } else if (event.error === 'aborted') {
          console.log("Speech recognition stopped");
        } else {
          console.error("Speech recognition error:", event.error);
          if (event.error !== 'network' && event.error !== 'audio-capture') {
            toast({
              title: "Voice Recognition Issue",
              description: "Speech recognition had a problem. Click the mic to retry.",
              variant: "destructive"
            });
          }
        }
      };

      recognition.current.onend = () => {
        if (isVoiceListening && recognition.current) {
          try {
            if (recognitionResetTimer.current) {
              clearTimeout(recognitionResetTimer.current);
            }
            
            // Quick restart for continuous listening
            recognitionResetTimer.current = window.setTimeout(() => {
              if (isVoiceListening && recognition.current) {
                try {
                  recognition.current.start();
                } catch (e) {
                  console.log("Error restarting speech recognition:", e);
                }
              }
            }, 100);
          } catch (e) {
            console.log("Error setting restart timer:", e);
          }
        }
      };
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: "Voice Recognition Error",
        description: "Could not start listening. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (!recognition.current) return;
    
    try {
      recognition.current.stop();
      
      if (recognitionResetTimer.current) {
        clearTimeout(recognitionResetTimer.current);
        recognitionResetTimer.current = null;
      }
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  // Optimized command matching with debouncing
  const matchCommand = useCallback((text: string, commands: string[]): boolean => {
    const cleanText = text.replace(/[^\w\s]/g, '').toLowerCase().trim();
    
    return commands.some(cmd => {
      const cmdLower = cmd.toLowerCase();
      // Exact match
      if (cleanText === cmdLower || cleanText.includes(cmdLower)) return true;
      
      // Word matching for multi-word commands
      const cmdWords = cmdLower.split(' ');
      const textWords = cleanText.split(' ');
      
      const matchCount = cmdWords.filter(word => 
        textWords.some(textWord => textWord === word || textWord.includes(word))
      ).length;
      
      return matchCount >= Math.ceil(cmdWords.length * 0.7);
    });
  }, []);

  // Instant command execution with proper debouncing
  const processCommand = useCallback((command: string) => {
    const now = Date.now();
    const normalizedCommand = command.toLowerCase().trim();
    
    // Prevent duplicate/rapid command execution
    if (processingCommand.current) {
      console.log("Command already processing, skipping:", normalizedCommand);
      return;
    }
    
    if (normalizedCommand === lastCommand.current && 
        now - lastCommandTime.current < commandDebounceMs) {
      console.log("Duplicate command debounced:", normalizedCommand);
      return;
    }
    
    processingCommand.current = true;
    lastCommand.current = normalizedCommand;
    lastCommandTime.current = now;
    
    console.log("Processing voice command:", normalizedCommand);
    setVoiceCommand(normalizedCommand);

    let commandProcessed = false;

    // Play command - immediate execution
    if (matchCommand(normalizedCommand, ['play', 'start', 'resume', 'begin'])) {
      if (!playerState.isPlaying) {
        togglePlayPause();
      }
      toast({ title: "Playing", description: "Music resumed" });
      commandProcessed = true;
    } 
    // Pause/Stop command - immediate execution
    else if (matchCommand(normalizedCommand, ['stop', 'pause', 'halt'])) {
      if (playerState.isPlaying) {
        togglePlayPause();
      }
      toast({ title: "Paused", description: "Music paused" });
      commandProcessed = true;
    }
    // Next command - immediate execution
    else if (matchCommand(normalizedCommand, ['next', 'skip', 'forward', 'next song'])) {
      nextSong();
      toast({ title: "Next Song", description: "Skipped to next track" });
      commandProcessed = true;
    }
    // Previous command - immediate execution
    else if (matchCommand(normalizedCommand, ['previous', 'prev', 'back', 'last song', 'go back'])) {
      prevSong();
      toast({ title: "Previous Song", description: "Returned to previous track" });
      commandProcessed = true;
    }
    // Help command
    else if (matchCommand(normalizedCommand, ['help', 'commands', 'what can i say'])) {
      setPanelState(prev => ({ ...prev, isOpen: true, mode: 'help' }));
      toast({ title: "Help Panel", description: "Voice command help opened" });
      commandProcessed = true;
    }
    // Close command
    else if (matchCommand(normalizedCommand, ['close', 'dismiss', 'exit panel', 'hide'])) {
      setPanelState(prev => ({ ...prev, isOpen: false, mode: 'listening' }));
      toast({ title: "Closed", description: "Panel closed" });
      commandProcessed = true;
    }
    // Logout command - immediate execution with cleanup
    else if (matchCommand(normalizedCommand, ['log out', 'logout', 'sign out', 'exit app', 'quit'])) {
      if (recognition.current) {
        try {
          recognition.current.stop();
          if (recognitionResetTimer.current) {
            clearTimeout(recognitionResetTimer.current);
          }
        } catch (e) {
          console.error("Error stopping recognition during logout:", e);
        }
      }
      
      toast({ title: "Logging Out", description: "Signing out..." });
      
      // Immediate logout
      logout();
      commandProcessed = true;
    }
    
    if (!commandProcessed) {
      toast({
        title: "Command Not Recognized",
        description: "Try saying 'help' for available commands",
        variant: "default"
      });
    }
    
    // Reset processing flag after short delay
    setTimeout(() => {
      processingCommand.current = false;
    }, 100);
  }, [matchCommand, playerState.isPlaying, togglePlayPause, nextSong, prevSong, setVoiceCommand, logout]);

  const toggleListening = () => {
    toggleVoiceListening();
    
    if (!isVoiceListening) {
      toast({
        title: "Voice Commands Active",
        description: "Listening for your voice commands..."
      });
    } else {
      toast({
        title: "Voice Commands Inactive",
        description: "Voice recognition stopped"
      });
    }
  };

  const handleClosePanel = () => {
    setPanelState({
      isListening: panelState.isListening,
      transcript: panelState.transcript,
      isOpen: false,
      mode: 'listening'
    });
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          className={`text-futuristic-muted transition-all duration-200 ${
            isVoiceListening 
              ? 'text-futuristic-accent1 bg-futuristic-accent1/10' 
              : 'hover:text-futuristic-accent1 hover:scale-105'
          }`}
          title={isVoiceListening ? "Voice commands active - click to disable" : "Enable voice commands"}
        >
          {isVoiceListening ? (
            <Mic className="h-5 w-5 text-futuristic-accent1" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </Button>
        {isVoiceListening && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-futuristic-bg"></span>
        )}
      </div>

      <Sheet open={panelState.isOpen} onOpenChange={(open) => setPanelState(prev => ({ ...prev, isOpen: open }))}>
        <SheetContent className="w-[300px] sm:w-[540px] border-futuristic-border bg-futuristic-bg/95 backdrop-blur-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-futuristic-accent1 flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              Voice Command Help
            </h2>
            <Button variant="ghost" size="icon" onClick={handleClosePanel} className="hover:bg-futuristic-accent1/10">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6 animate-fade-in">
            <p className="text-futuristic-muted text-sm">
              Say any of these commands clearly to control the player:
            </p>
            
            <Card className="border-futuristic-border bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Badge className="mr-2 bg-futuristic-accent1">Playback</Badge>
                  Media Control Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-futuristic-accent1">"Play" / "Start"</span>
                  <span className="text-futuristic-muted">▶️ Starts/resumes music</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-futuristic-accent1">"Pause" / "Stop"</span>
                  <span className="text-futuristic-muted">⏸️ Pauses current track</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-futuristic-accent1">"Next" / "Skip"</span>
                  <span className="text-futuristic-muted">⏭️ Skips to next song</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-futuristic-accent1">"Previous" / "Back"</span>
                  <span className="text-futuristic-muted">⏮️ Goes to previous song</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-futuristic-border bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Badge className="mr-2 bg-futuristic-accent2">System</Badge>
                  Application Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-futuristic-accent2">"Help"</span>
                  <span className="text-futuristic-muted">❓ Opens this help panel</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-futuristic-accent2">"Close"</span>
                  <span className="text-futuristic-muted">✅ Closes open panels</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-red-400">"Log Out"</span>
                  <span className="text-futuristic-muted">🚪 Signs out immediately</span>
                </div>
              </CardContent>
            </Card>

            {transcript && (
              <Card className="border-futuristic-accent1 bg-futuristic-accent1/10">
                <CardHeader>
                  <CardTitle className="text-sm text-futuristic-accent1">Last Command</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white font-mono">"{transcript}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default VoiceCommandManager;
