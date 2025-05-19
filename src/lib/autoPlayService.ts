
import { Song } from './types';
import { toast } from '@/components/ui/use-toast';

/**
 * A dedicated service for handling auto-play functionality
 * with improved reliability and error handling
 */
export const autoPlayService = {
  /**
   * Attempts to auto-play a song with enhanced reliability
   * Uses multiple retry attempts with exponential backoff
   */
  initializeAutoPlay: async (
    songs: Song[], 
    playSong: (id: string) => void, 
    setPlayerState: (state: any) => void
  ): Promise<boolean> => {
    if (!songs.length) {
      console.log("No songs available for auto-play");
      return false;
    }

    // Try to find the last played song from local storage
    const lastPlayedSongId = localStorage.getItem('tuneGuardLastPlayed');
    
    // Find the song to play (last played or first in list)
    const songToPlay = lastPlayedSongId 
      ? songs.find(s => s.id === lastPlayedSongId) || songs[0] 
      : songs[0];
    
    // Initialize retry mechanism
    const maxRetries = 3;
    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        // Add increasing delay between retries for better success rate
        if (retryCount > 0) {
          await new Promise(r => setTimeout(r, retryCount * 500));
        }
        
        console.log(`Auto-play attempt ${retryCount + 1} for song: ${songToPlay.title}`);
        
        // Try to play the song
        playSong(songToPlay.id);
        
        // Update player state directly as fallback mechanism
        setPlayerState(prevState => ({
          ...prevState,
          currentSongId: songToPlay.id,
          isPlaying: true
        }));
        
        // Store this as last played song
        localStorage.setItem('tuneGuardLastPlayed', songToPlay.id);
        
        // If we reach here without errors, mark as success
        success = true;
        
        if (retryCount > 0) {
          console.log(`Auto-play succeeded on attempt ${retryCount + 1}`);
        }
        
        // Show toast notification only on success
        toast({
          title: "Auto-Play Started",
          description: `Now playing: ${songToPlay.title}`
        });
        
        return true;
      } catch (error) {
        console.error(`Auto-play attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.error("All auto-play attempts failed");
          // Don't show error toast - better UX to fail silently for auto-play
          return false;
        }
      }
    }

    return success;
  },
  
  /**
   * Updates the last played song in local storage
   */
  updateLastPlayedSong: (songId: string): void => {
    if (songId) {
      localStorage.setItem('tuneGuardLastPlayed', songId);
    }
  }
};
