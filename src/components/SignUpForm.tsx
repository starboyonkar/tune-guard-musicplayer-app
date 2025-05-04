
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { calculateDOBFromAge, formatDate } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const SignUpForm = () => {
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { setProfile } = useAudio();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Calculate DOB from age
    const dob = formatDate(calculateDOBFromAge(Number(age)));

    // Create profile object with current date
    const profile: UserProfile = {
      name,
      age: Number(age),
      gender,
      createdAt: new Date().toISOString(),
      dob
    };

    // Small delay to simulate processing
    setTimeout(() => {
      setProfile(profile);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <Card className="glass border-futuristic-border w-full max-w-md p-6 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-futuristic-accent1 neon-text">Audio Persona</h1>
        <p className="text-futuristic-muted mt-2">Personalize your audio experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-input"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Your Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="glass-input"
            min="1"
            max="120"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender} required>
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 animate-glow"
          disabled={isSubmitting || !name || !age || !gender}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Start Personalized Audio Experience"
          )}
        </Button>
      </form>
    </Card>
  );
};

export default SignUpForm;
