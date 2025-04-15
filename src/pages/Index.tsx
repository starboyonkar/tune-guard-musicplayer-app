
import { useEffect, useState } from 'react';
import { useAudio } from '@/lib/audioContext';
import SignUpForm from '@/components/SignUpForm';
import AudioPlayerUI from '@/components/AudioPlayerUI';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { soundEffects } from '@/lib/soundEffects';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Index = () => {
  const { isSignedUp, isVoiceListening, toggleVoiceListening } = useAudio();
  const [showControls, setShowControls] = useState(false);
  
  useEffect(() => {
    // Initialize sound effects
    soundEffects.initialize();
    
    // Show controls after a short delay for smoother loading experience
    const timer = setTimeout(() => setShowControls(true), 800);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleToggleVoice = () => {
    soundEffects.playTouchFeedback();
    toggleVoiceListening();
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* Dark grid background */}
      <div className="absolute inset-0 bg-[#0f0523] z-[-20]"></div>
      
      {/* Grid lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(#2d234580_1px,transparent_1px),linear-gradient(90deg,#2d234580_1px,transparent_1px)] bg-[size:30px_30px] z-[-15]"></div>
      
      {/* Glowing orbs in background */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl z-[-12] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl z-[-12] animate-pulse-slow"></div>
      
      {/* App logo - enlarged and centered for login */}
      {!isSignedUp && (
        <div className="absolute top-20 left-0 right-0 flex flex-col items-center justify-center">
          <div className="relative">
            <Avatar className="h-36 w-36 border-4 border-cyan-400 animate-pulse-slow shadow-lg shadow-cyan-400/20">
              <AvatarImage src="/lovable-uploads/0623ddf8-bcde-44d1-8664-65d83cc45e24.png" alt="TUNE GUARD" />
              <AvatarFallback className="bg-black">TG</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 -mb-2 left-0 right-0 text-center">
              <span className="text-xs font-semibold text-cyan-400 neon-text">© TUNE GUARD</span>
            </div>
          </div>
        </div>
      )}
      
      {/* App logo for signed in state */}
      {isSignedUp && (
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <Avatar className="h-10 w-10 border border-cyan-400/30 animate-pulse-slow shadow-lg">
            <AvatarImage src="/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png" alt="TUNE GUARD" />
            <AvatarFallback>TG</AvatarFallback>
          </Avatar>
          <span className="text-lg font-semibold neon-text">TUNE GUARD</span>
        </div>
      )}
      
      {/* Voice control toggle before login */}
      {!isSignedUp && showControls && (
        <div className="absolute top-4 right-4 z-10 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleToggleVoice}
                  className={isVoiceListening 
                    ? "bg-cyan-500/30 border border-cyan-500 text-cyan-300 shadow-glow" 
                    : "bg-gray-900/50 border border-gray-700 text-gray-400"}
                >
                  {isVoiceListening ? <Mic className="animate-pulse" /> : <MicOff />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black/80 border-cyan-900 text-cyan-300">
                <p>Voice Control {isVoiceListening ? "On" : "Off"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mt-2 text-xs text-cyan-400/60">
            {isVoiceListening ? "Voice Control On" : "Voice Control Off"}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="container mx-auto relative z-10">
        {isSignedUp ? <AudioPlayerUI /> : <SignUpForm />}
      </div>
    </div>
  );
};

export default Index;
