
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';
import { Mic, Send } from 'lucide-react';

const VoiceCommandPanel: React.FC = () => {
  const { setVoiceCommand, isVoiceListening, toggleVoiceListening, commandHistory, processingVoice } = useAudio();
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
  }, [isVoiceListening]);
  
  const handleSendCommand = () => {
    if (inputCommand.trim()) {
      setVoiceCommand(inputCommand);
      setInputCommand('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputCommand.trim()) {
      handleSendCommand();
    }
  };
  
  return (
    <Card className="w-full glass border-futuristic-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>TUNE GUARD Voice Commands</span>
          <Button 
            variant={isVoiceListening ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceListening}
            className={isVoiceListening 
              ? "bg-futuristic-accent1 text-white hover:bg-futuristic-accent1/90 text-xs h-7" 
              : "text-futuristic-muted border-futuristic-border hover:text-futuristic-accent1 hover:bg-futuristic-bg text-xs h-7"}
          >
            {isVoiceListening ? (
              <><Mic size={14} className="mr-1 animate-pulse" /> Listening</>
            ) : (
              <><Mic size={14} className="mr-1" /> Enable Voice</>
            )}
          </Button>
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
        
        {/* Sample commands */}
        <div className="mt-3 pt-3 border-t border-futuristic-border">
          <p className="text-xs text-futuristic-muted mb-2">Try these commands:</p>
          <div className="flex flex-wrap gap-2">
            {['Play music', 'Pause', 'Next song', 'Previous song', 'Volume up', 'Volume down'].map((cmd, idx) => (
              <Button 
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setVoiceCommand(cmd)}
                className="text-xs py-0 h-6 border-futuristic-border bg-futuristic-bg/20 hover:bg-futuristic-bg"
              >
                {cmd}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCommandPanel;
