
/**
 * Enhanced audio support utilities for reliable audio playback and features
 */
export const audioSupport = {
  /**
   * Attempts to initialize the audio context with a user gesture
   * This helps overcome browser autoplay restrictions
   */
  initializeAudioContext: async (): Promise<boolean> => {
    try {
      // Create a temporary audio context to test/initialize
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn("AudioContext not supported in this browser");
        return false;
      }
      
      const tempContext = new AudioContext();
      
      // Try to resume the context (needed in some browsers)
      if (tempContext.state === 'suspended') {
        await tempContext.resume();
      }
      
      // Create a short silent buffer to "warm up" the audio system
      const buffer = tempContext.createBuffer(1, 1, 22050);
      const source = tempContext.createBufferSource();
      source.buffer = buffer;
      source.connect(tempContext.destination);
      source.start(0);
      
      // If we get here, audio is working
      console.log("Audio context initialized successfully");
      
      // Clean up after a short delay
      setTimeout(() => {
        tempContext.close().catch(err => {
          console.warn("Error closing temporary audio context:", err);
        });
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      return false;
    }
  },
  
  /**
   * Create a silent audio element that can be used to "unlock" audio playback
   * on mobile devices
   */
  createSilentAudio: () => {
    const audio = new Audio();
    audio.autoplay = false;
    // Very short, silent audio file as a data URL
    audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    audio.volume = 0.01;
    audio.loop = false;
    return audio;
  },
  
  /**
   * Play a short silent sound to unlock audio playback on iOS and other
   * restrictive platforms that require user interaction
   */
  unlockAudio: async (): Promise<void> => {
    try {
      const silentAudio = audioSupport.createSilentAudio();
      silentAudio.muted = false;
      silentAudio.volume = 0.01;
      
      const playPromise = silentAudio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setTimeout(() => {
          silentAudio.pause();
          silentAudio.src = '';
          console.log("Audio unlock successful");
        }, 100);
      }
    } catch (error) {
      console.warn("Audio unlock failed, may require user interaction:", error);
    }
  },
  
  /**
   * Check if the browser supports audio playback and which formats
   */
  checkAudioSupport: (): { supported: boolean; formats: string[] } => {
    const audio = document.createElement('audio');
    if (!audio || !audio.canPlayType) {
      return { supported: false, formats: [] };
    }
    
    const formats = [];
    
    if (audio.canPlayType('audio/mpeg;').replace(/no/, '')) {
      formats.push('mp3');
    }
    
    if (audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) {
      formats.push('ogg');
    }
    
    if (audio.canPlayType('audio/wav; codecs="1"').replace(/no/, '')) {
      formats.push('wav');
    }
    
    if (audio.canPlayType('audio/aac;').replace(/no/, '')) {
      formats.push('aac');
    }
    
    return {
      supported: formats.length > 0,
      formats
    };
  },
  
  /**
   * Force an immediate audio playback attempt with multiple fallbacks
   * Useful for autoplay scenarios that are commonly blocked
   */
  forcePlayback: async (audioElement: HTMLAudioElement): Promise<boolean> => {
    try {
      // First, try unlocking audio generally
      await audioSupport.unlockAudio();
      
      // Try multiple approaches to force playback
      let playAttempts = 0;
      const maxAttempts = 3;
      
      const attemptPlay = async (): Promise<boolean> => {
        try {
          playAttempts++;
          console.log(`Playback attempt ${playAttempts}`);
          
          // Set some properties that might help with autoplay
          audioElement.muted = false;
          audioElement.volume = 0.1; // Start with lower volume
          audioElement.currentTime = 0;
          
          // Try playing with a timeout to give the audio system time
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              audioElement.play()
                .then(() => {
                  console.log("Playback started successfully");
                  // Gradually restore volume
                  setTimeout(() => {
                    if (audioElement.volume < 0.8) {
                      audioElement.volume = 0.8;
                    }
                  }, 300);
                  resolve();
                })
                .catch((error) => {
                  console.warn(`Play attempt ${playAttempts} failed:`, error);
                  resolve();
                });
            }, playAttempts * 100); // Increasing delay for each attempt
          });
          
          // Check if playback actually started
          if (!audioElement.paused) {
            return true;
          }
          
          // If we reached max attempts, try one final approach with user activation simulation
          if (playAttempts >= maxAttempts) {
            console.log("Trying final emergency playback approach");
            
            // Create and trigger a fake user interaction event
            const event = new Event('user-action');
            document.dispatchEvent(event);
            
            // Try with muted first (more likely to work) then unmute
            audioElement.muted = true;
            await audioElement.play();
            
            // If it worked, unmute after a short delay
            setTimeout(() => {
              if (!audioElement.paused) {
                audioElement.muted = false;
                audioElement.volume = 0.8;
              }
            }, 500);
            
            return !audioElement.paused;
          }
          
          if (audioElement.paused && playAttempts < maxAttempts) {
            // Try again with different approach
            return await attemptPlay();
          }
          
          return !audioElement.paused;
        } catch (error) {
          console.error("Playback attempt error:", error);
          return false;
        }
      };
      
      return await attemptPlay();
    } catch (error) {
      console.error("Force playback failed:", error);
      return false;
    }
  }
};
