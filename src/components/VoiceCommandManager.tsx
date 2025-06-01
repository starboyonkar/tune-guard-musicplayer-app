
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAudio } from '@/lib/audioContext';
import { Mic, MicOff, X, HelpCircle, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
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
  
  // Track initialization attempts and error messages 
  const initAttempts = useRef(0);
  const maxInitAttempts = 3;
  const errorTimeouts = useRef<Record<string, number>>({});
  const lastErrorTime = useRef<Record<string, number>>({});
  const recognitionResetTimer = useRef<number | null>(null);
  
  useEffect(() => {
    // Only initialize speech recognition when needed
    const initializeSpeechRecognition = () => {
      try {
        if (typeof window !== 'undefined') {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';
            setIsReady(true);
            console.log("Speech recognition initialized successfully");
            return true;
          } else if (initAttempts.current < maxInitAttempts) {
            initAttempts.current += 1;
            console.warn("Speech recognition not supported in this browser");
            // Only show this error once
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
          // Only show this error once
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
    
    // Only initialize when user enables voice listening
    if (isVoiceListening && !isReady) {
      initializeSpeechRecognition();
    }

    // Cleanup function
    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
          console.log("Speech recognition stopped during cleanup");
        } catch (e) {
          console.log("Error stopping speech recognition during cleanup:", e);
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

  // Helper to throttle error messages
  const showThrottledToast = (key: string, title: string, description: string, variant: "default" | "destructive" = "default") => {
    const now = Date.now();
    // Only show error once every 10 seconds for the same error type
    if (!lastErrorTime.current[key] || now - lastErrorTime.current[key] > 10000) {
      lastErrorTime.current[key] = now;
      toast({
        title,
        description,
        variant
      });
    }
  };

  const startListening = () => {
    if (!recognition.current || !isReady) return;

    try {
      recognition.current.start();
      console.log("Speech recognition started");
      
      recognition.current.onresult = (event) => {
        const result = event.results[event.resultIndex];
        if (result?.isFinal) {
          const text = result[0].transcript.trim().toLowerCase();
          setTranscript(text);
          setPanelState(prev => ({
            ...prev,
            transcript: text
          }));
          processCommand(text);
        }
      };

      recognition.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          // This is a common error, no need to show it to the user
          console.log("No speech detected");
        } else if (event.error === 'aborted') {
          // This happens when the recognition is stopped deliberately
          console.log("Speech recognition aborted");
        } else {
          console.error("Speech recognition error:", event.error);
          // Only show critical errors and limit frequency
          if (event.error !== 'network' && event.error !== 'audio-capture') {
            showThrottledToast(
              `speech-error-${event.error}`,
              "Voice Recognition Issue",
              "Speech recognition encountered a problem. Click the mic button to retry.",
              "destructive"
            );
          }
        }
      };

      recognition.current.onend = () => {
        // Automatically restart if we're still supposed to be listening
        if (isVoiceListening && recognition.current) {
          try {
            // Use a more reliable way to restart recognition with exponential backoff
            const delayTime = Math.min(3000, 500 * Math.pow(1.5, initAttempts.current));
            
            if (recognitionResetTimer.current) {
              clearTimeout(recognitionResetTimer.current);
            }
            
            recognitionResetTimer.current = window.setTimeout(() => {
              if (isVoiceListening && recognition.current) {
                try {
                  recognition.current.start();
                  console.log("Speech recognition restarted automatically");
                } catch (e) {
                  console.log("Error restarting speech recognition:", e);
                  initAttempts.current += 1;
                }
              }
            }, delayTime);
          } catch (e) {
            console.log("Error setting restart timer:", e);
          }
        }
      };
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      showThrottledToast(
        "speech-start-error",
        "Voice Recognition Error",
        "Could not start listening. Please try again later.",
        "destructive"
      );
    }
  };

  const stopListening = () => {
    if (!recognition.current) return;
    
    try {
      recognition.current.stop();
      console.log("Speech recognition stopped");
      
      if (recognitionResetTimer.current) {
        clearTimeout(recognitionResetTimer.current);
        recognitionResetTimer.current = null;
      }
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  // More precise command matching with fuzzy matching for better accuracy
  const matchCommand = (text: string, commands: string[]): boolean => {
    // First try exact matching
    if (commands.some(cmd => text.includes(cmd))) {
      return true;
    }
    
    // Then try more lenient fuzzy matching for common variations/misspellings
    return commands.some(cmd => {
      const cmdWords = cmd.split(' ');
      
      // Enhanced matching logic for better accuracy
      const matchCount = cmdWords.filter(word => {
        // Check for exact word match
        if (text.includes(word)) return true;
        
        // Check for word with different suffix (e.g., "playing" for "play")
        if (word.length > 3 && text.includes(word.substring(0, word.length-1))) return true;
        
        // Check for common sound-alike words
        const soundAlikes: Record<string, string[]> = {
          'play': ['lay', 'pray', 'way', 'say'],
          'stop': ['spot', 'top', 'hop'],
          'pause': ['paws', 'cause', 'laws'],
          'next': ['text', 'nest'],
          'skip': ['ship', 'slip'],
          'previous': ['preious', 'prvious', 'previus'],
          'back': ['bat', 'black', 'track'],
          'help': ['held', 'kelp', 'health'],
          'close': ['clothes', 'clues', 'class'],
          'logout': ['log out', 'log-out', 'lock out', 'log aut']
        };
        
        // Check sound-alikes if this word has any defined
        if (word in soundAlikes && soundAlikes[word].some(alt => text.includes(alt))) {
          return true;
        }
        
        return false;
      }).length;
      
      // If most words in the command match, consider it a match
      // More lenient for longer commands (higher threshold for longer phrases)
      const matchThreshold = cmdWords.length <= 2 ? 0.8 : 0.7;
      return matchCount >= Math.max(1, Math.ceil(cmdWords.length * matchThreshold));
    });
  };

  const processCommand = (command: string) => {
    console.log("Processing voice command:", command);
    setVoiceCommand(command);

    let commandProcessed = false;

    // Improved command matching with more variations
    if (matchCommand(command, ['play', 'start', 'resume', 'begin', 'unpause'])) {
      if (!playerState.isPlaying) {
        togglePlayPause();
        toast({
          title: "Playing",
          description: "Music resumed"
        });
      }
      commandProcessed = true;
    } 
    else if (matchCommand(command, ['stop', 'pause', 'halt', 'wait'])) {
      if (playerState.isPlaying) {
        togglePlayPause();
        toast({
          title: "Paused",
          description: "Music paused"
        });
      }
      commandProcessed = true;
    }
    else if (matchCommand(command, ['next', 'skip', 'forward', 'advance', 'following', 'next song', 'skip ahead'])) {
      nextSong();
      toast({
        title: "Next Song",
        description: "Playing next song"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['previous', 'prev', 'back', 'backward', 'earlier', 'last song', 'go back'])) {
      prevSong();
      toast({
        title: "Previous Song",
        description: "Playing previous song"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['help', 'commands', 'what can I say', 'options', 'available commands', 'show help'])) {
      setPanelState({
        isListening: panelState.isListening,
        transcript: panelState.transcript,
        isOpen: true,
        mode: 'help'
      });
      toast({
        title: "Help",
        description: "Opened voice command help panel"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['profile', 'user', 'account', 'my profile', 'settings', 'preferences', 'show profile'])) {
      setPanelState({
        isListening: panelState.isListening,
        transcript: panelState.transcript,
        isOpen: true,
        mode: 'profile'
      });
      toast({
        title: "Profile",
        description: "Opened user profile panel"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['close', 'dismiss', 'exit', 'hide', 'shut', 'cancel', 'close panel'])) {
      setPanelState({
        isListening: panelState.isListening,
        transcript: panelState.transcript,
        isOpen: false,
        mode: 'listening'
      });
      toast({
        title: "Closed",
        description: "Panel closed"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['log out', 'logout', 'sign out', 'signout', 'exit app', 'quit', 'goodbye', 'log me out'])) {
      // Stop all activities and logout
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
      
      // Add a small timeout before logout to ensure cleanup is done
      setTimeout(() => {
        logout();
        toast({
          title: "Logged Out",
          description: "You've been logged out"
        });
      }, 100);
      
      commandProcessed = true;
    }
    
    if (!commandProcessed) {
      // This is where we'd typically show an error, but we'll suppress frequent alerts
      // Only show once every 10 seconds for unrecognized commands
      showThrottledToast(
        "unrecognized-command",
        "Hmm, didn't catch that",
        `Try saying "help" for available commands`,
        "default" // Changed to default to be less intrusive
      );
    }
  };

  const toggleListening = () => {
    toggleVoiceListening();
    
    if (!isVoiceListening) {
      toast({
        title: "Voice Commands Activated",
        description: "Listening for voice commands"
      });
    } else {
      toast({
        title: "Voice Commands Deactivated",
        description: "No longer listening for commands"
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
          className={`text-futuristic-muted ${isVoiceListening ? 'text-futuristic-accent1 animate-pulse' : ''}`}
          title={isVoiceListening ? "Voice commands active - click to disable" : "Enable voice commands"}
          aria-label={isVoiceListening ? "Disable voice commands" : "Enable voice commands"}
        >
          {isVoiceListening ? (
            <Mic className="h-5 w-5 text-futuristic-accent1" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </Button>
        {isVoiceListening && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        )}
      </div>

      <Sheet open={panelState.isOpen} onOpenChange={(open) => setPanelState(prev => ({ ...prev, isOpen: open }))}>
        <SheetContent className="w-[300px] sm:w-[540px] border-futuristic-border bg-futuristic-bg/95 backdrop-blur-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-futuristic-accent1">
              {panelState.mode === 'help' ? 'Voice Command Help' : 'User Profile'}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleClosePanel}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {panelState.mode === 'help' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-futuristic-muted mb-4">
                Say any of these commands to control the player:
              </p>
              
              <Card className="border-futuristic-border bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Badge className="mr-2 bg-futuristic-accent1">Playback</Badge>
                    Media Control Commands
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Play</span>
                    <span className="text-futuristic-muted">Starts/resumes playback</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Stop/Pause</span>
                    <span className="text-futuristic-muted">Stops current playback</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Next</span>
                    <span className="text-futuristic-muted">Skips to next song</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Previous</span>
                    <span className="text-futuristic-muted">Returns to previous song</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-futuristic-border bg-black/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Badge className="mr-2 bg-futuristic-accent2">Navigation</Badge>
                    Interface Commands
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Help</span>
                    <span className="text-futuristic-muted">Opens this help panel</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">User Profile</span>
                    <span className="text-futuristic-muted">Opens profile panel</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Close</span>
                    <span className="text-futuristic-muted">Closes any open panel</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Log Out</span>
                    <span className="text-futuristic-muted">Signs out of the app</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {panelState.mode === 'profile' && (
            <div className="animate-fade-in">
              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">
                    <Info className="mr-1 h-4 w-4" /> User Info
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <HelpCircle className="mr-1 h-4 w-4" /> Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="mt-4">
                  <Card className="border-futuristic-border">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* User info content */}
                        <p>User profile information will appear here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-4">
                  <Card className="border-futuristic-border">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Settings content */}
                        <p>User settings will appear here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default VoiceCommandManager;
