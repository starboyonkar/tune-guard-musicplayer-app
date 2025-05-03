
import React, { useState } from 'react';
import { useAudio } from '@/lib/audioContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Music, Sparkles } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';

const SignUpForm = () => {
  const { setProfile, isVoiceListening, toggleVoiceListening } = useAudio();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) {
      soundEffects.playError();
      return;
    }
    
    setIsSubmitting(true);
    soundEffects.playSuccess();
    
    // Simulate loading for better UX
    setTimeout(() => {
      // Calculate DOB based on age
      const currentDate = new Date();
      const birthYear = currentDate.getFullYear() - parseInt(age);
      const dob = `${birthYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      setProfile({
        name: name.trim(),
        age: parseInt(age),
        gender,
        dob, // Include DOB
        preferences: [],
        createdAt: new Date().toISOString()
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleVoiceToggle = () => {
    soundEffects.playTouchFeedback();
    toggleVoiceListening();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div>
        <Card className="border-futuristic-border bg-futuristic-bg/30 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-futuristic-accent1">
                <span className="neon-text">TUNE GUARD</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleVoiceToggle}
                className={isVoiceListening ? "text-futuristic-accent1 animate-pulse" : "text-futuristic-muted"}
              >
                {isVoiceListening ? <Mic /> : <MicOff />}
              </Button>
            </div>
            <CardDescription className="text-futuristic-muted">
              Your personal AI-powered music player. Sign up to get started.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-futuristic-muted">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-futuristic-border bg-futuristic-bg/30"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age" className="text-futuristic-muted">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="border-futuristic-border bg-futuristic-bg/30"
                  min="1"
                  max="120"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-futuristic-muted">
                  Gender
                </Label>
                <Select
                  value={gender}
                  onValueChange={(val) => setGender(val)}
                >
                  <SelectTrigger className="border-futuristic-border bg-futuristic-bg/30">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Music className="mr-2 h-4 w-4" />
                    Start Listening
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center text-xs text-futuristic-muted">
            <p>Your data is stored locally and never shared.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUpForm;
