
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, Command } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import { COMMAND_GROUPS } from '@/lib/voiceCommands';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';

const VoiceCommandHelp: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isListening } = useVoiceRecognition();
  
  // Listen for the help command
  useEffect(() => {
    const handleShowCommandHelp = () => {
      soundEffects.playTouchFeedback();
      setOpen(true);
    };
    
    document.addEventListener('show-command-reference', handleShowCommandHelp);
    
    return () => {
      document.removeEventListener('show-command-reference', handleShowCommandHelp);
    };
  }, []);

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
                  <span className="font-medium">{cmd.name}</span>
                  <div className="text-xs opacity-75">
                    "{cmd.variations[0]}"
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
                  <span className="font-medium">{cmd.name}</span>
                  <div className="text-xs opacity-75">
                    "{cmd.variations[0]}"
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
                    "{cmd.variations[0]}"
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
