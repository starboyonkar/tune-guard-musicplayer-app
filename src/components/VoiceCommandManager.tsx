
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
    isOpen: false,
    mode: null
  });

  useEffect(() => {
    // Initialize speech recognition
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = false;
        recognition.current.lang = 'en-US';
        setIsReady(true);
      } else {
        console.error("Speech recognition not supported in this browser");
        toast({
          title: "Voice Commands Unavailable",
          description: "Your browser doesn't support speech recognition",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
    }

    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (e) {
          console.log("Error stopping speech recognition:", e);
        }
      }
    };
  }, []);

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
      
      recognition.current.onresult = (event) => {
        const result = event.results[event.resultIndex];
        if (result.isFinal) {
          const text = result[0].transcript.trim().toLowerCase();
          setTranscript(text);
          processCommand(text);
        }
      };

      recognition.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          // This is a common error, no need to show it to the user
          console.log("No speech detected");
        } else {
          console.error("Speech recognition error:", event.error);
          toast({
            title: "Voice Recognition Error",
            description: `Error: ${event.error}`,
            variant: "destructive"
          });
        }
      };

      recognition.current.onend = () => {
        // Automatically restart if we're still supposed to be listening
        if (isVoiceListening && recognition.current) {
          try {
            recognition.current.start();
          } catch (e) {
            console.log("Error restarting speech recognition:", e);
          }
        }
      };
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopListening = () => {
    if (!recognition.current) return;
    
    try {
      recognition.current.stop();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const processCommand = (command: string) => {
    console.log("Processing voice command:", command);
    setVoiceCommand(command);

    // Handle specific commands
    if (command.includes('play')) {
      togglePlayPause();
      toast({
        title: playerState.isPlaying ? "Playing" : "Pausing",
        description: playerState.isPlaying ? "Music resumed" : "Music paused"
      });
    } 
    else if (command.includes('stop') || command.includes('pause')) {
      if (playerState.isPlaying) {
        togglePlayPause();
        toast({
          title: "Stopped",
          description: "Music stopped"
        });
      }
    }
    else if (command.includes('next')) {
      nextSong();
      toast({
        title: "Next Song",
        description: "Playing next song"
      });
    }
    else if (command.includes('previous') || command.includes('prev') || command.includes('back')) {
      prevSong();
      toast({
        title: "Previous Song",
        description: "Playing previous song"
      });
    }
    else if (command.includes('help')) {
      setPanelState({
        isOpen: true,
        mode: 'help'
      });
      toast({
        title: "Help",
        description: "Opened voice command help panel"
      });
    }
    else if (command.includes('profile') || command.includes('user')) {
      setPanelState({
        isOpen: true,
        mode: 'profile'
      });
      toast({
        title: "Profile",
        description: "Opened user profile panel"
      });
    }
    else if (command.includes('close')) {
      setPanelState({
        isOpen: false,
        mode: null
      });
      toast({
        title: "Closed",
        description: "Panel closed"
      });
    }
    else if (command.includes('log out') || command.includes('logout') || command.includes('sign out')) {
      logout();
      toast({
        title: "Logged Out",
        description: "You've been logged out"
      });
    }
    else {
      toast({
        title: "Command Not Recognized",
        description: `"${command}" is not a valid command`,
        variant: "destructive"
      });
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
      isOpen: false,
      mode: null
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
        >
          {isVoiceListening ? (
            <Mic className="h-5 w-5 text-futuristic-accent1" />
          ) : (
            <MicOff className="h-5 w-5" />
          )}
        </Button>
        {isVoiceListening && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
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
