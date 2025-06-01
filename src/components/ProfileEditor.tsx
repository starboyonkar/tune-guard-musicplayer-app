
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudio } from '@/lib/audioContext';
import { UserProfile } from '@/lib/types';
import { User, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ProfileEditor = () => {
  const { profile, updateProfile } = useAudio();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 18,
    gender: 'prefer-not-to-say',
    dob: '',
    preferences: []
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        dob: profile.dob,
        preferences: profile.preferences || []
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (formData.name && formData.age && formData.gender && formData.dob) {
      updateProfile({
        ...formData,
        age: Number(formData.age)
      } as UserProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        dob: profile.dob,
        preferences: profile.preferences || []
      });
    }
    setIsEditing(false);
  };

  const musicGenres = [
    'Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 
    'Country', 'Blues', 'Reggae', 'Folk', 'Metal', 'Indie'
  ];

  const togglePreference = (genre: string) => {
    const currentPreferences = formData.preferences || [];
    const updated = currentPreferences.includes(genre)
      ? currentPreferences.filter(p => p !== genre)
      : [...currentPreferences, genre];
    
    setFormData({ ...formData, preferences: updated });
  };

  return (
    <Card className="border-futuristic-border bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-futuristic-accent1 flex items-center justify-between">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            User Profile
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm">
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="13"
              max="120"
              value={formData.age || ''}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender || 'prefer-not-to-say'}
              onValueChange={(value: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say') => 
                setFormData({ ...formData, gender: value })}
              disabled={!isEditing}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob || ''}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Music Preferences</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {musicGenres.map((genre) => (
              <Button
                key={genre}
                variant={(formData.preferences || []).includes(genre) ? "default" : "outline"}
                size="sm"
                onClick={() => togglePreference(genre)}
                disabled={!isEditing}
                className="text-xs"
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {profile && (
          <div className="border-t border-futuristic-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-futuristic-muted">Member since:</span>
              <span className="text-futuristic-text">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
            {profile.safetyScore !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-futuristic-muted">Hearing Safety Score:</span>
                <span className={`font-medium ${
                  profile.safetyScore >= 80 ? 'text-green-400' :
                  profile.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {profile.safetyScore}/100
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
