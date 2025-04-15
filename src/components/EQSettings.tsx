import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Waves,  // Replacing WaveformIcon with Waves
  Music3, 
  Volume2, 
  Settings2, 
  Sliders, 
  RotateCw,
  BarChart4
} from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';

// Custom slider component for EQ controls
const EQSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number[]) => void;
  icon?: React.ReactNode;
  color?: string;
}> = ({ label, value, onChange, icon, color = 'bg-futuristic-accent1' }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <label className="text-sm font-medium">{label}</label>
        </div>
        <span className="text-xs text-futuristic-accent2">{value}%</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={1}
        onValueChange={onChange}
        className={`${color}`}
      />
    </div>
  );
};

const EQSettings: React.FC = () => {
  const { 
    eqSettings, 
    setEQSettings, 
    visSettings, 
    setVisSettings,
    playerState,
    resetWaveform
  } = useAudio();
  
  const [advanced, setAdvanced] = useState(false);
  
  const handleResetEQ = () => {
    soundEffects.playTouchFeedback();
    
    setEQSettings({
      bass: 70,
      mid: 70,
      treble: 70,
      volume: playerState.volume,
      presence: 50,
      warmth: 50,
    });
  };
  
  const handleResetWaveform = () => {
    soundEffects.playTouchFeedback();
    resetWaveform();
  };

  return (
    <Card className="glass border-futuristic-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Sliders className="mr-2 h-4 w-4 text-futuristic-accent1" />
          Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <EQSlider
          label="Bass"
          value={eqSettings.bass}
          onChange={(value) => {
            soundEffects.playTouchFeedback();
            setEQSettings({ ...eqSettings, bass: value[0] });
          }}
          icon={<Waves className="h-3 w-3 text-blue-400" />}  // Replaced WaveformIcon
          color="bg-blue-400"
        />
        
        <EQSlider
          label="Mid"
          value={eqSettings.mid}
          onChange={(value) => {
            soundEffects.playTouchFeedback();
            setEQSettings({ ...eqSettings, mid: value[0] });
          }}
          icon={<Waves className="h-3 w-3 text-green-400" />}
          color="bg-green-400"
        />
        
        <EQSlider
          label="Treble"
          value={eqSettings.treble}
          onChange={(value) => {
            soundEffects.playTouchFeedback();
            setEQSettings({ ...eqSettings, treble: value[0] });
          }}
          icon={<Waves className="h-3 w-3 text-yellow-400" />}
          color="bg-yellow-400"
        />
        
        <EQSlider
          label="Volume"
          value={eqSettings.volume}
          onChange={(value) => {
            soundEffects.playTouchFeedback();
            setEQSettings({ ...eqSettings, volume: value[0] });
          }}
          icon={<Volume2 className="h-3 w-3 text-purple-400" />}
          color="bg-purple-400"
        />
        
        <div className="flex items-center space-x-2 pt-2">
          <Switch 
            id="advanced-eq"
            checked={advanced}
            onCheckedChange={(checked) => {
              soundEffects.playTouchFeedback();
              setAdvanced(checked);
            }}
          />
          <Label htmlFor="advanced-eq">Advanced Controls</Label>
        </div>
        
        {advanced && (
          <div className="space-y-4 pt-2">
            <EQSlider
              label="Presence"
              value={eqSettings.presence || 50}
              onChange={(value) => {
                soundEffects.playTouchFeedback();
                setEQSettings({ ...eqSettings, presence: value[0] });
              }}
              icon={<Music3 className="h-3 w-3 text-pink-400" />}
              color="bg-pink-400"
            />
            
            <EQSlider
              label="Warmth"
              value={eqSettings.warmth || 50}
              onChange={(value) => {
                soundEffects.playTouchFeedback();
                setEQSettings({ ...eqSettings, warmth: value[0] });
              }}
              icon={<Music3 className="h-3 w-3 text-orange-400" />}
              color="bg-orange-400"
            />
            
            <div className="pt-2 space-y-4">
              <h4 className="text-sm font-medium flex items-center">
                <BarChart4 className="h-3 w-3 mr-1 text-futuristic-accent2" />
                Visualization Settings
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vis-scale" className="text-xs">Scale</Label>
                  <span className="text-xs text-futuristic-accent2">{visSettings.scale.toFixed(1)}x</span>
                </div>
                <Slider
                  id="vis-scale"
                  value={[visSettings.scale]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={(value) => setVisSettings({ ...visSettings, scale: value[0] })}
                  className="bg-futuristic-accent2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vis-amplitude" className="text-xs">Amplitude</Label>
                  <span className="text-xs text-futuristic-accent2">{visSettings.amplitudeScale.toFixed(1)}x</span>
                </div>
                <Slider
                  id="vis-amplitude"
                  value={[visSettings.amplitudeScale]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={(value) => setVisSettings({ ...visSettings, amplitudeScale: value[0] })}
                  className="bg-futuristic-accent2"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleResetEQ}
                className="text-xs"
              >
                <RotateCw className="h-3 w-3 mr-1" /> Reset EQ
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleResetWaveform}
                className="text-xs"
              >
                <RotateCw className="h-3 w-3 mr-1" /> Reset Waveform
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EQSettings;
