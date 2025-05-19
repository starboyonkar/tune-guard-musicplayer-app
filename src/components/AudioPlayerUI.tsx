
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import PlayerControls from './PlayerControls';
import SongInfo from './SongInfo';
import Waveform from './Waveform';
import WaveformAnalyzer from './WaveformAnalyzer';
import EQSettings from './EQSettings';
import FileUploader from './FileUploader';
import ProfileEditor from './ProfileEditor';
import SongsList from './SongsList';
import SirenDetectionControl from './SirenDetectionControl';
import HearingProtection from './HearingProtection';
import VoiceCommandManager from './VoiceCommandManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Music, LogOut, Siren, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';
import { toast } from '@/components/ui/use-toast';
import { useMobile } from '@/hooks/use-mobile';

const AudioPlayerUI: React.FC = () => {
  const { 
    logout, 
    profile, 
    songs, 
    playerState, 
    playSong,
    togglePlayPause
  } = useAudio();
  
  const isMobile = useMobile();
  
  // Enhanced auto-play with better reliability
  useEffect(() => {
    let autoplayAttempted = false;
    const MAX_AUTOPLAY_ATTEMPTS = 3;
    let currentAttempt = 0;
    
    // Improved auto-play with multiple retries and better error handling
    const attemptAutoplay = () => {
      if (autoplayAttempted || currentAttempt >= MAX_AUTOPLAY_ATTEMPTS) {
        return;
      }
      
      if (songs.length === 0) {
        console.log("No songs available for auto-play");
        return;
      }
      
      currentAttempt++;
      autoplayAttempted = true;
      
      // Find a suitable song to play
      const suitableSongs = songs.filter(song => 
        song.source && !song.source.includes('undefined') && !song.source.includes('null')
      );
      
      if (suitableSongs.length === 0) {
        console.log("No suitable songs found for autoplay");
        return;
      }
      
      try {
        const songToPlay = suitableSongs[0];
        console.log(`Auto-playing song: ${songToPlay.title}`);
        
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          playSong(songToPlay.id);
          
          toast({
            title: "Welcome to TUNE GUARD",
            description: `Now playing: ${songToPlay.title} by ${songToPlay.artist}`
          });
        }, 1000);
      } catch (error) {
        console.error("Error during auto-play:", error);
        
        // Try again with a delay
        setTimeout(() => {
          currentAttempt++;
          if (currentAttempt < MAX_AUTOPLAY_ATTEMPTS) {
            attemptAutoplay();
          }
        }, 2000);
      }
    };
    
    // Add a delay to ensure components are properly mounted
    const timer = setTimeout(attemptAutoplay, 1800);
    
    return () => clearTimeout(timer);
  }, [songs, playSong]);
  
  // Enhanced logout handler for better cleanup
  const handleLogout = () => {
    try {
      // Stop any currently playing music
      if (playerState.isPlaying) {
        togglePlayPause();
      }
      
      // Small delay to ensure audio is properly stopped
      setTimeout(() => {
        logout();
        console.log("User logged out successfully");
      }, 100);
    } catch (error) {
      console.error("Error during logout:", error);
      // Proceed with logout even if there's an error
      logout();
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto p-4">
      <div className="w-full">
        {/* Main Player Card */}
        <Card className="glass border-futuristic-border w-full overflow-hidden mb-4">
          <div className="flex justify-between items-center">
            <SongInfo />
            <div className="flex items-center">
              <VoiceCommandManager />
              <ProfileEditor />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-futuristic-muted hover:text-destructive"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Waveform />
          <PlayerControls />
        </Card>
        
        {/* File uploader with improved mobile support */}
        <Card className="mb-4 p-4">
          <FileUploader />
        </Card>
        
        {/* Songs List */}
        <Card className="p-4 mb-4">
          <SongsList />
        </Card>
        
        {/* Optimized layout for mobile */}
        {!isMobile && (
          <Card className="mt-4 p-4">
            <WaveformAnalyzer />
          </Card>
        )}
        
        {/* Adaptive panels based on device */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Tabs defaultValue="eq" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="eq">
                <Settings className="mr-1 h-4 w-4" /> EQ
              </TabsTrigger>
              <TabsTrigger value="siren">
                <Siren className="mr-1 h-4 w-4" /> Siren
              </TabsTrigger>
              <TabsTrigger value="hearing">
                <ShieldCheck className="mr-1 h-4 w-4" /> Protection
              </TabsTrigger>
            </TabsList>
            <TabsContent value="eq">
              <Card>
                <EQSettings />
              </Card>
            </TabsContent>
            <TabsContent value="siren">
              <Card>
                <SirenDetectionControl />
              </Card>
            </TabsContent>
            <TabsContent value="hearing">
              <Card>
                <HearingProtection />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerUI;
