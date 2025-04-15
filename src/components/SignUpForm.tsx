
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { soundEffects } from '@/lib/soundEffects';
import { UserProfile } from '@/lib/types';
import { AudioWaveform } from 'lucide-react';

const SignUpForm: React.FC = () => {
  const { setProfile } = useAudio();
  
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    gender: 'non-binary',
    experience: 'intermediate',
    genre: 'rock'
  });
  
  const [error, setError] = useState('');
  
  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    soundEffects.playNotification();
    
    // Create profile and sign up
    const profile: UserProfile = {
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      experience: formData.experience,
      genre: formData.genre,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProfile(profile);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2">
          TUNE <span className="animate-pulse">GUARD</span>
        </h1>
        <p className="text-futuristic-muted">Create your personalized audio profile</p>
        
        <div className="flex justify-center my-4">
          <AudioWaveform className="w-16 h-16 text-futuristic-accent1 animate-pulse" />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-futuristic-bg/10 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-futuristic-border">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <Input 
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your name"
            className="w-full border-futuristic-border bg-futuristic-bg/20"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="age" className="block text-sm font-medium">Age</label>
          <Input 
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 18)}
            min={13}
            max={100}
            className="w-full border-futuristic-border bg-futuristic-bg/20"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="gender" className="block text-sm font-medium">Gender</label>
          <Select 
            value={formData.gender}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <SelectTrigger className="w-full border-futuristic-border bg-futuristic-bg/20">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="experience" className="block text-sm font-medium">Music Experience</label>
          <Select 
            value={formData.experience}
            onValueChange={(value) => handleChange('experience', value)}
          >
            <SelectTrigger className="w-full border-futuristic-border bg-futuristic-bg/20">
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual Listener</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="audiophile">Audiophile</SelectItem>
              <SelectItem value="professional">Audio Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="genre" className="block text-sm font-medium">Favorite Genre</label>
          <Select 
            value={formData.genre}
            onValueChange={(value) => handleChange('genre', value)}
          >
            <SelectTrigger className="w-full border-futuristic-border bg-futuristic-bg/20">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rock">Rock</SelectItem>
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="electronic">Electronic</SelectItem>
              <SelectItem value="hiphop">Hip Hop</SelectItem>
              <SelectItem value="jazz">Jazz</SelectItem>
              <SelectItem value="classical">Classical</SelectItem>
              <SelectItem value="ambient">Ambient</SelectItem>
              <SelectItem value="folk">Folk</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:from-futuristic-accent2 hover:to-futuristic-accent1 transition-all animate-pulse-slow"
        >
          Create Profile & Continue
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;
