
import React, { useState, useEffect } from 'react';
import { useAudio } from '@/lib/audioContext';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { soundEffects } from '@/lib/soundEffects';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

const VoiceAssistantUI: React.FC = () => {
  const { 
    isVoiceListening, 
    toggleVoiceListening, 
    setVoiceCommand, 
    voiceCommand,
    processingVoice, 
    commandHistory 
  } = useAudio();
  
  const [visualizing, setVisualizing] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [pulse, setPulse] = useState(false);
  
  const { isListening, transcript } = useVoiceRecognition({
    onCommand: (command) => {
      setVoiceCommand(command);
    },
    enabled: isVoiceListening
  });
  
  // Pulse animation effect when voice is active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isListening) {
      interval = setInterval(() => {
        setPulse(prev => !prev);
        
        // Simulate mic levels based on background noise
        const randomVolume = Math.random() * 70;
        setMicVolume(randomVolume);
        
        // If there's a detected voice, increase the visualization
        if (transcript && transcript.length > 0) {
          setMicVolume(70 + Math.random() * 30);
          setVisualizing(true);
        }
      }, 300);
    } else {
      setMicVolume(0);
      setVisualizing(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening, transcript]);
  
  // Effect for visual feedback during command processing
  useEffect(() => {
    if (processingVoice) {
      setVisualizing(true);
      setMicVolume(90);
    } else if (!transcript) {
      setVisualizing(false);
    }
  }, [processingVoice, transcript]);
  
  // Sound effect when voice recognition state changes
  useEffect(() => {
    if (isListening) {
      soundEffects.playNotification();
    }
  }, [isListening]);
  
  // If voice isn't enabled, don't show the component
  if (!isVoiceListening) return null;
  
  return (
    <Card className="p-4 glass border-futuristic-accent2 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center">
          <Mic className={`h-4 w-4 mr-1 ${isListening ? 'text-green-500' : 'text-futuristic-muted'}`} />
          Voice Assistant
        </h3>
        
        <div className="flex items-center gap-2">
          {isListening && (
            <Badge variant="outline" className="text-xs bg-futuristic-accent1/20 animate-pulse">
              Listening
            </Badge>
          )}
          
          <button
            onClick={() => toggleVoiceListening()}
            className={`rounded-full p-1 transition-colors ${
              isListening 
                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                : 'bg-futuristic-muted/20 text-futuristic-muted hover:bg-futuristic-muted/30'
            }`}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* Voice visualization */}
      <div className="mb-3">
        <Progress 
          value={micVolume} 
          className={`h-2 ${visualizing ? 'bg-futuristic-accent1/30' : 'bg-futuristic-muted/20'}`}
        />
      </div>
      
      {/* Current transcript */}
      {transcript && (
        <div className="text-sm p-2 rounded bg-futuristic-bg/30 mb-3 border border-futuristic-border">
          {transcript}
        </div>
      )}
      
      {/* Command history */}
      <div className="mt-4">
        <h4 className="text-xs font-medium text-futuristic-muted mb-1">Recent Commands</h4>
        <ScrollArea className="h-24">
          <div className="space-y-2">
            {commandHistory.length > 0 ? (
              commandHistory.map((cmd, index) => (
                <div key={index} className="text-xs flex justify-between">
                  <span className="text-futuristic-muted">{cmd.text}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${cmd.processed ? 'bg-green-500/20' : 'bg-amber-500/20'}`}
                  >
                    {cmd.processed ? 'Processed' : 'Processing...'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-futuristic-muted/60 italic">No commands yet</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};

export default VoiceAssistantUI;
