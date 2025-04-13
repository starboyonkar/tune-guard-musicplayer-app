
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const FileUploader: React.FC = () => {
  const { addSong, isLoading } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Process each selected file
      let uploadCount = 0;
      
      Array.from(files).forEach(file => {
        // Check if the file is an MP3
        if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
          addSong(file);
          uploadCount++;
        } else {
          toast({
            title: "Invalid File Format",
            description: `"${file.name}" is not an MP3 file.`,
            variant: "destructive"
          });
        }
      });
      
      if (uploadCount > 0) {
        toast({
          title: `${uploadCount} File(s) Added`,
          description: `Successfully added ${uploadCount} audio files.`
        });
      }
      
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
        accept="audio/mpeg, .mp3"
        onChange={handleFileChange}
        className="hidden"
        multiple // Allow multiple file selection
      />
      <Button
        variant="outline"
        className="w-full border-futuristic-border border-dashed bg-futuristic-bg/30 text-futuristic-accent1 hover:bg-futuristic-bg/50"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Loading...' : 'Add MP3 Files from Device'}
      </Button>
    </div>
  );
};

export default FileUploader;
