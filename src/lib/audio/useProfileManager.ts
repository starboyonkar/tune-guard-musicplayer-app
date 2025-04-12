
import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getEQSettingsByAge } from './audioUtils';
import { toast } from '@/components/ui/use-toast';

export const useProfileManager = () => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  
  // Load profile from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('audioPersonaProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileState(parsedProfile);
        setIsSignedUp(true);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }
  }, []);
  
  // Set a new user profile
  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    setIsSignedUp(true);
    
    localStorage.setItem('audioPersonaProfile', JSON.stringify(newProfile));
    
    return getEQSettingsByAge(newProfile.age, newProfile.gender);
  };
  
  // Update an existing user profile
  const updateProfile = (partialProfile: Partial<UserProfile>) => {
    if (!profile) return null;
    
    const updatedProfile = {
      ...profile,
      ...partialProfile,
      updatedAt: new Date().toISOString()
    };
    
    setProfileState(updatedProfile);
    localStorage.setItem('audioPersonaProfile', JSON.stringify(updatedProfile));
    
    toast({
      title: "Profile Updated",
      description: "Your audio profile has been updated with new settings."
    });
    
    if (partialProfile.age !== undefined || partialProfile.gender !== undefined) {
      return getEQSettingsByAge(
        updatedProfile.age, 
        updatedProfile.gender
      );
    }
    
    return null;
  };
  
  return {
    profile,
    isSignedUp,
    setProfile,
    updateProfile
  };
};
