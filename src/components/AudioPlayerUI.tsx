
import React from 'react';
import { Card } from '@/components/ui/card';
import PlayerControls from './PlayerControls';
import SongInfo from './SongInfo';
import Waveform from './Waveform';
import WaveformAnalyzer from './WaveformAnalyzer';
import EQSettings from './EQSettings';
import VoiceCommandPanel from './VoiceCommandPanel';
import FileUploader from './FileUploader';
import ProfileEditor from './ProfileEditor';
import PlaylistManager from './PlaylistManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Waveform as WaveformIcon, ListMusic, Settings } from 'lucide-react';

const AudioPlayerUI: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto p-4">
      <div className="w-full lg:w-3/5">
        {/* Main Player Card */}
        <Card className="glass border-futuristic-border w-full overflow-hidden mb-4">
          <div className="flex justify-between items-center">
            <SongInfo />
            <div className="p-4">
              <ProfileEditor />
            </div>
          </div>
          <Waveform />
          <PlayerControls />
        </Card>
        
        {/* File Uploader */}
        <FileUploader />
        
        {/* Advanced Waveform Analyzer */}
        <Card className="mt-4 p-4">
          <WaveformAnalyzer />
        </Card>
        
        {/* Side panels for smaller screens */}
        <div className="flex flex-col sm:flex-row gap-4 lg:hidden mt-4">
          <Tabs defaultValue="playlists" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="playlists">
                <ListMusic className="mr-1 h-4 w-4" /> Playlists
              </TabsTrigger>
              <TabsTrigger value="eq">
                <Settings className="mr-1 h-4 w-4" /> EQ
              </TabsTrigger>
              <TabsTrigger value="voice">
                <WaveformIcon className="mr-1 h-4 w-4" /> Voice
              </TabsTrigger>
            </TabsList>
            <TabsContent value="playlists">
              <Card className="p-4">
                <PlaylistManager />
              </Card>
            </TabsContent>
            <TabsContent value="eq">
              <Card>
                <EQSettings />
              </Card>
            </TabsContent>
            <TabsContent value="voice">
              <Card>
                <VoiceCommandPanel />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Control Panels - hidden on small screens */}
      <div className="w-full lg:w-2/5 space-y-4 hidden lg:block">
        <Card className="p-4">
          <PlaylistManager />
        </Card>
        <EQSettings />
        <VoiceCommandPanel />
      </div>
    </div>
  );
};

export default AudioPlayerUI;
