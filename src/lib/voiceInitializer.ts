
import { injectVoiceControl } from './voiceInjector';
import { soundEffects } from './soundEffects';

// Initialize voice control when the app is ready
export function initializeVoiceControl() {
  // Ensure sound effects are initialized
  soundEffects.initialize();
  
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(injectVoiceControl, 1000); // Slight delay to ensure app is initialized
    });
  } else {
    // DOM already loaded, inject immediately with slight delay
    setTimeout(injectVoiceControl, 1000);
  }
}
