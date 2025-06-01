
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
import { VoiceCommandProcessor } from '@/lib/voiceCommandProcessor';

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
  const voiceProcessor = useRef<VoiceCommandProcessor | null>(null);
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
  
  // Initialize voice command processor
  useEffect(() => {
    voiceProcessor.current = new VoiceCommandProcessor();
    
    // Register all voice commands with enhanced patterns
    voiceProcessor.current.registerCommand(
      ['play', 'start', 'resume', 'begin', 'unpause', 'start music', 'play music'],
      () => {
        if (!playerState.isPlaying) {
          togglePlayPause();
        }
      },
      { title: "Playing", description: "Music resumed" },
      2
    );

    voiceProcessor.current.registerCommand(
      ['stop', 'pause', 'halt', 'wait', 'stop music', 'pause music'],
      () => {
        if (playerState.isPlaying) {
          togglePlayPause();
        }
      },
      { title: "Paused", description: "Music paused" },
      2
    );

    voiceProcessor.current.registerCommand(
      ['next', 'skip', 'forward', 'advance', 'next song', 'skip song', 'skip ahead'],
      () => {
        nextSong();
      },
      { title: "Next Song", description: "Playing next song" },
      2
    );

    voiceProcessor.current.registerCommand(
      ['previous', 'prev', 'back', 'backward', 'earlier', 'last song', 'go back', 'previous song'],
      () => {
        prevSong();
      },
      { title: "Previous Song", description: "Playing previous song" },
      2
    );

    voiceProcessor.current.registerCommand(
      ['help', 'commands', 'what can I say', 'options', 'available commands', 'show help'],
      () => {
        setPanelState(prev => ({
          ...prev,
          isOpen: true,
          mode: 'help'
        }));
      },
      { title: "Help", description: "Opened voice command help panel" },
      1
    );

    voiceProcessor.current.registerCommand(
      ['profile', 'user', 'account', 'my profile', 'settings', 'preferences', 'show profile'],
      () => {
        setPanelState(prev => ({
          ...prev,
          isOpen: true,
          mode: 'profile'
        }));
      },
      { title: "Profile", description: "Opened user profile panel" },
      1
    );

    voiceProcessor.current.registerCommand(
      ['close', 'dismiss', 'exit', 'hide', 'shut', 'cancel', 'close panel'],
      () => {
        setPanelState(prev => ({
          ...prev,
          isOpen: false,
          mode: 'listening'
        }));
      },
      { title: "Closed", description: "Panel closed" },
      1
    );

    // Enhanced logout command with comprehensive cleanup
    voiceProcessor.current.registerCommand(
      ['log out', 'logout', 'sign out', 'signout', 'exit app', 'quit', 'goodbye', 'log me out', 'sign me out'],
      () => {
        console.log("Processing logout command...");
        
        // Stop voice recognition immediately
        if (recognition.current) {
          try {
            recognition.current.stop();
            recognition.current.abort();
          } catch (e) {
            console.log("Voice recognition cleanup:", e);
          }
        }
        
        // Clear any timers
        if (recognitionResetTimer.current) {
          clearTimeout(recognitionResetTimer.current);
          recognitionResetTimer.current = null;
        }
        
        // Reset voice processor
        if (voiceProcessor.current) {
          voiceProcessor.current.reset();
        }
        
        // Stop any ongoing audio
        try {
          if (playerState.isPlaying) {
            togglePlayPause();
          }
        } catch (e) {
          console.log("Audio cleanup:", e);
        }
        
        // Clear state
        setTranscript("");
        setPanelState({
          isListening: false,
          transcript: "",
          isOpen: false,
          mode: "listening"
        });
        
        // Perform logout with a small delay to ensure cleanup
        setTimeout(() => {
          logout();
          toast({
            title: "Logged Out",
            description: "You've been successfully logged out"
          });
        }, 200);
      },
      { title: "Logging Out", description: "Cleaning up and signing out..." },
      3 // Highest priority
    );

    // Set contextual keywords for better recognition
    voiceProcessor.current.registerContextualKeywords('music', ['play', 'song', 'track', 'music', 'audio']);
    voiceProcessor.current.registerContextualKeywords('navigation', ['open', 'show', 'close', 'help', 'profile']);
    
  }, [togglePlayPause, nextSong, prevSong, logout, playerState.isPlaying]);

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
            recognition.current.maxAlternatives = 3; // Get multiple alternatives for better matching
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

  const startListening = () => {
    if (!recognition.current || !isReady) return;

    try {
      recognition.current.start();
      console.log("Speech recognition started");
      
      recognition.current.onresult = (event) => {
        const result = event.results[event.resultIndex];
        if (result?.isFinal) {
          const text = result[0].transcript.trim().toLowerCase();
          console.log("Voice command received:", text);
          
          setTranscript(text);
          setPanelState(prev => ({
            ...prev,
            transcript: text
          }));
          
          // Process command using enhanced processor
          if (voiceProcessor.current) {
            const processed = voiceProcessor.current.processCommand(text);
            if (!processed) {
              console.log("Command not recognized, trying alternatives...");
              // Try processing alternatives if available
              for (let i = 1; i < result.length; i++) {
                const altText = result[i].transcript.trim().toLowerCase();
                console.log("Trying alternative:", altText);
                if (voiceProcessor.current.processCommand(altText)) {
                  break;
                }
              }
            }
          }
          
          setVoiceCommand(text);
        }
      };

      recognition.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.log("No speech detected");
        } else if (event.error === 'aborted') {
          console.log("Speech recognition aborted");
        } else {
          console.error("Speech recognition error:", event.error);
          if (event.error !== 'network' && event.error !== 'audio-capture') {
            toast({
              title: "Voice Recognition Issue",
              description: "Speech recognition encountered a problem. Click the mic button to retry.",
              variant: "destructive"
            });
          }
        }
      };

      recognition.current.onend = () => {
        if (isVoiceListening && recognition.current) {
          try {
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
      toast({
        title: "Voice Recognition Error",
        description: "Could not start listening. Please try again later.",
        variant: "destructive"
      });
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
                    <span className="font-semibold">Play / Start / Resume</span>
                    <span className="text-futuristic-muted">Starts/resumes playback</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Stop / Pause</span>
                    <span className="text-futuristic-muted">Stops current playback</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Next / Skip</span>
                    <span className="text-futuristic-muted">Skips to next song</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Previous / Back</span>
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
                    <span className="font-semibold">Help / Commands</span>
                    <span className="text-futuristic-muted">Opens this help panel</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Profile / User</span>
                    <span className="text-futuristic-muted">Opens profile panel</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Close / Dismiss</span>
                    <span className="text-futuristic-muted">Closes any open panel</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Log Out / Sign Out</span>
                    <span className="text-futuristic-muted">Signs out of the app</span>
                  </div>
                </CardContent>
              </Card>
              
              {transcript && (
                <Card className="border-green-500/50 bg-green-900/20">
                  <CardContent className="pt-4">
                    <p className="text-sm text-green-400">
                      <strong>Last command:</strong> "{transcript}"
                    </p>
                  </CardContent>
                </Card>
              )}
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
                        <p>User profile information will appear here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-4">
                  <Card className="border-futuristic-border">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
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
