
import React from 'react';
import { useSirenDetection } from '@/hooks/useSirenDetection';
import { Button } from '@/components/ui/button';
import { Siren, X, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const SirenDetectionControl: React.FC = () => {
  const { 
    isDetectingSiren, 
    sirenDetected, 
    settings, 
    startDetection, 
    stopDetection, 
    updateSettings 
  } = useSirenDetection();

  return (
    <Card className="shadow-lg border-futuristic-border glass-panel">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Siren className={sirenDetected ? "text-red-500 animate-pulse" : ""} />
              Ambulance Siren Detection
            </CardTitle>
            <CardDescription>
              Automatically pause music when ambulance sirens are detected
            </CardDescription>
          </div>
          
          {sirenDetected && (
            <span className="rounded-md bg-red-500/90 text-white px-2 py-1 text-xs font-bold animate-pulse">
              SIREN DETECTED
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="siren-detection-toggle" className="flex items-center gap-2">
            Detection {settings.enabled ? 'Enabled' : 'Disabled'}
          </Label>
          <Switch 
            id="siren-detection-toggle"
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="sensitivity-slider">Sensitivity</Label>
            <span className="text-sm text-futuristic-muted">
              {Math.round(settings.sensitivity * 100)}%
            </span>
          </div>
          <Slider
            id="sensitivity-slider"
            min={0.1}
            max={1.0}
            step={0.05}
            value={[settings.sensitivity]}
            onValueChange={([sensitivity]) => updateSettings({ sensitivity })}
            disabled={!settings.enabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-resume-toggle" className="flex items-center gap-2">
            Auto-resume playback
          </Label>
          <Switch 
            id="auto-resume-toggle"
            checked={settings.autoResume}
            onCheckedChange={(checked) => updateSettings({ autoResume: checked })}
            disabled={!settings.enabled}
          />
        </div>
        
        {settings.autoResume && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="pause-duration-slider">Resume delay</Label>
              <span className="text-sm text-futuristic-muted">
                {settings.pauseDuration} seconds
              </span>
            </div>
            <Slider
              id="pause-duration-slider"
              min={1}
              max={10}
              step={1}
              value={[settings.pauseDuration]}
              onValueChange={([pauseDuration]) => updateSettings({ pauseDuration })}
              disabled={!settings.enabled || !settings.autoResume}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="justify-between">
        {!isDetectingSiren ? (
          <Button 
            variant="default" 
            className="w-full bg-futuristic-accent1 hover:bg-futuristic-accent1/80"
            onClick={startDetection}
            disabled={!settings.enabled}
          >
            <Check className="mr-2 h-4 w-4" /> Start Detection
          </Button>
        ) : (
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={stopDetection}
          >
            <X className="mr-2 h-4 w-4" /> Stop Detection
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default SirenDetectionControl;
