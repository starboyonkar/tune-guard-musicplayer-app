
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { cn } from '@/lib/utils';

const EQSettings: React.FC = () => {
  const { eqSettings, setEQSettings, profile } = useAudio();
  
  const handleBassChange = (values: number[]) => {
    setEQSettings({ ...eqSettings, bass: values[0] });
  };
  
  const handleMidChange = (values: number[]) => {
    setEQSettings({ ...eqSettings, mid: values[0] });
  };
  
  const handleTrebleChange = (values: number[]) => {
    setEQSettings({ ...eqSettings, treble: values[0] });
  };
  
  // Get age group label
  const getAgeGroup = () => {
    if (!profile) return '';
    
    if (profile.age < 20) return '10-20';
    if (profile.age < 40) return '20-40';
    if (profile.age < 60) return '40-60';
    return '60+';
  };
  
  return (
    <Card className="w-full glass border-futuristic-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between">
          <span>EQ Settings</span>
          <span className="text-futuristic-accent2">
            {profile ? `${getAgeGroup()} Age Profile` : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-futuristic-muted">
              <span>Bass</span>
              <span>{eqSettings.bass}%</span>
            </div>
            <Slider
              value={[eqSettings.bass]}
              max={100}
              step={1}
              onValueChange={handleBassChange}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-futuristic-muted">
              <span>Mid</span>
              <span>{eqSettings.mid}%</span>
            </div>
            <Slider
              value={[eqSettings.mid]}
              max={100}
              step={1}
              onValueChange={handleMidChange}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-futuristic-muted">
              <span>Treble</span>
              <span>{eqSettings.treble}%</span>
            </div>
            <Slider
              value={[eqSettings.treble]}
              max={100}
              step={1}
              onValueChange={handleTrebleChange}
              className="cursor-pointer"
            />
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-futuristic-border">
          <div className="flex justify-between text-xs">
            <span className="text-futuristic-muted">Age Optimization:</span>
            <span className={cn(
              "font-medium",
              profile ? "text-futuristic-accent1" : "text-futuristic-muted"
            )}>
              {profile ? `${profile.age} years` : 'Not set'}
            </span>
          </div>
          
          <div className="flex justify-between text-xs mt-1">
            <span className="text-futuristic-muted">Gender Profile:</span>
            <span className={cn(
              "font-medium",
              profile ? "text-futuristic-accent1" : "text-futuristic-muted"
            )}>
              {profile ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EQSettings;
