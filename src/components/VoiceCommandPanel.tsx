
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAudio } from '@/lib/audioContext';
import { Mic, Send, MicOff, Command, Settings, Volume2, VolumeX, User, LogOut, HelpCircle, FileAudio, Shuffle, Repeat, List } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const VoiceCommandPanel: React.FC = () => {
  const { 
    setVoiceCommand, 
    isVoiceListening, 
    toggleVoiceListening, 
    commandHistory, 
    processingVoice,
    profile,
    logout
  } = useAudio();
  const [inputCommand, setInputCommand] = useState('');
  const [isCommandListOpen, setIsCommandListOpen] = useState(false);
  
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
    setIsCommandListOpen(false);
  };
  
  const handleToggleVoice = () => {
    soundEffects.playTouchFeedback();
    toggleVoiceListening();
  };

  const handleLogout = () => {
    soundEffects.playNotification();
    logout();
  };
  
  // Enhanced command categories with exact phrases that match the audioContext.tsx processVoiceCommand function
  const playbackCommands = ['Play music', 'Pause', 'Next song', 'Previous song', 'Shuffle on', 'Shuffle off', 'Repeat all', 'Repeat one', 'Repeat off'];
  const volumeCommands = ['Volume up', 'Volume down', 'Mute', 'Unmute'];
  const eqCommands = ['More bass', 'Less bass', 'More treble', 'Less treble'];
  const systemCommands = ['Edit profile', 'Logout', 'Help', 'Close', 'Add song', 'Browse file'];
  
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
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={isCommandListOpen} onOpenChange={setIsCommandListOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-futuristic-muted hover:text-futuristic-accent2"
                        onClick={() => soundEffects.playTouchFeedback()}
                      >
                        <Command className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md glass border-futuristic-accent2">
                      <DialogHeader>
                        <DialogTitle className="neon-text">Available Voice Commands</DialogTitle>
                        <DialogDescription className="text-futuristic-muted">
                          Say any of these commands when voice control is active
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="mb-2 font-semibold text-futuristic-accent2 flex items-center">
                              <Command className="h-3 w-3 mr-1" /> Playback
                            </h4>
                            <ul className="space-y-1 text-sm text-futuristic-muted">
                              {playbackCommands.map((cmd, i) => (
                                <li key={i} className="hover:text-white cursor-pointer" onClick={() => handleExecuteCommand(cmd)}>
                                  "{cmd}"
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="mb-2 font-semibold text-futuristic-accent2 flex items-center">
                              <Volume2 className="h-3 w-3 mr-1" /> Volume
                            </h4>
                            <ul className="space-y-1 text-sm text-futuristic-muted">
                              {volumeCommands.map((cmd, i) => (
                                <li key={i} className="hover:text-white cursor-pointer" onClick={() => handleExecuteCommand(cmd)}>
                                  "{cmd}"
                                </li>
                              ))}
                            </ul>
                            
                            <h4 className="mt-4 mb-2 font-semibold text-futuristic-accent2 flex items-center">
                              <Settings className="h-3 w-3 mr-1" /> Sound
                            </h4>
                            <ul className="space-y-1 text-sm text-futuristic-muted">
                              {eqCommands.map((cmd, i) => (
                                <li key={i} className="hover:text-white cursor-pointer" onClick={() => handleExecuteCommand(cmd)}>
                                  "{cmd}"
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="mb-2 font-semibold text-futuristic-accent2 flex items-center">
                            <Settings className="h-3 w-3 mr-1" /> System Commands
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {systemCommands.map((cmd, i) => (
                              <div key={i} className="text-futuristic-muted hover:text-white cursor-pointer" onClick={() => handleExecuteCommand(cmd)}>
                                "{cmd}"
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <DialogClose asChild>
                          <Button 
                            variant="outline" 
                            className="border-futuristic-accent1 hover:bg-futuristic-accent1/20"
                            onClick={() => soundEffects.playTouchFeedback()}
                          >
                            Close
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice command reference</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Quick action buttons - frequently used commands */}
        <div className="mb-3 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="py-1 h-7 text-xs border-futuristic-border bg-futuristic-bg/30 hover:bg-futuristic-accent1/20"
            onClick={() => handleExecuteCommand("Edit profile")}
          >
            <User className="h-3 w-3 mr-1" /> Edit Profile
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="py-1 h-7 text-xs border-futuristic-border bg-futuristic-bg/30 hover:bg-futuristic-accent1/20"
            onClick={() => handleExecuteCommand("Add song")}
          >
            <FileAudio className="h-3 w-3 mr-1" /> Add Song
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="py-1 h-7 text-xs border-futuristic-border bg-futuristic-bg/30 hover:bg-futuristic-accent1/20"
            onClick={() => handleExecuteCommand("Shuffle on")}
          >
            <Shuffle className="h-3 w-3 mr-1" /> Shuffle
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="py-1 h-7 text-xs border-futuristic-border bg-futuristic-bg/30 hover:bg-futuristic-accent1/20"
            onClick={() => handleExecuteCommand("Repeat all")}
          >
            <Repeat className="h-3 w-3 mr-1" /> Repeat
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="py-1 h-7 text-xs border-futuristic-border bg-futuristic-bg/30 hover:bg-destructive/20 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-3 w-3 mr-1" /> Logout
          </Button>
        </div>
        
        {/* Command history */}
        <div className="mb-3 flex flex-col space-y-2 h-24 overflow-y-auto">
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
      </CardContent>
    </Card>
  );
};

export default VoiceCommandPanel;
