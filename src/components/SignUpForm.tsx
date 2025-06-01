
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { UserProfile } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import SocialFooter from './SocialFooter';

const SignUpForm = () => {
  const { setProfile } = useAudio();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dob: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.gender || !formData.dob) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(formData.age) < 13) {
      toast({
        title: "Age Restriction",
        description: "You must be at least 13 years old to use this app",
        variant: "destructive",
      });
      return;
    }

    const profile: UserProfile = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender as 'male' | 'female' | 'non-binary' | 'prefer-not-to-say',
      dob: formData.dob,
      createdAt: new Date().toISOString(),
      preferences: [],
      safetyScore: 100
    };

    setProfile(profile);
    
    toast({
      title: "Welcome to Tune Guard!",
      description: "Your profile has been created successfully",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className="border-futuristic-border bg-black/40 backdrop-blur-lg shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold neon-text">
            Join Tune Guard
          </CardTitle>
          <p className="text-futuristic-muted text-sm">
            Create your profile to get started with advanced audio protection
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-futuristic-text">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/60 border-futuristic-border text-futuristic-text"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-futuristic-text">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="bg-black/60 border-futuristic-border text-futuristic-text"
                placeholder="Enter your age"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-futuristic-text">
                Gender
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger className="bg-black/60 border-futuristic-border text-futuristic-text">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-futuristic-border">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-futuristic-text">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="bg-black/60 border-futuristic-border text-futuristic-text"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-futuristic-accent1 hover:bg-futuristic-accent1/80 text-black font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Create Profile & Enter
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <SocialFooter />
    </div>
  );
};

export default SignUpForm;
