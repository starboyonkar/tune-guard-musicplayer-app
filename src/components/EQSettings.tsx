
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';

const EQSettings = () => {
  const { eqSettings, updateEQSettings } = useAudio();

  const presets = [
    { name: 'Flat', bass: 0, mid: 0, treble: 0, preAmp: 0 },
    { name: 'Rock', bass: 4, mid: 2, treble: 6, preAmp: 2 },
    { name: 'Pop', bass: 2, mid: 4, treble: 3, preAmp: 1 },
    { name: 'Classical', bass: -2, mid: 0, treble: 2, preAmp: 0 },
    { name: 'Bass Boost', bass: 8, mid: 0, treble: -2, preAmp: 3 },
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    updateEQSettings({
      bass: preset.bass,
      mid: preset.mid,
      treble: preset.treble,
      preAmp: preset.preAmp,
      preset: preset.name,
      enabled: true
    });
  };

  return (
    <Card className="border-futuristic-border bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-futuristic-accent1">Equalizer</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            checked={eqSettings.enabled}
            onCheckedChange={(enabled) => updateEQSettings({ enabled })}
          />
          <span className="text-sm text-futuristic-muted">Enable EQ</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant={eqSettings.preset === preset.name ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetSelect(preset)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Pre-Amp</label>
            <Slider
              value={[eqSettings.preAmp]}
              onValueChange={(value) => updateEQSettings({ preAmp: value[0] })}
              max={10}
              min={-10}
              step={1}
              className="mt-2"
              disabled={!eqSettings.enabled}
            />
            <span className="text-xs text-futuristic-muted">{eqSettings.preAmp}dB</span>
          </div>

          <div>
            <label className="text-sm font-medium">Bass</label>
            <Slider
              value={[eqSettings.bass]}
              onValueChange={(value) => updateEQSettings({ bass: value[0] })}
              max={10}
              min={-10}
              step={1}
              className="mt-2"
              disabled={!eqSettings.enabled}
            />
            <span className="text-xs text-futuristic-muted">{eqSettings.bass}dB</span>
          </div>

          <div>
            <label className="text-sm font-medium">Mid</label>
            <Slider
              value={[eqSettings.mid]}
              onValueChange={(value) => updateEQSettings({ mid: value[0] })}
              max={10}
              min={-10}
              step={1}
              className="mt-2"
              disabled={!eqSettings.enabled}
            />
            <span className="text-xs text-futuristic-muted">{eqSettings.mid}dB</span>
          </div>

          <div>
            <label className="text-sm font-medium">Treble</label>
            <Slider
              value={[eqSettings.treble]}
              onValueChange={(value) => updateEQSettings({ treble: value[0] })}
              max={10}
              min={-10}
              step={1}
              className="mt-2"
              disabled={!eqSettings.enabled}
            />
            <span className="text-xs text-futuristic-muted">{eqSettings.treble}dB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EQSettings;
