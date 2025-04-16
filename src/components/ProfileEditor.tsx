import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { Settings, User } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';

const ProfileEditor: React.FC = () => {
  const { profile, updateProfile, logout } = useAudio();
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age.toString() || '');
  const [gender, setGender] = useState<string>(
    profile?.gender || 'prefer-not-to-say'
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpenProfileEditor = () => {
      soundEffects.playTouchFeedback();
      setOpen(true);
    };
    
    const handleCloseActivePanel = () => {
      if (open) {
        setOpen(false);
      }
    };

    document.addEventListener('open-profile-editor', handleOpenProfileEditor);
    document.addEventListener('close-active-panel', handleCloseActivePanel);
    
    return () => {
      document.removeEventListener('open-profile-editor', handleOpenProfileEditor);
      document.removeEventListener('close-active-panel', handleCloseActivePanel);
    };
  }, [open]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(profile.age ? profile.age.toString() : '');
      setGender(profile.gender || 'prefer-not-to-say');
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    soundEffects.playTouchFeedback();
    
    updateProfile({
      name,
      age: parseInt(age),
      gender
    });
    
    setOpen(false);
  };

  const handleLogout = () => {
    soundEffects.playNotification();
    setOpen(false);
    logout();
  };

  if (!profile) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-futuristic-accent1">
          <User className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-futuristic-bg border-futuristic-border">
        <SheetHeader>
          <SheetTitle className="text-futuristic-accent1">User Profile</SheetTitle>
          <SheetDescription>
            Update your profile to adjust your audio experience.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
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
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90"
            >
              Update Profile
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              className="flex-1"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileEditor;
