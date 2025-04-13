
import { useAudio } from '@/lib/audioContext';
import SignUpForm from '@/components/SignUpForm';
import AudioPlayerUI from '@/components/AudioPlayerUI';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Index = () => {
  const { isSignedUp } = useAudio();

  return (
    <div className="min-h-screen w-full bg-futuristic-bg overflow-hidden relative">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-futuristic-accent1/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-futuristic-accent2/20 rounded-full blur-3xl -z-10" />
      
      {/* App logo */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Avatar className="h-10 w-10 border border-white/10">
          <AvatarImage src="/lovable-uploads/fef0ffdf-0081-4643-b618-d0389707cde1.png" alt="Audio Player Logo" />
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
        <span className="text-lg font-semibold text-white">Audio Persona</span>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto min-h-screen flex items-center">
        {isSignedUp ? <AudioPlayerUI /> : <SignUpForm />}
      </div>
    </div>
  );
};

export default Index;
