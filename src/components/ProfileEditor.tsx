
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { User } from 'lucide-react';

const ProfileEditor: React.FC = () => {
  const { profile, updateProfile } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age.toString() || '18');
  const [gender, setGender] = useState(profile?.gender || 'male');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfile({
      name,
      age: parseInt(age, 10),
      gender
    });
    
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-futuristic-muted hover:text-futuristic-accent1"
          title="Edit Profile"
        >
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md glass-panel">
        <DialogHeader>
          <DialogTitle className="neon-text text-xl">Edit Your Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-futuristic-bg/30"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="age">Age</Label>
            <Input 
              id="age" 
              type="number"
              min="13"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="bg-futuristic-bg/30"
              required
            />
          </div>
          
          <div>
            <Label>Gender</Label>
            <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4 pt-2">
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
          
          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
