
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
  }
};
