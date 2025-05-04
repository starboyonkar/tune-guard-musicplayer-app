
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, HelpCircle } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const VoiceControl: React.FC = () => {
  const { isListening, isSupported, toggleListening } = useVoiceRecognition();
  
  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                // Dispatch help event when clicked
                document.dispatchEvent(new CustomEvent('show-command-reference'));
              }}
              size="icon"
              variant="outline"
              className="rounded-full border-futuristic-accent2 bg-futuristic-bg/50 hover:bg-futuristic-bg/70"
            >
              <HelpCircle className="h-5 w-5 text-futuristic-accent1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show Voice Commands</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleListening}
              size="icon"
              variant={isListening ? "default" : "outline"}
              className={`rounded-full ${
                isListening 
                  ? "bg-futuristic-accent1 text-white animate-pulse" 
                  : "border-futuristic-accent1 bg-futuristic-bg/50 hover:bg-futuristic-bg/70"
              }`}
            >
              {isListening ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5 text-futuristic-accent1" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isListening ? "Disable Voice Control" : "Enable Voice Control"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default VoiceControl;
