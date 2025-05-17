
import React from 'react';
import { useSirenDetection } from '@/hooks/useSirenDetection';
import { Button } from '@/components/ui/button';
import { Siren, X, Check, Shield, Volume2, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  Card as InnerCard,
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
              Enhanced Siren Detection
            </CardTitle>
            <CardDescription>
              Instantly pause music when ambulance sirens are detected
            </CardDescription>
          </div>
          
          {sirenDetected && (
            <span className="rounded-md bg-red-500/90 text-white px-2 py-1 text-xs font-bold animate-pulse flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" /> SIREN DETECTED
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="siren-detection-toggle" className="flex items-center gap-2">
            Real-time Detection {settings.enabled ? 'Enabled' : 'Disabled'}
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
            className={sirenDetected ? "bg-red-400" : ""}
          />
          <p className="text-xs text-futuristic-muted">
            Higher sensitivity detects sirens faster but may cause false positives
          </p>
        </div>
        
        <InnerCard className="bg-black/20 border border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Shield className="h-8 w-8 text-green-400" />
              <div>
                <h4 className="font-medium mb-1">Optimized for Safety</h4>
                <p className="text-xs text-futuristic-muted">
                  Our enhanced algorithm detects emergency sirens faster and with greater accuracy, 
                  instantly pausing your audio to keep you safe and aware of your surroundings.
                </p>
              </div>
            </div>
          </CardContent>
        </InnerCard>
        
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
                {settings.pauseDuration} {settings.pauseDuration === 1 ? 'second' : 'seconds'}
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
            <Volume2 className="mr-2 h-4 w-4" /> Start Enhanced Detection
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
