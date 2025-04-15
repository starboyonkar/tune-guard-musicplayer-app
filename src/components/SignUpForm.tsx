import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudio } from '@/lib/audioContext';
import { soundEffects } from '@/lib/soundEffects';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.string().min(1, {
    message: "Age must be a valid number",
  }),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']),
  preferences: z.array(z.string()).optional(),
})

const SignUpForm = () => {
  const { setProfile } = useAudio();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: 'prefer-not-to-say',
      preferences: [],
    },
  })

  const onSubmit = (values) => {
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
        // Removed invalid 'id' property
      });
      setLoading(false);
    }, 1500);
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-8 border border-futuristic-border rounded-lg glass">
      <h2 className="text-2xl font-semibold text-center mb-4 neon-text">Create Your Audio Profile</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-futuristic-accent1">Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your name" 
                    className="bg-futuristic-bg/50 border-futuristic-border"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-futuristic-accent1">Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Enter your age" 
                    className="bg-futuristic-bg/50 border-futuristic-border"
                    {...field} 
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
                <FormLabel className="text-futuristic-accent1">Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-futuristic-bg/50 border-futuristic-border">
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
