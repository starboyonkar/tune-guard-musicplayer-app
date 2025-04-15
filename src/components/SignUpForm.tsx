
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { soundEffects } from '@/lib/soundEffects';
import { UserProfile } from '@/lib/types';
import { Mic, MicOff } from 'lucide-react';

const SignUpForm: React.FC = () => {
  const { setProfile } = useAudio();
  
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    dateOfBirth: '',
    gender: 'non-binary',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store any additional user preferences separately
    localStorage.setItem('userPreferences', JSON.stringify({
      dateOfBirth: formData.dateOfBirth
    }));
    
    setProfile(profile);
  };
  
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 neon-text-bright">
          Cognitive Audio Synthesis
        </h1>
        <p className="text-cyan-300 mt-2 opacity-80">
          Advanced music player with age-aware audio enhancement
        </p>
      </div>
      
      <div className="bg-black/80 backdrop-blur-md rounded-xl border border-cyan-500/30 p-6 shadow-lg shadow-cyan-500/20">
        <h2 className="text-xl font-semibold mb-6 text-center neon-text">Create Your Audio Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-cyan-300">Name</label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your name"
              className="bg-black/50 border-cyan-800/50 text-white placeholder:text-gray-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-medium text-cyan-300">Age</label>
            <Input 
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 18)}
              min={13}
              max={100}
              placeholder="Enter your age"
              className="bg-black/50 border-cyan-800/50 text-white placeholder:text-gray-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-cyan-300">Date of Birth</label>
            <Input 
              id="dateOfBirth"
              type="text"
              placeholder="mm/dd/yyyy"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="bg-black/50 border-cyan-800/50 text-white placeholder:text-gray-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-medium text-cyan-300">Gender</label>
            <Select 
              value={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
            >
              <SelectTrigger className="bg-black/50 border-cyan-800/50 text-white">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-cyan-800/50 text-white">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 transition-all"
          >
            Create Profile
          </Button>
          
          <div className="text-center text-xs text-cyan-300/60 mt-4">
            Your profile data helps us optimize audio for your hearing
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
