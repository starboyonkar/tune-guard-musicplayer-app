
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';
import { Music, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useMobile } from '@/hooks/use-mobile';

const FileUploader: React.FC = () => {
  const { addSong, isLoading } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMobile();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Enhanced file handler with better mobile support
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Process each selected file
      let uploadCount = 0;
      let invalidCount = 0;
      let inProgressToast: string | number | null = null;
      
      // Show progress toast for multiple files
      if (files.length > 1) {
        inProgressToast = toast({
          title: `Processing ${files.length} Files`,
          description: "Adding your songs to the library...",
        }).id;
      }
      
      // Process files sequentially for better performance
      const processFiles = async () => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Check if the file is an audio format
          if (file.type.startsWith('audio/') || 
              file.name.toLowerCase().endsWith('.mp3') ||
              file.name.toLowerCase().endsWith('.wav') ||
              file.name.toLowerCase().endsWith('.m4a') ||
              file.name.toLowerCase().endsWith('.ogg')) {
            
            try {
              await addSong(file);
              uploadCount++;
            } catch (error) {
              console.error("Error adding song:", error);
              invalidCount++;
            }
          } else {
            invalidCount++;
            // Only show individual errors if not too many files
            if (files.length < 5) {
              toast({
                title: "Invalid File Format",
                description: `"${file.name}" is not a supported audio file.`,
                variant: "destructive"
              });
            }
          }
        }
        
        // Clear the in-progress toast if it exists
        if (inProgressToast !== null) {
          toast({
            id: inProgressToast as string,
            title: `Added ${uploadCount} Files`,
            description: `Successfully added ${uploadCount} audio file${uploadCount !== 1 ? 's' : ''} to TUNE GUARD.${invalidCount ? ` ${invalidCount} file(s) were skipped.` : ''}`,
          });
        } else if (uploadCount > 0) {
          toast({
            title: `${uploadCount} File(s) Added`,
            description: `Successfully added ${uploadCount} audio file${uploadCount > 1 ? 's' : ''} to TUNE GUARD.`
          });
        }
        
        if (invalidCount > 0 && files.length >= 5) {
          toast({
            title: "Some files were skipped",
            description: `${invalidCount} file(s) were not in a supported audio format.`,
            variant: "destructive"
          });
        }
      };
      
      processFiles();
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="my-4">
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        onChange={handleFileChange}
        className="hidden"
        multiple // Allow multiple file selection
      />
      <Button
        variant="outline"
        className={`w-full border-futuristic-border border-dashed bg-futuristic-bg/30 text-futuristic-accent1 hover:bg-futuristic-bg/50 ${isMobile ? 'py-6' : ''}`}
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-futuristic-accent1 rounded-full"></div>
            Processing...
          </div>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {isMobile ? "Tap to Add Audio Files" : "Add Audio Files to TUNE GUARD"}
          </>
        )}
      </Button>
      <div className="text-center text-xs text-futuristic-muted mt-1">
        {isMobile ? 
          "You can select multiple audio files from your device" : 
          "Supports MP3, WAV, M4A, and OGG formats"
        }
      </div>
    </div>
  );
};

export default FileUploader;
