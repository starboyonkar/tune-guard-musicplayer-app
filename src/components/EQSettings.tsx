
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';

const EQSettings: React.FC = () => {
  const { eqSettings, setEQSettings, profile, currentSong } = useAudio();
  
  // Automatically update EQ settings based on profile when song changes
  useEffect(() => {
    if (profile && currentSong) {
      // Dynamically adjust EQ based on profile and current song
      const bassModifier = profile.age < 30 ? 5 : profile.age > 60 ? -5 : 0;
      const trebleModifier = profile.age < 30 ? 0 : profile.age > 60 ? 10 : 5;
      
      // Gender-based adjustments
      const genderBassModifier = profile.gender === 'male' ? 3 : -2;
      const genderMidModifier = profile.gender === 'male' ? -2 : 2;
      
      setEQSettings({
        ...eqSettings,
        bass: Math.min(100, Math.max(0, eqSettings.bass + bassModifier + genderBassModifier)),
        mid: Math.min(100, Math.max(0, eqSettings.mid + genderMidModifier)),
        treble: Math.min(100, Math.max(0, eqSettings.treble + trebleModifier)),
      });
    }
  }, [currentSong?.id]);
  
  const handleBassChange = (values: number[]) => {
    setEQSettings({ ...eqSettings, bass: values[0] });
  };
  
  const handleMidChange = (values: number[]) => {
    setEQSettings({ ...eqSettings, mid: values[0] });
  };
  
  const handleTrebleChange = (values: number[]) => {
    setEQSettings({ ...eqSettings, treble: values[0] });
  };
  
  const handlePresenceChange = (values: number[]) => {
    setEQSettings({ ...eqSettings, presence: values[0] });
  };
  
  const handleClarity = (values: number[]) => {
    setEQSettings({ ...eqSettings, clarity: values[0] });
  };
  
  const handleWarmth = (values: number[]) => {
    setEQSettings({ ...eqSettings, warmth: values[0] });
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
          <span>Enhanced EQ Settings</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-futuristic-accent1/20 text-futuristic-accent1">
              Auto-Tuned
            </Badge>
            <span className="text-futuristic-accent2">
              {profile ? `${getAgeGroup()} Age Profile` : ''}
            </span>
          </div>
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
          
          {/* New EQ controls */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-futuristic-muted">
              <span>Presence</span>
              <span>{eqSettings.presence || 50}%</span>
            </div>
            <Slider
              value={[eqSettings.presence || 50]}
              max={100}
              step={1}
              onValueChange={handlePresenceChange}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-futuristic-muted">
              <span>Clarity</span>
              <span>{eqSettings.clarity || 50}%</span>
            </div>
            <Slider
              value={[eqSettings.clarity || 50]}
              max={100}
              step={1}
              onValueChange={handleClarity}
              className="cursor-pointer"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-futuristic-muted">
              <span>Warmth</span>
              <span>{eqSettings.warmth || 50}%</span>
            </div>
            <Slider
              value={[eqSettings.warmth || 50]}
              max={100}
              step={1}
              onValueChange={handleWarmth}
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
          
          <div className="text-xs mt-2 text-futuristic-muted flex items-center">
            <InfoIcon className="h-3 w-3 mr-1 opacity-70" />
            <span>EQ auto-tunes based on your profile and current song</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EQSettings;
