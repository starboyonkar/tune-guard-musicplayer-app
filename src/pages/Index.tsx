
import { useEffect } from 'react';
import { useAudio } from '@/lib/audioContext';
import SignUpForm from '@/components/SignUpForm';
import AudioPlayerUI from '@/components/AudioPlayerUI';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { soundEffects } from '@/lib/soundEffects';

const Index = () => {
  const { isSignedUp } = useAudio();
  
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
        `linear-gradient(135deg, hsla(${hue1}, 80%, 70%, 0.8), hsla(${hue2}, 70%, 80%, 0.9))`
      );
    };
    
    updateGradient();
    const interval = setInterval(updateGradient, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-futuristic-bg overflow-hidden relative">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-futuristic-accent1/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-futuristic-accent2/20 rounded-full blur-3xl -z-10" />
      
      {/* App logo */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Avatar className="h-10 w-10 border border-white/10">
          <AvatarImage src="/lovable-uploads/e7c069fb-6149-4e2a-aa7e-5549daf2514d.png" alt="TUNE GUARD" />
          <AvatarFallback>TG</AvatarFallback>
        </Avatar>
        <span className="text-lg font-semibold text-white">TUNE GUARD</span>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto min-h-screen flex items-center">
        {isSignedUp ? <AudioPlayerUI /> : <SignUpForm />}
      </div>
    </div>
  );
};

export default Index;
