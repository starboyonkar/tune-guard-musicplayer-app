import React, { useState } from 'react';
import { useAudio } from '@/lib/audioContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { soundEffects } from '@/lib/soundEffects';
import { SparklesCore } from '@/components/ui/sparkles';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 13 && num <= 120;
  }, { message: 'Age must be between 13 and 120' }),
  gender: z.string(),
  preferences: z.array(z.string()).min(1, { message: 'Select at least one preference' }),
  termsAccepted: z.boolean().refine((val) => val === true, { message: 'You must accept the terms' }),
});

const SignUpForm: React.FC = () => {
  const { setProfile } = useAudio();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      age: '25',
      gender: 'male',
      preferences: ['pop'],
      termsAccepted: false,
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    soundEffects.playNotification();
    
    // Simulate API call
    setTimeout(() => {
      setProfile({
        name: values.name,
        age: parseInt(values.age, 10),
        gender: values.gender,
        preferences: values.preferences,
        createdAt: new Date().toISOString()
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Particle effect background */}
      <div className="absolute inset-0 -z-10">
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={70}
          className="w-full h-full"
          particleColor="#60A5FA"
        />
      </div>
      
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center neon-text">
          TUNE<span className="text-futuristic-accent1">GUARD</span>
        </h2>
        <p className="text-center mb-6 text-futuristic-muted">
          Create your audio profile for personalized experience
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-futuristic-accent2">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      {...field}
                      className="glass-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-futuristic-accent2">Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="13"
                        max="120"
                        placeholder="Your age"
                        {...field}
                        className="glass-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-futuristic-accent2">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-panel">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="preferences"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-futuristic-accent2">Music Preferences</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['pop', 'rock', 'jazz', 'classical', 'hiphop', 'electronic'].map((genre) => (
                      <FormField
                        key={genre}
                        control={form.control}
                        name="preferences"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={genre}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(genre)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, genre])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== genre
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm capitalize">
                                {genre}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the terms and privacy policy
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 animate-glow hover:opacity-90 transition-opacity"
            >
              {loading ? "Creating profile..." : "Create Audio Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignUpForm;
