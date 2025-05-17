
import React from 'react';
import { useAudio } from '@/lib/audioContext';
import { calculateHearingProtection } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeadphoneOff, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const HearingProtection: React.FC = () => {
  const { eqSettings, playerState } = useAudio();
  
  // Calculate hearing protection score
  const protectionScore = calculateHearingProtection(
    eqSettings.volume,
    eqSettings.bass, 
    eqSettings.treble
  );
  
  // Colors for different protection ranges
  const getColorForScore = (score: number) => {
    if (score >= 90) return "#4ADE80"; // Green for excellent protection
    if (score >= 70) return "#FACC15"; // Yellow for good protection
    if (score >= 50) return "#FB923C"; // Orange for moderate protection
    return "#F87171"; // Red for poor protection
  };
  
  const getLabelForScore = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Moderate";
    return "Poor";
  };
  
  // Chart data for pie chart
  const data = [
    { name: 'Protected', value: protectionScore },
    { name: 'Risk', value: 100 - protectionScore }
  ];
  
  const chartColors = [
    getColorForScore(protectionScore),
    "#1F2937" // Dark color for the risk part
  ];

  return (
    <div className="p-4">
      <div className="flex items-center mb-3">
        <Shield className="h-5 w-5 mr-2 text-futuristic-accent1" />
        <h3 className="font-semibold text-lg">Hearing Protection</h3>
        <Badge 
          variant={protectionScore >= 70 ? "outline" : "destructive"} 
          className="ml-auto"
        >
          {getLabelForScore(protectionScore)}
        </Badge>
      </div>

      <div className="flex items-center">
        <div className="w-1/3">
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                    strokeWidth={index === 0 ? 2 : 0}
                    stroke={index === 0 ? getColorForScore(protectionScore) : "transparent"}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-2/3 pl-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Hearing Safety Score</span>
              <span className="font-semibold">{protectionScore}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Listening Volume</span>
              <div className="flex items-center">
                {playerState.isMuted ? (
                  <HeadphoneOff className="h-4 w-4 mr-1 text-muted-foreground" />
                ) : (
                  <span className={eqSettings.volume > 80 ? "text-destructive" : ""}>
                    {eqSettings.volume}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bass Level</span>
              <span className={eqSettings.bass > 80 ? "text-amber-500" : ""}>
                {eqSettings.bass}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Treble Level</span>
              <span className={eqSettings.treble > 75 ? "text-amber-500" : ""}>
                {eqSettings.treble}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HearingProtection;
