
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAudio } from '@/lib/audioContext';
import { HeadphonesOff, ShieldCheck, Shield } from 'lucide-react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';

// Calculate hearing safety score based on EQ settings
const calculateHearingSafetyScore = (eqSettings: any): number => {
  // Base score starts at 70%
  let safetyScore = 70;
  
  // Calculate score improvements based on balanced EQ settings
  // Extreme bass and treble settings can be harmful
  const bassBalance = Math.abs(50 - eqSettings.bass) / 50; // 0 = balanced, 1 = extreme
  const trebleBalance = Math.abs(50 - eqSettings.treble) / 50;
  
  // Lower bass (under 60) is generally safer for hearing
  if (eqSettings.bass < 60) safetyScore += 5;
  
  // Extreme bass is harmful
  if (eqSettings.bass > 85) safetyScore -= 10;
  
  // Lower treble (under 60) helps prevent hearing damage
  if (eqSettings.treble < 60) safetyScore += 5;
  
  // Extreme treble is very harmful
  if (eqSettings.treble > 80) safetyScore -= 15;
  
  // Lower volume is significantly safer
  const volumeImpact = Math.max(0, eqSettings.volume - 50) / 50; // How far above 50%
  safetyScore -= volumeImpact * 20; // Up to -20% for max volume
  
  // If warmth is enabled and above 50, it provides a smoothing effect
  if (eqSettings.warmth && eqSettings.warmth > 50) {
    safetyScore += 5;
  }
  
  // Apply penalty for unbalanced frequency response
  safetyScore -= (bassBalance + trebleBalance) * 10;
  
  // Ensure score stays between 0-100
  return Math.min(100, Math.max(0, Math.round(safetyScore)));
};

const HearingProtection: React.FC = () => {
  const { eqSettings, playerState } = useAudio();
  
  const hearingSafetyScore = useMemo(() => {
    return calculateHearingSafetyScore(eqSettings);
  }, [eqSettings]);
  
  // Determine protection level description
  const getProtectionLevel = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Low';
    return 'Poor';
  };
  
  // Get color based on safety score
  const getSafetyColor = (score: number): string => {
    if (score >= 85) return '#22c55e'; // Green
    if (score >= 70) return '#84cc16'; // Lime green
    if (score >= 50) return '#eab308'; // Yellow
    if (score >= 30) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };
  
  // Prepare data for the pie chart
  const chartData = [
    { name: 'Protected', value: hearingSafetyScore, color: getSafetyColor(hearingSafetyScore) },
    { name: 'Risk', value: 100 - hearingSafetyScore, color: '#6b7280' }
  ];
  
  // Generate specific advice based on current settings
  const getHearingSafetyAdvice = (): string => {
    if (eqSettings.volume > 80) {
      return 'Lower volume to reduce hearing damage risk';
    } else if (eqSettings.bass > 85) {
      return 'Reduce bass for improved hearing safety';
    } else if (eqSettings.treble > 80) {
      return 'Lower treble to protect against high-frequency damage';
    } else if (hearingSafetyScore > 80) {
      return 'Current settings are optimized for hearing protection';
    }
    return 'Adjust EQ settings to improve your hearing protection score';
  };

  return (
    <Card className="shadow-lg border-futuristic-border glass-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
          Hearing Protection Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-col items-center mb-4 sm:mb-0">
            <div className="text-4xl font-bold text-gradient-to-r from-blue-500 to-green-500">
              {hearingSafetyScore}%
            </div>
            <div className="text-sm text-futuristic-muted mt-1">
              Hearing Safety Score
            </div>
            <div className="mt-2 text-sm font-medium" style={{ color: getSafetyColor(hearingSafetyScore) }}>
              {getProtectionLevel(hearingSafetyScore)} Protection
            </div>
            <div className="mt-2 text-xs max-w-[200px] text-center text-futuristic-muted">
              {getHearingSafetyAdvice()}
            </div>
          </div>
          
          <div className="h-[150px] w-[150px]">
            <ChartContainer className="w-full h-full" config={{
              protected: { color: getSafetyColor(hearingSafetyScore), label: "Protected" },
              risk: { color: "#6b7280", label: "Risk" }
            }}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  animationDuration={500}
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-futuristic-muted">
          <div className="flex items-center text-xs">
            <Shield className="h-3 w-3 mr-1" />
            <span>Your EQ settings are analyzed in real-time to optimize for hearing safety.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HearingProtection;
