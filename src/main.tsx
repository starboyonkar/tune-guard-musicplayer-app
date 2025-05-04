
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initializeVoiceControl } from '@/lib/voiceInitializer';
import SoundEffectsInitializer from '@/components/SoundEffectsInitializer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <SoundEffectsInitializer />
      <App />
    </Router>
  </React.StrictMode>,
);

// Initialize voice control after the app is mounted
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeVoiceControl, 1000); // Slight delay to ensure app is initialized
});
