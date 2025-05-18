
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

const AudioPlayerUI: React.FC = () => {
  const { 
    logout, 
    profile, 
    songs, 
    playerState, 
    playSong,
    togglePlayPause
  } = useAudio();
  
  // Auto-play first song after login
  useEffect(() => {
    // Small delay to ensure all components are properly mounted
    const timer = setTimeout(() => {
      if (songs.length > 0 && !playerState.isPlaying && !playerState.currentSongId) {
        try {
          playSong(songs[0].id);
          console.log("Auto-playing first song after login:", songs[0].title);
          toast({
            title: "Welcome back!",
            description: `Now playing: ${songs[0].title} by ${songs[0].artist}`
          });
        } catch (error) {
          console.error("Error auto-playing first song:", error);
        }
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [songs, playSong, playerState.isPlaying, playerState.currentSongId]);
  
  // Enhanced logout handler that ensures clean termination of all processes
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
        
        {/* Hearing Protection Visual Feedback Panel */}
        <Card className="mb-4">
          <HearingProtection />
        </Card>
        
        {/* Songs List */}
        <Card className="p-4 mb-4">
          <SongsList />
        </Card>
        
        {/* Advanced Waveform Analyzer */}
        <Card className="mt-4 p-4">
          <WaveformAnalyzer />
        </Card>
        
        {/* Side panels for smaller screens */}
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
