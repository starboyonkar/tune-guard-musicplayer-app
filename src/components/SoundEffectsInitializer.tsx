
import { useEffect } from 'react';
import { soundEffects } from '@/lib/soundEffects';

const SoundEffectsInitializer = () => {
  useEffect(() => {
    // Initialize sound effects on component mount
    soundEffects.initialize();
    
    // Create empty audio files if they don't exist to prevent errors
    const createEmptyAudio = (filename: string) => {
      // Check if file exists first by sending a HEAD request
      fetch(`/audio/${filename}`, { method: 'HEAD' })
        .catch(() => {
          console.log(`Creating empty ${filename} audio file`);
          // Create a short silent audio file if missing
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const destination = audioContext.createMediaStreamDestination();
          oscillator.connect(destination);
          oscillator.start();
          oscillator.stop(0.1);  // short 100ms sound
          
          // Save it to IndexedDB for future use
          if ('indexedDB' in window) {
            const request = indexedDB.open('sound-effects-db', 1);
            
            request.onupgradeneeded = function() {
              const db = request.result;
              if (!db.objectStoreNames.contains('audio-files')) {
                db.createObjectStore('audio-files');
              }
            };
            
            request.onsuccess = function() {
              const db = request.result;
              const transaction = db.transaction(['audio-files'], 'readwrite');
              const store = transaction.objectStore('audio-files');
              store.put(new Blob([]), filename);
            };
          }
        });
    };
    
    // Ensure audio files exist
    ['touch.mp3', 'notification.mp3', 'error.mp3', 'success.mp3', 'activation.mp3', 'deactivation.mp3', 'command-recognized.mp3'].forEach(createEmptyAudio);
    
  }, []);
  
  return null; // This is a utility component that doesn't render anything
};

export default SoundEffectsInitializer;
