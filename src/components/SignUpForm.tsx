
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { soundEffects } from '@/lib/soundEffects';
import VoiceCommandManager from './VoiceCommandManager';
import { UserProfile } from '@/lib/types';

const SignUpForm: React.FC = () => {
  const { setProfile } = useAudio();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'prefer-not-to-say'>('prefer-not-to-say');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    soundEffects.initialize();
    
    // Initialize blinking gradient background
    const root = document.documentElement;
    const updateGradient = () => {
      const hue1 = Math.floor(Math.random() * 20) + 200; // Blue range
      const hue2 = Math.floor(Math.random() * 20) + 180; // Blue-cyan range
      root.style.setProperty(
        '--dynamic-gradient', 
        `linear-gradient(135deg, hsla(${hue1}, 80%, 70%, 0.8), hsla(${hue2}, 70%, 80%, 0.9))`
      );
    };
    
    updateGradient();
    const interval = setInterval(updateGradient, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Play notification sound
    soundEffects.playNotification();
    
    // Create user profile
    const newProfile: UserProfile = {
      name,
      age: parseInt(age),
      dob,
      gender,
      createdAt: new Date().toISOString(),
      preferences: ['casual-listening', 'workout'],
      listeningMetrics: {
        totalListeningTime: 0,
        sessionsCount: 0,
        averageSessionDuration: 0,
        highVolumeTime: 0,
        safeVolumeTime: 0,
        sessions: []
      },
      safetyScore: 100
    };
    
    // Minimal delay to ensure smooth transition and allow the notification sound to play
    setTimeout(() => {
      setProfile(newProfile);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 animate-fade-in">
      <div className="flex justify-center mb-8">
        <Avatar className="h-32 w-32 border-4 border-white/20 shadow-lg animate-pulse-slow">
          <AvatarImage 
            src="/lovable-uploads/d4fe6f3e-e72d-4760-93e5-5f71a12f2238.png" 
            alt="TUNE GUARD" 
            className="object-cover"
          />
          <AvatarFallback className="text-3xl font-bold text-white">TG</AvatarFallback>
        </Avatar>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 neon-text">
        Welcome to Cognitive Audio Synthesis
      </h1>
      
      <Card className="glass border-futuristic-border backdrop-blur-xl bg-white/5">
        <CardHeader className="border-b border-futuristic-border flex justify-between items-center">
          <CardTitle className="text-xl text-center text-futuristic-accent1 neon-text">Create Your Audio Profile</CardTitle>
          <VoiceCommandManager />
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-futuristic-border bg-white/5 backdrop-blur-sm focus:border-futuristic-accent1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age" className="text-white/90">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="border-futuristic-border bg-white/5 backdrop-blur-sm focus:border-futuristic-accent1"
                min="1"
                max="120"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-white/90">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="border-futuristic-border bg-white/5 backdrop-blur-sm focus:border-futuristic-accent1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-white/90">Gender</Label>
              <Select
                value={gender}
                onValueChange={(val) => setGender(val as any)}
              >
                <SelectTrigger className="border-futuristic-border bg-white/5 backdrop-blur-sm">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-futuristic-bg border-futuristic-border">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90 transition-all animate-glow"
              onClick={() => soundEffects.playTouchFeedback()}
            >
              {isLoading ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-center mt-6 text-futuristic-muted text-sm">
        TUNE GUARD - Cognitive Audio Synthesis
      </div>
    </div>
  );
};

export default SignUpForm;
