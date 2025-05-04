
import React, { useEffect } from 'react';
import { useAudio } from '@/lib/audioContext';
import VoiceControl from '@/components/VoiceControl';
import VoiceCommandHelp from '@/components/VoiceCommandPanel';

const VoiceControlProvider: React.FC = () => {
  const { 
    togglePlayPause,
    nextSong, 
    prevSong, 
    logout,
    profile
  } = useAudio();
  
  // Set up global event listeners for voice commands
  useEffect(() => {
    const handlePlay = () => togglePlayPause();
    const handlePause = () => togglePlayPause();
    const handleNext = () => nextSong();
    const handlePrevious = () => prevSong();
    const handleLogout = () => logout();
    
    // Add event listeners
    document.addEventListener('play-audio', handlePlay);
    document.addEventListener('pause-audio', handlePause);
    document.addEventListener('next-track', handleNext);
    document.addEventListener('previous-track', handlePrevious);
    document.addEventListener('user-logout', handleLogout);
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('play-audio', handlePlay);
      document.removeEventListener('pause-audio', handlePause);
      document.removeEventListener('next-track', handleNext);
      document.removeEventListener('previous-track', handlePrevious);
      document.removeEventListener('user-logout', handleLogout);
    };
  }, [togglePlayPause, nextSong, prevSong, logout]);
  
  // Only show when logged in (user has a profile)
  if (!profile) {
    return null;
  }
  
  return (
    <>
      <VoiceCommandHelp />
      <VoiceControl />
    </>
  );
};

export default VoiceControlProvider;
