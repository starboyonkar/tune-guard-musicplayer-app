
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time from seconds to MM:SS format
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Calculate DOB from age
export function calculateDOBFromAge(age: number): Date {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return new Date(birthYear, today.getMonth(), today.getDate());
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Advanced command matching using fuzzy matching approach
export function matchesVoiceCommand(input: string, commandVariations: string[]): boolean {
  const normalizedInput = input.toLowerCase().trim();
  
  // Direct match
  if (commandVariations.includes(normalizedInput)) {
    return true;
  }
  
  // Partial match - check if input contains any of the command variations
  for (const variation of commandVariations) {
    if (normalizedInput.includes(variation)) {
      return true;
    }
    
    // Check if the command variation contains the input
    if (variation.includes(normalizedInput) && normalizedInput.length > 3) {
      return true;
    }
  }
  
  return false;
}

// Enhanced voice command recognition with threshold-based confidence
export function recognizeVoiceCommand(input: string, commandVariations: string[], threshold: number = 0.7): boolean {
  if (!input || input.trim().length === 0) return false;
  
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for exact matches first (highest confidence)
  if (commandVariations.some(cmd => cmd.toLowerCase() === normalizedInput)) {
    return true;
  }
  
  // Calculate similarity based on word overlap
  const inputWords = normalizedInput.split(/\s+/);
  
  for (const variation of commandVariations) {
    const variationWords = variation.toLowerCase().split(/\s+/);
    
    // Calculate word overlap
    const matchingWords = inputWords.filter(word => 
      variationWords.some(vWord => vWord.includes(word) || word.includes(vWord))
    );
    
    const overlapScore = matchingWords.length / Math.max(inputWords.length, 1);
    
    if (overlapScore >= threshold) {
      return true;
    }
  }
  
  return false;
}
