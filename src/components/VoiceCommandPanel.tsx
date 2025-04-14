
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAudio } from '@/lib/audioContext';
import { Mic, Send, MicOff, Command, Settings, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import { Label } from '@/components/ui/label';

const VoiceCommandPanel: React.FC = () => {
  const { 
    setVoiceCommand, 
    isVoiceListening, 
    toggleVoiceListening, 
    commandHistory, 
    processingVoice 
  } = useAudio();
  const [inputCommand, setInputCommand] = useState('');
  
  // Auto-enable voice listening on component mount and maintain it
  useEffect(() => {
    if (!isVoiceListening) {
      toggleVoiceListening();
    }
    
    // Re-enable listening if it gets disabled
    const checkInterval = setInterval(() => {
      if (!isVoiceListening) {
        toggleVoiceListening();
      }
    }, 5000);
    
    return () => clearInterval(checkInterval);
  }, [isVoiceListening, toggleVoiceListening]);
  
  const handleSendCommand = () => {
    if (inputCommand.trim()) {
      soundEffects.playTouchFeedback();
      setVoiceCommand(inputCommand);
      setInputCommand('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputCommand.trim()) {
      handleSendCommand();
    }
  };

  const handleExecuteCommand = (command: string) => {
    soundEffects.playTouchFeedback();
    setVoiceCommand(command);
  };
  
  const handleToggleVoice = () => {
    soundEffects.playTouchFeedback();
    toggleVoiceListening();
  };
  
  // Group commands by category
  const playbackCommands = ['Play music', 'Pause', 'Next song', 'Previous song'];
  const volumeCommands = ['Volume up', 'Volume down', 'Mute', 'Unmute'];
  const eqCommands = ['More bass', 'Less bass', 'More treble', 'Less treble'];
  const systemCommands = ['Play playlist', 'Logout'];
  
  return (
    <Card className="w-full glass border-futuristic-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="neon-text">TUNE GUARD Voice Commands</span>
          <div className="flex items-center space-x-2">
            <Label htmlFor="voice-toggle" className="text-xs text-futuristic-muted">
              {isVoiceListening ? "Voice Active" : "Voice Disabled"}
            </Label>
            <Switch 
              id="voice-toggle" 
              checked={isVoiceListening} 
              onCheckedChange={handleToggleVoice}
              className="data-[state=checked]:bg-futuristic-accent1"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Command history */}
        <div className="mb-3 flex flex-col space-y-2 h-32 overflow-y-auto">
          {commandHistory.length === 0 && (
            <div className="text-center text-xs text-futuristic-muted py-4">
              Try saying "Play music" or "Next song"
            </div>
          )}
          
          {commandHistory.map((cmd, idx) => (
            <div 
              key={idx} 
              className={`text-xs p-2 rounded-md ${
                cmd.processed 
                  ? 'bg-futuristic-accent1/10 text-futuristic-muted' 
                  : 'bg-futuristic-accent1/20 text-white animate-pulse'
              }`}
            >
              <div className="flex justify-between">
                <span>"{cmd.text}"</span>
                <span className="text-futuristic-muted text-[10px]">
                  {new Date(cmd.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {processingVoice && (
            <div className="text-xs p-2 rounded-md bg-futuristic-accent2/20 text-white animate-pulse">
              Processing command...
            </div>
          )}
        </div>
        
        {/* Input for typing commands */}
        <div className="flex space-x-2">
          <Input
            placeholder="Type a command..."
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyPress}
            className="text-sm border-futuristic-border bg-futuristic-bg/30"
          />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSendCommand}
            disabled={!inputCommand.trim()}
            className="text-futuristic-accent2 hover:text-futuristic-accent1 hover:bg-futuristic-bg"
          >
            <Send size={18} />
          </Button>
        </div>
        
        {/* Sample commands - categorized */}
        <div className="mt-3 pt-3 border-t border-futuristic-border">
          <p className="text-xs text-futuristic-muted mb-2">Command Categories:</p>
          
          <div className="space-y-3">
            {/* Playback commands */}
            <div>
              <div className="flex items-center text-xs text-futuristic-accent2 mb-1">
                <Command className="h-3 w-3 mr-1" /> Playback
              </div>
              <div className="flex flex-wrap gap-2">
                {playbackCommands.map((cmd, idx) => (
                  <Button 
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteCommand(cmd)}
                    className="text-xs py-0 h-6 border-futuristic-border bg-futuristic-bg/20 hover:bg-futuristic-bg hover:text-futuristic-accent1"
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Volume commands */}
            <div>
              <div className="flex items-center text-xs text-futuristic-accent2 mb-1">
                <Volume2 className="h-3 w-3 mr-1" /> Volume
              </div>
              <div className="flex flex-wrap gap-2">
                {volumeCommands.map((cmd, idx) => (
                  <Button 
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteCommand(cmd)}
                    className="text-xs py-0 h-6 border-futuristic-border bg-futuristic-bg/20 hover:bg-futuristic-bg hover:text-futuristic-accent1"
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* EQ commands */}
            <div>
              <div className="flex items-center text-xs text-futuristic-accent2 mb-1">
                <Settings className="h-3 w-3 mr-1" /> Equalizer
              </div>
              <div className="flex flex-wrap gap-2">
                {eqCommands.map((cmd, idx) => (
                  <Button 
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteCommand(cmd)}
                    className="text-xs py-0 h-6 border-futuristic-border bg-futuristic-bg/20 hover:bg-futuristic-bg hover:text-futuristic-accent1"
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* System commands */}
            <div>
              <div className="flex items-center text-xs text-futuristic-accent2 mb-1">
                <Settings className="h-3 w-3 mr-1" /> System
              </div>
              <div className="flex flex-wrap gap-2">
                {systemCommands.map((cmd, idx) => (
                  <Button 
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteCommand(cmd)}
                    className="text-xs py-0 h-6 border-futuristic-border bg-futuristic-bg/20 hover:bg-futuristic-bg hover:text-futuristic-accent1"
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCommandPanel;
