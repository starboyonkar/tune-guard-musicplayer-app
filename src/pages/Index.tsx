
import { useEffect, useState } from 'react';
import { useAudio } from '@/lib/audioContext';
import SignUpForm from '@/components/SignUpForm';
import AudioPlayerUI from '@/components/AudioPlayerUI';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { soundEffects } from '@/lib/soundEffects';
import { autoPlayService } from '@/lib/autoPlayService';

const Index = () => {
  const { isSignedUp, songs, playSong, setPlayerState } = useAudio();
  const [showControls, setShowControls] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  
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
    
    // Show controls after a short delay for smoother loading experience
    const timer = setTimeout(() => setShowControls(true), 800);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);
  
  // Auto-play detection when user signs up
  useEffect(() => {
    // Only run this effect when transitioning from not signed up to signed up
    if (isSignedUp && !profileCreated) {
      setProfileCreated(true);
      
      // Begin immediate auto-play using the optimized post-login function
      if (songs.length > 0) {
        // Small timeout to ensure audio context is ready
        setTimeout(async () => {
          try {
            console.log("Starting post-login playback...");
            await autoPlayService.startPlaybackAfterLogin(songs, playSong, setPlayerState);
          } catch (error) {
            console.error("Post-login auto-play failed:", error);
          }
        }, 500);
      }
    }
  }, [isSignedUp, songs, profileCreated, playSong, setPlayerState]);

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
      
      {/* Main content with smoother transition */}
      <div className="container mx-auto min-h-screen flex items-center">
        {isSignedUp ? <AudioPlayerUI /> : <SignUpForm />}
      </div>
    </div>
  );
};

export default Index;
