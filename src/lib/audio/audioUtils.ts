
import { EQSettings, Song, Playlist } from '../types';
import { toast } from '@/components/ui/use-toast';

// Sample songs data
export const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: "Blinding Lights",
    artist: 'The Weeknd',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273aad49f1f5c14ebdbe5b6250a',
    duration: 200,
    source: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
  },
  {
    id: '2',
    title: "Shape of You",
    artist: 'Ed Sheeran',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
    duration: 234,
    source: 'https://assets.mixkit.co/music/preview/mixkit-dance-with-me-3.mp3'
  },
  {
    id: '3',
    title: "Dance Monkey",
    artist: 'Tones and I',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c6f7af36eccd256764e0a9f6',
    duration: 210,
    source: 'https://assets.mixkit.co/music/preview/mixkit-uplift-breakbeat-loop-180.mp3'
  },
  {
    id: '4',
    title: "Don't Start Now",
    artist: 'Dua Lipa',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
    duration: 183,
    source: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3'
  }
];

// Sample playlist data
export const SAMPLE_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist1',
    name: 'Favorites',
    songs: ['1', '3'],
    createdAt: new Date().toISOString()
  }
];

// Get EQ settings based on age
export const getEQSettingsByAge = (age: number, gender: string): EQSettings => {
  // Different EQ profiles based on age groups
  if (age < 20) {
    return {
      bass: gender === 'male' ? 75 : 70,
      mid: 65,
      treble: 80,
      volume: 70
    };
  } else if (age < 40) {
    return {
      bass: 70,
      mid: 70,
      treble: 75,
      volume: 65
    };
  } else if (age < 60) {
    return {
      bass: 75,
      mid: 75, 
      treble: 65,
      volume: 60
    };
  } else {
    return {
      bass: 80,
      mid: 70,
      treble: 55,
      volume: 75
    };
  }
};

// Process audio waveform data
export const processAudioFrame = (
  analyserNode: AnalyserNode | null, 
  eqSettings: EQSettings
) => {
  if (!analyserNode) return null;
  
  const bufferLength = analyserNode.frequencyBinCount;
  const timeDataArray = new Uint8Array(bufferLength);
  const frequencyDataArray = new Uint8Array(bufferLength);
  
  analyserNode.getByteTimeDomainData(timeDataArray);
  analyserNode.getByteFrequencyData(frequencyDataArray);
  
  const downsampleFactor = Math.floor(bufferLength / 30);
  
  const original = Array(30).fill(0).map((_, i) => 
    timeDataArray[i * downsampleFactor] / 256
  );
  
  const processed = Array(30).fill(0).map((_, i) => {
    const value = timeDataArray[i * downsampleFactor] / 256;
    
    const bassBoost = (eqSettings.bass - 50) / 100;
    const trebleBoost = (eqSettings.treble - 50) / 100;
    
    if (i < 10) {
      return value * (1 + bassBoost);
    } else if (i >= 20) {
      return value * (1 + trebleBoost);
    }
    return value;
  });
  
  const frequencyData = Array(30).fill(0).map((_, i) => 
    frequencyDataArray[i * downsampleFactor] / 256
  );
  
  return {
    original,
    processed,
    timeData: Array.from(timeDataArray).slice(0, 30).map(v => v / 256),
    frequencyData: frequencyData
  };
};

// Add a song to the library
export const createSongFromFile = async (file: File): Promise<Song> => {
  const fileUrl = URL.createObjectURL(file);
  
  const audio = new Audio(fileUrl);
  
  await new Promise<void>((resolve) => {
    audio.addEventListener('loadedmetadata', () => resolve());
  });
  
  return {
    id: `local-${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: 'Local File',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273c6f7af36eccd256764e0a9f6',
    duration: Math.round(audio.duration),
    source: fileUrl
  };
};

// Process voice commands
export const processVoiceCommand = (
  command: string, 
  songs: Song[], 
  currentSong: Song | null,
  setPlayerState: (setter: (prev: any) => any) => void,
  nextSong: () => void,
  prevSong: () => void
) => {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('play') && !lowerCommand.includes('next') && !lowerCommand.includes('previous')) {
    if (lowerCommand.includes('play ')) {
      const songName = lowerCommand.replace('play ', '').trim();
      const foundSong = songs.find(
        song => song.title.toLowerCase().includes(songName) || 
                song.artist.toLowerCase().includes(songName)
      );
      
      if (foundSong) {
        setPlayerState(prev => ({ ...prev, currentSongId: foundSong.id, isPlaying: true }));
        toast({
          title: "Playing Song",
          description: `Now playing "${foundSong.title}" by ${foundSong.artist}`,
        });
      } else {
        toast({
          title: "Song Not Found",
          description: `Sorry, I couldn't find "${songName}"`,
          variant: "destructive"
        });
      }
    } else {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      toast({
        title: "Playback Started",
        description: currentSong ? `Playing "${currentSong.title}"` : "Playing music",
      });
    }
  } else if (lowerCommand.includes('pause')) {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    toast({
      title: "Playback Paused",
      description: "Music paused"
    });
  } else if (lowerCommand.includes('next')) {
    nextSong();
    toast({
      title: "Next Track",
      description: "Playing next song"
    });
  } else if (lowerCommand.includes('previous') || lowerCommand.includes('last')) {
    prevSong();
    toast({
      title: "Previous Track",
      description: "Playing previous song"
    });
  } else if (lowerCommand.includes('volume')) {
    if (lowerCommand.includes('up')) {
      setPlayerState(prev => {
        const newVolume = Math.min(prev.volume + 10, 100);
        toast({
          title: "Volume Increased",
          description: `Volume set to ${newVolume}%`
        });
        return { ...prev, volume: newVolume, isMuted: false };
      });
    } else if (lowerCommand.includes('down')) {
      setPlayerState(prev => {
        const newVolume = Math.max(prev.volume - 10, 0);
        toast({
          title: "Volume Decreased",
          description: `Volume set to ${newVolume}%`
        });
        return { ...prev, volume: newVolume, isMuted: false };
      });
    }
    return true;
  } else {
    toast({
      title: "Command Not Recognized",
      description: "I didn't understand that command",
      variant: "destructive"
    });
  }
  
  return true;
};
