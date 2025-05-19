
import React, { useEffect, useState } from 'react';
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
    togglePlayPause
  } = useAudio();
  
  const [hasError, setHasError] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
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
  
  // Initialize audio context when component mounts - this helps with browser autoplay policies
  useEffect(() => {
    if (!audioInitialized) {
      setAudioInitialized(true);
      
      // Try to initialize audio context by user interaction
      const initAudio = () => {
        try {
          // Create and immediately suspend a temporary audio context
          const tempContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          tempContext.resume().then(() => {
            console.log("Audio context initialized by user gesture");
            tempContext.suspend();
          }).catch(err => {
            console.warn("Could not resume audio context:", err);
          });
        } catch (error) {
          console.error("Error initializing audio:", error);
        }
      };
      
      // Add and then remove event listeners to catch any user interaction
      const handleUserInteraction = () => {
        initAudio();
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
      
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
      
      return () => {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
    }
  }, [audioInitialized]);
  
  // Error boundary recovery
  useEffect(() => {
    const handleError = () => {
      setHasError(true);
      
      toast({
        title: "Application Error",
        description: "We encountered an issue. Attempting to recover...",
        variant: "destructive"
      });
      
      // Try to recover after a delay
      setTimeout(() => {
        setHasError(false);
      }, 2000);
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
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
