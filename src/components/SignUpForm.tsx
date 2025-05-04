
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudio } from '@/lib/audioContext';
import { toast } from '@/components/ui/use-toast';
import { calculateDOBFromAge } from '@/lib/utils';

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Age must be a positive number",
  }),
  gender: z.string().min(1, "Please select your gender"),
  preferences: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setProfile } = useAudio();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      preferences: []
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Calculate DOB from age
      const dob = calculateDOBFromAge(Number(data.age));
      
      // Create the user profile
      setProfile({
        name: data.name,
        age: Number(data.age),
        gender: data.gender,
        preferences: data.preferences || [],
        dob: dob,
        createdAt: new Date().toISOString()
      });
      
      toast({
        title: "Profile Created",
        description: "Your audio profile has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full p-6 glass border-futuristic-border rounded-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 neon-text">Welcome to TUNE GUARD</h1>
      <p className="text-futuristic-muted mb-6">Create your personalized audio profile to get started.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your name" 
                    className="bg-futuristic-bg/30 border-futuristic-border" 
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
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter your age" 
                    className="bg-futuristic-bg/30 border-futuristic-border" 
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
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-futuristic-bg/30 border-futuristic-border">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-futuristic-bg border-futuristic-border">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-futuristic-accent1 to-futuristic-accent2 hover:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignUpForm;
