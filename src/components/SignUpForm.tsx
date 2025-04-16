import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudio } from '@/lib/audioContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { soundEffects } from '@/lib/soundEffects';

const SignUpForm: React.FC = () => {
  const { setProfile } = useAudio();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [musicExperience, setMusicExperience] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !age.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    
    soundEffects.playNotification();
    
    const profileData = {
      name: name.trim(),
      age: parseInt(age),
      gender,
      musicExperience,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProfile(profileData);
    
    toast({
      title: "Profile Created",
      description: `Welcome, ${name}!`,
    });
  };

  return (
    <Card className="w-full max-w-md glass border-futuristic-border">
      <CardHeader>
        <CardTitle className="neon-text">Create Your Audio Profile</CardTitle>
        <CardDescription className="text-futuristic-muted">
          Tell us a bit about yourself to personalize your audio experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-futuristic-border bg-futuristic-bg/30"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="age">Age</Label>
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
          
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={setGender} defaultValue={gender}>
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
          
          <Button type="submit" className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90">
            Create Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
