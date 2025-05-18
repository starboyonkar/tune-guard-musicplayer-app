
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, HelpCircle } from 'lucide-react';
import { useAudio } from '@/lib/audioContext';
import { soundEffects } from '@/lib/soundEffects';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export type VoiceCommand = 
  | 'play' 
  | 'next' 
  | 'previous' 
  | 'stop' 
  | 'help' 
  | 'user profile' 
  | 'close' 
  | 'log out';

interface VoiceCommandManagerProps {
  isSignedUp?: boolean;
}

const VoiceCommandManager: React.FC<VoiceCommandManagerProps> = ({ isSignedUp }) => {
  const [isListening, setIsListening] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const { 
    playerState, 
    togglePlayPause, 
    nextSong, 
    prevSong, 
    logout,
    profile
  } = useAudio();

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const lastResult = event.results[lastResultIndex];
        
        if (lastResult.isFinal) {
          const command = lastResult[0].transcript.trim().toLowerCase();
          setTranscript(command);
          handleVoiceCommand(command);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice commands",
            variant: "destructive"
          });
          setIsListening(false);
        }
      };
    } else {
      toast({
        title: "Voice commands not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start/stop listening when isListening changes
  useEffect(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        soundEffects.playTouchFeedback();
        toast({
          title: "Voice commands activated",
          description: "Try saying 'Play', 'Stop', or 'Help'",
        });
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleVoiceCommand = (command: string) => {
    const commands: Record<VoiceCommand, () => void> = {
      'play': () => {
        togglePlayPause();
        toast({
          title: playerState.isPlaying ? "Paused" : "Playing",
        });
      },
      'next': () => {
        nextSong();
        toast({
          title: "Next Song",
        });
      },
      'previous': () => {
        prevSong();
        toast({
          title: "Previous Song",
        });
      },
      'stop': () => {
        if (playerState.isPlaying) {
          togglePlayPause();
          toast({
            title: "Stopped",
          });
        }
      },
      'help': () => {
        setShowHelp(true);
        setShowProfile(false);
        toast({
          title: "Showing help",
        });
      },
      'user profile': () => {
        if (isSignedUp) {
          setShowProfile(true);
          setShowHelp(false);
          toast({
            title: "Showing user profile",
          });
        }
      },
      'close': () => {
        setShowHelp(false);
        setShowProfile(false);
        toast({
          title: "Closed panel",
        });
      },
      'log out': () => {
        if (isSignedUp) {
          toast({
            title: "Logging out",
          });
          setTimeout(() => {
            logout();
          }, 1000);
        }
      }
    };

    // Process the spoken command
    Object.entries(commands).forEach(([key, action]) => {
      if (command.includes(key)) {
        soundEffects.playTouchFeedback();
        action();
      }
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleListening}
        className={`rounded-full p-2 transition-all ${
          isListening 
            ? 'bg-futuristic-accent1 text-white animate-pulse' 
            : 'bg-futuristic-bg/30 text-futuristic-muted'
        }`}
        aria-label={isListening ? "Stop listening" : "Start listening for voice commands"}
        title={isListening ? "Stop listening" : "Voice commands"}
      >
        {isListening ? (
          <Mic className="h-5 w-5 animate-pulse" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>

      {/* Help Sheet */}
      <Sheet open={showHelp} onOpenChange={setShowHelp}>
        <SheetContent side="right" className="glass-panel border-futuristic-border animate-fade-in">
          <SheetHeader className="text-center">
            <SheetTitle className="text-2xl font-bold neon-text flex items-center justify-center">
              <HelpCircle className="mr-2" /> Voice Commands
            </SheetTitle>
            <SheetDescription>
              Say these commands to control the audio player
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {[
              { command: "Play", description: "Play or resume the current song" },
              { command: "Stop", description: "Stop the current song" },
              { command: "Next", description: "Play the next song" },
              { command: "Previous", description: "Play the previous song" },
              { command: "Help", description: "Show this help panel" },
              { command: "User Profile", description: "Show your profile" },
              { command: "Close", description: "Close any open panel" },
              { command: "Log Out", description: "Log out of the app" }
            ].map((item, index) => (
              <div 
                key={item.command}
                className="p-3 rounded-md glass-element border border-futuristic-border animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="font-bold text-futuristic-accent1">{item.command}</h3>
                <p className="text-sm text-futuristic-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Sheet */}
      {isSignedUp && (
        <Sheet open={showProfile} onOpenChange={setShowProfile}>
          <SheetContent side="right" className="glass-panel border-futuristic-border animate-fade-in">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold neon-text">User Profile</SheetTitle>
              <SheetDescription>
                Your TuneGuard profile settings
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {profile && (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-block rounded-full p-1 bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 animate-pulse-slow">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-futuristic-bg">
                        <img 
                          src={profile.avatar || "/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png"} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="mt-2 text-xl font-bold">{profile.username}</h3>
                    <p className="text-futuristic-muted">{profile.email}</p>
                  </div>
                </>
              )}

              <div className="mt-6">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={logout}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Voice feedback indicator (optional) */}
      {isListening && transcript && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-futuristic-accent1 animate-fade-in">
          {transcript}
        </div>
      )}
    </>
  );
};

export default VoiceCommandManager;
