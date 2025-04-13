
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
          src="/lovable-uploads/fef0ffdf-0081-4643-b618-d0389707cde1.png" 
          alt={`${currentSong.title} album art`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-futuristic-accent1/10 to-futuristic-accent2/10"></div>
      </div>
      
      <div className="overflow-hidden">
        <h3 className="font-semibold text-lg truncate bg-gradient-to-r from-white to-futuristic-accent2 bg-clip-text text-transparent">
          {currentSong.title}
        </h3>
        <p className="text-futuristic-muted text-sm truncate">
          {currentSong.artist}
        </p>
      </div>
    </div>
  );
};

export default SongInfo;
