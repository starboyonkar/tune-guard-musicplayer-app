
import { useEffect, useState } from 'react';
import { useAudio } from '@/lib/audioContext';
import SignUpForm from '@/components/SignUpForm';
import AudioPlayerUI from '@/components/AudioPlayerUI';
import SocialFooter from '@/components/SocialFooter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { soundEffects } from '@/lib/soundEffects';
import { autoPlayService } from '@/lib/autoPlayService';
import { audioSupport } from '@/lib/audioSupport';

const Index = () => {
  const { isSignedUp, songs, playSong, playerState } = useAudio();
  const [showControls, setShowControls] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  
  useEffect(() => {
    // Initialize sound effects
    soundEffects.initialize();
    
    // Pre-initialize audio context to help with autoplay
    audioSupport.initializeAudioContext();
    
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
  
  // Enhanced auto-play detection when user signs up
  useEffect(() => {
    // Only run this effect when transitioning from not signed up to signed up
    if (isSignedUp && !profileCreated) {
      setProfileCreated(true);
      
      // Filter out invalid songs
      const validSongs = songs.filter(song => song.source && song.source.trim() !== '');
      
      // Begin immediate auto-play using the optimized post-login function
      if (validSongs.length > 0) {
        console.log("Starting post-login playback...");
        
        // Prepare user's audio context with a silent sound to help with autoplay restrictions
        audioSupport.unlockAudio().then(() => {
          // Immediate attempt to start playback
          const startPlayback = async () => {
            try {
              // First try the enhanced service approach
              const success = await autoPlayService.startPlaybackAfterLogin(
                validSongs, 
                playSong, 
                () => {} // Placeholder setPlayerState
              );
              
              // If that didn't work, try direct playback as last resort
              if (!success) {
                console.log("Direct fallback playback attempt");
                playSong(validSongs[0].id);
              }
            } catch (error) {
              console.error("Direct playback failed:", error);
              
              // Fallback approach - try again after a short delay
              setTimeout(() => {
                if (validSongs.length > 0 && !playerState.isPlaying) {
                  playSong(validSongs[0].id);
                }
              }, 800);
            }
          };
          
          // Start immediately, don't wait
          startPlayback();
        });
      }
    }
  }, [isSignedUp, songs, profileCreated, playSong, playerState.isPlaying]);

  return (
    <div className="min-h-screen w-full bg-futuristic-bg overflow-hidden relative flex flex-col">
      {/* Background gradient elements */}
      <div className="absolute inset-0 bg-black/80 z-[-20]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-futuristic-accent1/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-futuristic-accent2/20 rounded-full blur-3xl -z-10" />
      
      {/* Animated grid lines for cyberpunk effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_#000_1px),_linear-gradient(90deg,_transparent_1px,_#000_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-10 z-[-15]"></div>
      
      {/* App logo */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
        <Avatar className="h-10 w-10 border border-white/10 animate-pulse-slow">
          <AvatarImage src="/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png" alt="TUNE GUARD" />
          <AvatarFallback>TG</AvatarFallback>
        </Avatar>
        <span className="text-lg font-semibold neon-text">TUNE GUARD</span>
      </div>
      
      {/* Main content with smoother transition */}
      <div className="container mx-auto flex-1 flex items-center">
        {isSignedUp ? <AudioPlayerUI /> : <SignUpForm />}
      </div>

      {/* Social Footer - only show when signed up */}
      {isSignedUp && (
        <div className="mt-auto">
          <SocialFooter />
        </div>
      )}
    </div>
  );
};

export default Index;
