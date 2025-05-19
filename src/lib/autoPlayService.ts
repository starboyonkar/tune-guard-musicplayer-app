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
    const maxRetries = 5; // Increased from 3 to 5 for better reliability
    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        // Add increasing delay between retries for better success rate
        // But keep first attempt immediate for perceived performance
        if (retryCount > 0) {
          await new Promise(r => setTimeout(r, Math.min(retryCount * 300, 1000)));
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
        
        // Pre-buffer the next song to prevent playback gaps
        if (songs.length > 1) {
          const nextSongIndex = (songs.indexOf(songToPlay) + 1) % songs.length;
          const nextSong = songs[nextSongIndex];
          if (nextSong && nextSong.source) {
            const preloadAudio = new Audio();
            preloadAudio.preload = 'auto';
            preloadAudio.src = nextSong.source;
            preloadAudio.load();
            
            // Remove the preload after a few seconds
            setTimeout(() => {
              preloadAudio.src = '';
            }, 5000);
          }
        }
        
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
          description: `Now playing: ${songToPlay.title}`,
          id: "autoplay-success", // Prevent duplicate toasts
        });
        
        return true;
      } catch (error) {
        console.error(`Auto-play attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.error("All auto-play attempts failed");
          // Show discrete error toast only after all attempts fail
          toast({
            title: "Auto-Play Issue",
            description: "Starting playback automatically failed. Try playing manually.",
            variant: "destructive",
            id: "autoplay-error"
          });
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
  },
  
  /**
   * Optimized function to begin playback immediately after profile creation
   * Designed specifically for the post-login experience
   */
  startPlaybackAfterLogin: async (
    songs: Song[],
    playSong: (id: string) => void,
    setPlayerState: (state: any) => void
  ): Promise<boolean> => {
    try {
      // Attempt to immediately start audio context through a silent audio element
      try {
        const silentAudio = new Audio();
        silentAudio.volume = 0.01;
        await silentAudio.play();
        setTimeout(() => {
          silentAudio.pause();
          silentAudio.src = '';
        }, 100);
      } catch (e) {
        console.log("Silent audio warmup failed, continuing anyway:", e);
      }

      // Start playback with minimal delay
      const startSuccess = await autoPlayService.initializeAutoPlay(songs, playSong, setPlayerState);
      
      // If standard initialization failed, try emergency direct approach
      if (!startSuccess && songs.length > 0) {
        console.log("Using emergency direct playback approach");
        try {
          // Direct player state manipulation for immediate response
          setPlayerState(prevState => ({
            ...prevState,
            currentSongId: songs[0].id,
            isPlaying: true
          }));
          
          // Dispatch a fake user interaction event to help bypass autoplay restrictions
          const event = new CustomEvent('play-song', { 
            detail: { songId: songs[0].id } 
          });
          document.dispatchEvent(event);
          
          return true;
        } catch (err) {
          console.error("Emergency playback failed:", err);
          return false;
        }
      }
      
      return startSuccess;
    } catch (error) {
      console.error("Post-login playback error:", error);
      return false;
    }
  }
};
