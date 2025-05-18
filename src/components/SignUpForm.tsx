import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAudio } from '@/lib/audioContext';
import { UserProfile } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import VoiceCommandManager from './VoiceCommandManager';

const SignUpForm: React.FC = () => {
  const { signUp } = useAudio();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const newUser: UserProfile = {
      username,
      email,
      password,
      avatar: avatarPreview || undefined,
    };

    try {
      await signUp(newUser, avatarFile);
      toast({
        title: "Sign up successful",
        description: "You are now signed up.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to sign up. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 relative">
      <div className="absolute top-4 right-4">
        <VoiceCommandManager />
      </div>
      
      <div className="text-center mb-6">
        <Avatar className="h-24 w-24 mx-auto border border-white/10 animate-pulse-slow">
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} alt="Avatar" />
          ) : (
            <AvatarFallback>UN</AvatarFallback>
          )}
        </Avatar>
        <Label htmlFor="avatar" className="mt-2 text-sm text-futuristic-muted hover:text-futuristic-accent1 cursor-pointer">
          Change Avatar
        </Label>
        <Input
          type="file"
          id="avatar"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 text-white hover:opacity-90 animate-glow">
          Sign Up
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;
