
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';
import { Mic, Command, Volume2, Play, Pause, SkipBack, SkipForward, LogOut } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import { COMMAND_GROUPS } from '@/lib/voiceCommands';

const VoiceCommandHelp: React.FC = () => {
  const [open, setOpen] = useState(false);
  
  // Listen for the help command
  useEffect(() => {
    const handleShowCommandHelp = (e: CustomEvent) => {
      soundEffects.playTouchFeedback();
      setOpen(true);
    };
    
    document.addEventListener('show-command-reference', handleShowCommandHelp as EventListener);
    
    return () => {
      document.removeEventListener('show-command-reference', handleShowCommandHelp as EventListener);
    };
  }, []);

  const { isVoiceListening } = useAudio();
  
  if (!isVoiceListening) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md glass border-futuristic-accent2">
        <DialogHeader>
          <DialogTitle className="neon-text flex items-center">
            <Mic className="h-4 w-4 mr-2 animate-pulse" />
            Voice Commands
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Playback commands */}
          <div>
            <h4 className="mb-2 font-semibold text-futuristic-accent2 flex items-center">
              <Command className="h-3 w-3 mr-1" /> Playback
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {COMMAND_GROUPS.playback.map((cmd, i) => (
                <div key={i} className="text-futuristic-muted text-sm">
                  <span className="font-medium flex items-center">
                    {cmd.name === "Play" && <Play className="h-3 w-3 mr-1" />}
                    {cmd.name === "Pause" && <Pause className="h-3 w-3 mr-1" />}
                    {cmd.name === "Next Song" && <SkipForward className="h-3 w-3 mr-1" />}
                    {cmd.name === "Previous Song" && <SkipBack className="h-3 w-3 mr-1" />}
                    {cmd.name}
                  </span>
                  <div className="text-xs opacity-75">
                    "{cmd.variations[0]}", "{cmd.variations.length > 1 ? cmd.variations[1] : ''}"
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Account commands */}
          <div>
            <h4 className="mb-2 font-semibold text-futuristic-accent2 flex items-center">
              <Command className="h-3 w-3 mr-1" /> Account
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {COMMAND_GROUPS.account.map((cmd, i) => (
                <div key={i} className="text-futuristic-muted text-sm">
                  <span className="font-medium flex items-center">
                    {cmd.name === "Logout" && <LogOut className="h-3 w-3 mr-1" />}
                    {cmd.name}
                  </span>
                  <div className="text-xs opacity-75">
                    "{cmd.variations[0]}", "{cmd.variations.length > 1 ? cmd.variations[1] : ''}"
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation commands */}
          <div>
            <h4 className="mb-2 font-semibold text-futuristic-accent2 flex items-center">
              <Command className="h-3 w-3 mr-1" /> Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {COMMAND_GROUPS.navigation.map((cmd, i) => (
                <div key={i} className="text-futuristic-muted text-sm">
                  <span className="font-medium">{cmd.name}</span>
                  <div className="text-xs opacity-75">
                    "{cmd.variations[0]}", "{cmd.variations.length > 1 ? cmd.variations[1] : ''}"
                  </div>
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
  );
};

export default VoiceCommandHelp;
