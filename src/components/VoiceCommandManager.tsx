
import React, { useState, useEffect, useRef } from 'react';
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
  
  const recognitionResetTimer = useRef<number | null>(null);
  const commandCooldown = useRef<boolean>(false);
  
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
          } else {
            toast({
              title: "Voice Commands Unavailable",
              description: "Your browser doesn't support speech recognition",
              variant: "destructive"
            });
          }
        }
        return false;
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        toast({
          title: "Voice Commands Error",
          description: "Could not initialize speech recognition",
          variant: "destructive"
        });
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
          
          if (confidence > 0.6) {
            setTranscript(text);
            setPanelState(prev => ({
              ...prev,
              transcript: text
            }));
            processCommand(text);
          }
        }
      };

      recognition.current.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error("Speech recognition error:", event.error);
        }
      };

      recognition.current.onend = () => {
        if (isVoiceListening && recognition.current) {
          if (recognitionResetTimer.current) {
            clearTimeout(recognitionResetTimer.current);
          }
          
          recognitionResetTimer.current = window.setTimeout(() => {
            if (isVoiceListening && recognition.current) {
              try {
                recognition.current.start();
              } catch (e) {
                console.log("Error restarting speech recognition:", e);
              }
            }
          }, 500);
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
      
      if (recognitionResetTimer.current) {
        clearTimeout(recognitionResetTimer.current);
        recognitionResetTimer.current = null;
      }
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const matchCommand = (text: string, commands: string[]): boolean => {
    const cleanText = text.replace(/[^\w\s]/g, '').toLowerCase();
    
    return commands.some(cmd => {
      const cmdWords = cmd.split(' ');
      const textWords = cleanText.split(' ');
      
      if (cleanText.includes(cmd)) return true;
      
      const matchCount = cmdWords.filter(word => 
        textWords.some(textWord => 
          textWord.includes(word) || word.includes(textWord)
        )
      ).length;
      
      return matchCount >= Math.ceil(cmdWords.length * 0.7);
    });
  };

  const processCommand = (command: string) => {
    if (commandCooldown.current) return;
    
    console.log("Processing voice command:", command);
    setVoiceCommand(command);

    let commandProcessed = false;

    // Prevent rapid command execution
    commandCooldown.current = true;
    setTimeout(() => {
      commandCooldown.current = false;
    }, 800);

    if (matchCommand(command, ['play', 'start', 'resume', 'begin'])) {
      if (!playerState.isPlaying) {
        togglePlayPause();
        toast({
          title: "▶️ Playing",
          description: "Music resumed via voice command"
        });
      }
      commandProcessed = true;
    } 
    else if (matchCommand(command, ['stop', 'pause', 'halt'])) {
      if (playerState.isPlaying) {
        togglePlayPause();
        toast({
          title: "⏸️ Paused",
          description: "Music paused via voice command"
        });
      }
      commandProcessed = true;
    }
    else if (matchCommand(command, ['next', 'skip', 'forward', 'next song'])) {
      nextSong();
      toast({
        title: "⏭️ Next Song",
        description: "Skipped to next track"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['previous', 'prev', 'back', 'last song', 'go back'])) {
      prevSong();
      toast({
        title: "⏮️ Previous Song",
        description: "Returned to previous track"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['help', 'commands', 'what can i say'])) {
      setPanelState({
        isListening: panelState.isListening,
        transcript: panelState.transcript,
        isOpen: true,
        mode: 'help'
      });
      toast({
        title: "❓ Help Panel",
        description: "Voice command help opened"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['close', 'dismiss', 'exit panel', 'hide'])) {
      setPanelState({
        isListening: panelState.isListening,
        transcript: panelState.transcript,
        isOpen: false,
        mode: 'listening'
      });
      toast({
        title: "✅ Closed",
        description: "Panel closed via voice"
      });
      commandProcessed = true;
    }
    else if (matchCommand(command, ['log out', 'logout', 'sign out', 'exit app', 'quit'])) {
      // Enhanced logout with immediate cleanup
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
      
      toast({
        title: "🚪 Logging Out",
        description: "Stopping all tasks and signing out..."
      });
      
      // Immediate logout
      setTimeout(() => {
        logout();
      }, 100);
      
      commandProcessed = true;
    }
    
    if (!commandProcessed) {
      toast({
        title: "🤔 Command Not Recognized",
        description: "Try saying 'help' for available commands",
        variant: "default"
      });
    }
  };

  const toggleListening = () => {
    toggleVoiceListening();
    
    if (!isVoiceListening) {
      toast({
        title: "🎤 Voice Commands Active",
        description: "Listening for your voice commands..."
      });
    } else {
      toast({
        title: "🔇 Voice Commands Inactive",
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
          className={`text-futuristic-muted transition-all duration-300 ${
            isVoiceListening 
              ? 'text-futuristic-accent1 bg-futuristic-accent1/10' 
              : 'hover:text-futuristic-accent1'
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
