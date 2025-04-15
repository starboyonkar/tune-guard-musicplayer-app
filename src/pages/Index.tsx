
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
    
    // Set up the dynamic background gradient
    const root = document.documentElement;
    const updateGradient = () => {
      const hue1 = Math.floor(Math.random() * 20) + 200; // Blue range
      const hue2 = Math.floor(Math.random() * 20) + 180; // Blue-cyan range
      root.style.setProperty(
        '--dynamic-gradient', 
        `linear-gradient(135deg, hsla(${hue1}, 80%, 98%, 0.9), hsla(${hue2}, 80%, 90%, 0.95))` // Lighter, whiter gradient
      );
    };
    
    updateGradient();
    const interval = setInterval(updateGradient, 3000);
    
    // Show controls after a short delay for smoother loading experience
    const timer = setTimeout(() => setShowControls(true), 800);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleToggleVoice = () => {
    soundEffects.playTouchFeedback();
    toggleVoiceListening();
  };

  return (
    <div className="min-h-screen w-full bg-futuristic-bg overflow-hidden relative">
      {/* Background gradient elements - updated to white/light blue */}
      <div className="absolute inset-0 bg-white/90 z-[-20]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      
      {/* Animated grid lines for cyberpunk effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_#fff_1px),_linear-gradient(90deg,_transparent_1px,_#f0f8ff_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,white)] opacity-10 z-[-15]"></div>
      
      {/* App logo - enlarged and centered for login */}
      <div className={`${!isSignedUp ? 'absolute top-6 left-0 right-0 flex flex-col items-center justify-center' : 'absolute top-4 left-4 flex items-center space-x-2'}`}>
        <Avatar className={`${!isSignedUp ? 'h-32 w-32' : 'h-10 w-10'} border border-white/30 animate-pulse-slow shadow-lg`}>
          <AvatarImage src="/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png" alt="TUNE GUARD" />
          <AvatarFallback>TG</AvatarFallback>
        </Avatar>
        {isSignedUp && <span className="text-lg font-semibold neon-text">TUNE GUARD</span>}
      </div>
      
      {/* Voice control toggle before login */}
      {!isSignedUp && showControls && (
        <div className="absolute top-4 right-4 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isVoiceListening ? "default" : "secondary"}
                  size="icon" 
                  onClick={handleToggleVoice}
                  className={isVoiceListening 
                    ? "bg-futuristic-accent1 text-white hover:bg-futuristic-accent1/90 animate-pulse-slow" 
                    : "bg-futuristic-bg/50 text-futuristic-muted border border-futuristic-border"}
                >
                  {isVoiceListening ? <Mic /> : <MicOff />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVoiceListening ? "Voice Control Active" : "Enable Voice Control"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {/* Main content */}
      <div className="container mx-auto min-h-screen flex items-center">
        {isSignedUp ? <AudioPlayerUI /> : <SignUpForm />}
      </div>
    </div>
  );
};

export default Index;
