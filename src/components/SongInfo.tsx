
import { useAudio } from '@/lib/audioContext';
import { cn } from '@/lib/utils';

const SongInfo: React.FC = () => {
  const { currentSong, playerState } = useAudio();
  
  if (!currentSong) return null;
  
  return (
    <div className="flex items-center p-4">
      <div className={cn(
        "w-16 h-16 rounded-md overflow-hidden mr-4 shadow-lg relative",
        playerState.isPlaying && "animate-pulse-slow"
      )}>
        <img 
          src="/lovable-uploads/b26c60f6-26f9-4e3b-afb1-ba0d0a2e076d.png" 
          alt="TUNE GUARD"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-futuristic-accent1/10 to-futuristic-accent2/10"></div>
      </div>
      
      <div className="overflow-hidden">
        <h3 className="font-semibold text-lg truncate bg-gradient-to-r from-white to-futuristic-accent2 bg-clip-text text-transparent">
          {currentSong.title}
        </h3>
        <p className="text-futuristic-muted text-sm truncate">
          {currentSong.artist || "TUNE GUARD"}
        </p>
        {playerState.isPlaying ? (
          <div className="mt-1 flex items-center">
            <span className="text-xs text-futuristic-accent1">Now Playing</span>
            <div className="flex ml-2 space-x-1">
              {[1, 2, 3].map((i) => (
                <span 
                  key={i} 
                  className="w-1 h-3 bg-futuristic-accent1 rounded-full opacity-75" 
                  style={{ 
                    animation: `pulse 0.6s ease-in-out ${i * 0.2}s infinite alternate`
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-1">
            <span className="text-xs text-futuristic-muted">Paused</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongInfo;
