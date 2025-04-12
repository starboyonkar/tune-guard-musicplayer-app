
import React from 'react';
import { useAudio } from '@/lib/audioContext';

const Waveform: React.FC = () => {
  const { waveformData, playerState } = useAudio();
  
  return (
    <div className="flex items-end justify-center h-24 gap-[2px] px-4 mb-2">
      {waveformData.map((height, index) => {
        const animationDelay = `${(index % 5) * 0.2}s`;
        const isActive = playerState.isPlaying;
        
        return (
          <div
            key={index}
            style={{ 
              height: `${height * 100}%`,
              animationDelay,
              animationPlayState: isActive ? 'running' : 'paused'
            }}
            className={`waveform-bar w-[3px] ${
              isActive 
              ? `animate-wave-${(index % 5) + 1}` 
              : 'opacity-50'
            }`}
          />
        );
      })}
    </div>
  );
};

export default Waveform;
