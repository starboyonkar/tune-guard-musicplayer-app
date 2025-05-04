
import React from 'react';
import VoiceControlProvider from './VoiceControlProvider';

// This component acts as a wrapper to add voice control to the app
// without modifying any existing components
const VoiceManager: React.FC = () => {
  return <VoiceControlProvider />;
};

export default VoiceManager;
