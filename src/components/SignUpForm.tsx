
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAudio } from '@/lib/audioContext';
import { UserProfile } from '@/lib/types';
import VoiceCommandManager from './VoiceCommandManager';
import { toast } from '@/hooks/use-toast';

const SignUpForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const { signUp } = useAudio();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Create user profile and sign up
    const profile: UserProfile = {
      id: Date.now().toString(),
      username,
      email,
    };
    
    signUp(profile);
    
    toast({
      title: "Welcome to TuneGuard!",
      description: "Your account has been created successfully",
    });
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel border border-futuristic-border shadow-glow-sm p-6 rounded-lg animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold neon-text">Sign Up for TuneGuard</h2>
          <VoiceCommandManager isSignedUp={false} />
        </div>
        
        <p className="mb-6 text-futuristic-muted">
          Join now for an AI-powered audio experience with automatic siren detection and hearing protection.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-futuristic-muted">Username</label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-futuristic-bg/30 border-futuristic-border"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-futuristic-muted">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-futuristic-bg/30 border-futuristic-border"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90 animate-pulse-slow"
            >
              Get Started
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
