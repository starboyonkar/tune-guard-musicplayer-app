
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAudio } from '@/lib/audioContext';
import { calculateDOBFromAge } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  age: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val >= 13 && val <= 120, {
    message: "Age must be between 13 and 120",
  }),
  preferences: z.array(z.string()).default([]),
});

const SignUpForm = () => {
  const { signUp } = useAudio();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form definition with Zod schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      age: "25",
      preferences: [],
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Calculate DOB from age
      const dob = calculateDOBFromAge(values.age);
      
      // Call signUp from AudioContext
      await signUp({
        username: values.username,
        dateOfBirth: dob,
        preferences: values.preferences,
      });
    } catch (error) {
      console.error("Sign up failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card w-full max-w-md p-6 space-y-8 animate-fadeIn">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight neon-text">Welcome to TUNE GUARD</h1>
        <p className="text-sm text-muted-foreground">Create your profile to get started</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
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
                  <Input type="number" placeholder="25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Music Experience</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange([value])}
                  defaultValue={field.value[0]}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-futuristic-accent1 hover:bg-futuristic-accent1/90 transition-all" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;
