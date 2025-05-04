
import { useEffect, useState } from 'react';
import { useAudio } from '@/lib/audioContext';
import SignUpForm from '@/components/SignUpForm';
import AudioPlayerUI from '@/components/AudioPlayerUI';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { soundEffects } from '@/lib/soundEffects';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { voiceRecognition } from '@/lib/voiceRecognition';

const Index = () => {
  const { isSignedUp, isVoiceListening, toggleVoiceListening } = useAudio();
  const [showControls, setShowControls] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  
  useEffect(() => {
    // Initialize sound effects
    soundEffects.initialize();
    
    // Check if voice recognition is supported
    setVoiceSupported(voiceRecognition.isSupported());
    
    // Set up the dynamic background gradient
    const root = document.documentElement;
    const updateGradient = () => {
      const hue1 = Math.floor(Math.random() * 20) + 200; // Blue range
      const hue2 = Math.floor(Math.random() * 20) + 180; // Blue-cyan range
      root.style.setProperty(
        '--dynamic-gradient', 
        `linear-gradient(135deg, hsla(${hue1}, 80%, 70%, 0.8), hsla(${hue2}, 70%, 80%, 0.9))`
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
      {/* Background gradient elements */}
      <div className="absolute inset-0 bg-black/80 z-[-20]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-futuristic-accent1/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-futuristic-accent2/20 rounded-full blur-3xl -z-10" />
      
      {/* Animated grid lines for cyberpunk effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_#000_1px),_linear-gradient(90deg,_transparent_1px,_#000_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-10 z-[-15]"></div>
      
      {/* App logo */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Avatar className="h-10 w-10 border border-white/10 animate-pulse-slow">
          <AvatarImage src="/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png" alt="TUNE GUARD" />
          <AvatarFallback>TG</AvatarFallback>
        </Avatar>
        <span className="text-lg font-semibold neon-text">TUNE GUARD</span>
      </div>
      
      {/* Voice control toggle before login */}
      {!isSignedUp && showControls && voiceSupported && (
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
