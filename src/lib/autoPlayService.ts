import { Song } from './types';
import { toast } from '@/components/ui/use-toast';
import { audioSupport } from './audioSupport';

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

    // Filter out songs with no source for guaranteed playback
    const validSongs = songs.filter(song => song.source && song.source.trim() !== '');
    if (validSongs.length === 0) {
      console.log("No valid songs with source URLs available");
      return false;
    }

    // Try to find the last played song from local storage
    const lastPlayedSongId = localStorage.getItem('tuneGuardLastPlayed');
    
    // Find the song to play (last played or first in list)
    const songToPlay = lastPlayedSongId 
      ? validSongs.find(s => s.id === lastPlayedSongId) || validSongs[0] 
      : validSongs[0];
    
    // Initialize retry mechanism
    const maxRetries = 5;
    let retryCount = 0;
    let success = false;

    // Initialize audio context to help with autoplay restrictions
    try {
      await audioSupport.initializeAudioContext();
      await audioSupport.unlockAudio();
    } catch (err) {
      console.warn("Failed to pre-initialize audio:", err);
      // Continue anyway as it might still work
    }

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
        setPlayerState({
          currentSongId: songToPlay.id,
          isPlaying: true
        });
        
        // Pre-buffer the next song to prevent playback gaps
        if (validSongs.length > 1) {
          try {
            const nextSongIndex = (validSongs.indexOf(songToPlay) + 1) % validSongs.length;
            const nextSong = validSongs[nextSongIndex];
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
          } catch (e) {
            console.warn("Failed to prebuffer next song:", e);
            // Non-critical error, continue
          }
        }
        
        // Store this as last played song
        localStorage.setItem('tuneGuardLastPlayed', songToPlay.id);
        
        // If we reach here without errors, mark as success
        success = true;
        
        if (retryCount > 0) {
          console.log(`Auto-play succeeded on attempt ${retryCount + 1}`);
        }
        
        // Show toast notification only on success and not on the first load
        // to avoid overwhelming the user
        const isFirstLoad = !localStorage.getItem('tuneGuardHasPlayedBefore');
        if (!isFirstLoad) {
          toast({
            title: "Auto-Play Started",
            description: `Now playing: ${songToPlay.title}`,
            variant: "default"
          });
        }
        
        // Mark that we've played before
        localStorage.setItem('tuneGuardHasPlayedBefore', 'true');
        
        return true;
      } catch (error) {
        console.error(`Auto-play attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.error("All auto-play attempts failed");
          // Show discrete error toast only after all attempts fail
          // And not on the first load to avoid confusion
          const isFirstLoad = !localStorage.getItem('tuneGuardHasPlayedBefore');
          if (!isFirstLoad) {
            toast({
              title: "Auto-Play Issue",
              description: "Starting playback automatically failed. Try playing manually.",
              variant: "destructive"
            });
          }
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
      // Filter out invalid songs
      const validSongs = songs.filter(song => song.source && song.source.trim() !== '');
      if (validSongs.length === 0) {
        console.log("No valid songs with source URLs available for playback");
        return false;
      }

      // Attempt to immediately start audio context through a silent audio element
      try {
        await audioSupport.unlockAudio();
      } catch (e) {
        console.log("Silent audio warmup failed, continuing anyway:", e);
        // Continue anyway as it might still work
      }

      // Start playback with minimal delay
      const startSuccess = await autoPlayService.initializeAutoPlay(validSongs, playSong, setPlayerState);
      
      // If standard initialization failed, try emergency direct approach
      if (!startSuccess && validSongs.length > 0) {
        console.log("Using emergency direct playback approach");
        try {
          // Direct player state manipulation for immediate response
          setPlayerState({
            currentSongId: validSongs[0].id,
            isPlaying: true
          });
          
          // Create a separate audio element to try forcing playback
          const emergencyAudio = new Audio(validSongs[0].source);
          
          // Use more aggressive audio forcing technique
          const forcedPlay = await audioSupport.forcePlayback(emergencyAudio);
          
          if (forcedPlay) {
            // If emergency audio started, we can stop it and let the real player take over
            setTimeout(() => {
              emergencyAudio.pause();
              emergencyAudio.src = '';
              
              // Try normal play again
              playSong(validSongs[0].id);
            }, 100);
          }
          
          // Dispatch a fake user interaction event to help bypass autoplay restrictions
          const event = new CustomEvent('play-song', { 
            detail: { songId: validSongs[0].id } 
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
