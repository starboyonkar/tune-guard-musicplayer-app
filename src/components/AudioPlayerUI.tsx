
import React from 'react';
import { Card } from '@/components/ui/card';
import PlayerControls from './PlayerControls';
import SongInfo from './SongInfo';
import Waveform from './Waveform';
import WaveformAnalyzer from './WaveformAnalyzer';
import EQSettings from './EQSettings';
import FileUploader from './FileUploader';
import ProfileEditor from './ProfileEditor';
import SongsList from './SongsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Music, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';

const AudioPlayerUI: React.FC = () => {
  const { logout } = useAudio();
  
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto p-4">
      <div className="w-full">
        {/* Main Player Card */}
        <Card className="glass border-futuristic-border w-full overflow-hidden mb-4">
          <div className="flex justify-between items-center">
            <SongInfo />
            <div className="flex items-center">
              <ProfileEditor />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
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
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="eq">
                <Settings className="mr-1 h-4 w-4" /> EQ Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="eq">
              <Card>
                <EQSettings />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerUI;
