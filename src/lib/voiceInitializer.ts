
import { injectVoiceControl } from './voiceInjector';

// Initialize voice control when the app is ready
export function initializeVoiceControl() {
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
