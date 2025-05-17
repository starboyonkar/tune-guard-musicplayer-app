
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/lib/audioContext';
import { UserProfile } from '@/lib/types';

const SignUpForm: React.FC = () => {
  const { setProfile } = useAudio();
  const [name, setName] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('male');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [experience, setExperience] = useState(2);
  
  const togglePreference = (pref: string) => {
    setPreferences(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref) 
        : [...prev, pref]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const userProfile: UserProfile = {
      name,
      age,
      gender,
      preferences,
      musicExperience: experience,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProfile(userProfile);
  };

  return (
    <Card className="w-full md:max-w-lg mx-auto glass-element border-futuristic-border">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-futuristic-accent1">Welcome to TUNE GUARD</h2>
        <p className="text-futuristic-muted">Let's personalize your audio experience</p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input 
              id="name" 
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="glass-input"
            />
          </div>
          
          <div>
            <Label>Age: {age}</Label>
            <Slider 
              value={[age]} 
              min={12} 
              max={100}
              step={1}
              onValueChange={values => setAge(values[0])}
              className="my-4"
            />
          </div>
          
          <div>
            <Label>Gender</Label>
            <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="mb-2 block">Music Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Pop', 'Rock', 'Hip-Hop', 'Classical', 'Jazz', 'Electronic'].map(genre => (
                <Button
                  key={genre}
                  type="button"
                  variant={preferences.includes(genre) ? 'default' : 'outline'}
                  className={`text-sm ${preferences.includes(genre) ? 'bg-futuristic-accent1 text-white' : ''}`}
                  onClick={() => togglePreference(genre)}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Music Listening Experience: {['Casual', 'Regular', 'Enthusiast', 'Audiophile'][experience]}</Label>
            <Slider 
              value={[experience]} 
              min={0} 
              max={3}
              step={1}
              onValueChange={values => setExperience(values[0])}
              className="my-4"
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full bg-futuristic-accent1 hover:bg-futuristic-accent1/80">
          Create Audio Profile
        </Button>
      </form>
    </Card>
  );
};

export default SignUpForm;
