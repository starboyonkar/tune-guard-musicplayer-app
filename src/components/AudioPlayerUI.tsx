
import React from 'react';
import { Card } from '@/components/ui/card';
import PlayerControls from './PlayerControls';
import SongInfo from './SongInfo';
import Waveform from './Waveform';
import EQSettings from './EQSettings';
import VoiceCommandPanel from './VoiceCommandPanel';

const AudioPlayerUI: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl mx-auto p-4">
      <div className="w-full lg:w-3/5">
        {/* Main Player Card */}
        <Card className="glass border-futuristic-border w-full overflow-hidden mb-4">
          <SongInfo />
          <Waveform />
          <PlayerControls />
        </Card>
        
        {/* Side panels for smaller screens */}
        <div className="flex flex-col sm:flex-row gap-4 lg:hidden">
          <div className="w-full sm:w-1/2">
            <EQSettings />
          </div>
          <div className="w-full sm:w-1/2">
            <VoiceCommandPanel />
          </div>
        </div>
      </div>
      
      {/* Control Panels - hidden on small screens */}
      <div className="w-full lg:w-2/5 space-y-4 hidden lg:block">
        <EQSettings />
        <VoiceCommandPanel />
      </div>
    </div>
  );
};

export default AudioPlayerUI;
