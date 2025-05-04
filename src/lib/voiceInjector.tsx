
import React from 'react';
import ReactDOM from 'react-dom/client';
import VoiceManager from '@/components/VoiceManager';

// This function injects the voice control UI into the DOM
// without modifying any existing components
export function injectVoiceControl() {
  // Create a container for the voice control UI
  const voiceControlContainer = document.createElement('div');
  voiceControlContainer.id = 'voice-control-container';
  document.body.appendChild(voiceControlContainer);
  
  // Render the voice control UI into the container
  const root = ReactDOM.createRoot(voiceControlContainer);
  root.render(
    <React.StrictMode>
      <VoiceManager />
    </React.StrictMode>
  );
}

// This function removes the voice control UI from the DOM
export function removeVoiceControl() {
  const container = document.getElementById('voice-control-container');
  if (container) {
    document.body.removeChild(container);
  }
}
