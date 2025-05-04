
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeVoiceControl } from '@/lib/voiceInitializer';
import SoundEffectsInitializer from '@/components/SoundEffectsInitializer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SoundEffectsInitializer />
    <App />
  </React.StrictMode>,
);

// Initialize voice control after the app is mounted
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeVoiceControl, 1000); // Slight delay to ensure app is initialized
});
