
import { useEffect } from 'react';
import { soundEffects } from '@/lib/soundEffects';

const SoundEffectsInitializer: React.FC = () => {
  useEffect(() => {
    // Initialize sound effects on component mount
    try {
      soundEffects.initialize();
      console.log("Sound effects initialized successfully");
    } catch (error) {
      console.error("Failed to initialize sound effects:", error);
    }
    
    // Handle user interaction to enable audio
    const enableAudio = () => {
      soundEffects.initialize();
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
    
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, []);

  // This is a utility component that doesn't render anything
  return null;
};

export default SoundEffectsInitializer;
