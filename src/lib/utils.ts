import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Enhanced voice command matcher with fuzzy matching support
export function matchesVoiceCommand(input: string, commands: string[]): boolean {
  // Clean up the input
  const cleanInput = input.toLowerCase().trim().replace(/[^\w\s]/g, '');
  
  // First try exact matches
  for (const command of commands) {
    if (cleanInput.includes(command.toLowerCase())) {
      return true;
    }
  }
  
  // Then try fuzzy matching for longer inputs
  if (cleanInput.length > 3) {
    for (const command of commands) {
      // Check if command words appear in input with some word boundaries
      const commandWords = command.toLowerCase().split(' ');
      
      let matchedWords = 0;
      for (const word of commandWords) {
        if (word.length > 2 && cleanInput.includes(word)) {
          matchedWords++;
        }
      }
      
      // If more than half of the words match, consider it a match
      if (commandWords.length > 1 && matchedWords >= commandWords.length / 2) {
        return true;
      }
      
      // For single word commands, check for partial matches with at least 60% of letters
      if (commandWords.length === 1 && command.length > 3) {
        let matchedLetters = 0;
        const commandLetters = command.toLowerCase().split('');
        
        for (const letter of commandLetters) {
          if (cleanInput.includes(letter)) {
            matchedLetters++;
          }
        }
        
        if (matchedLetters >= command.length * 0.6) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Calculate a date of birth based on age
 * @param age The person's age in years
 * @returns Date object representing their approximate date of birth
 */
export function calculateDOBFromAge(age: number): Date {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return new Date(birthYear, today.getMonth(), today.getDate());
}

/**
 * Format a date into a string YYYY-MM-DD format
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Calculate hearing protection percentage based on volume and EQ settings
 * @param volume Current volume (0-100)
 * @param bassLevel Bass EQ level (0-100)
 * @param trebleLevel Treble EQ level (0-100)
 * @returns Hearing protection score (0-100)
 */
export function calculateHearingProtection(volume: number, bassLevel: number, trebleLevel: number): number {
  // Base protection level starts at 100% and decreases with higher volumes
  let protectionLevel = 100;
  
  // Volume has the most significant impact on hearing safety
  if (volume > 70) {
    // Exponential reduction as volume increases above 70%
    protectionLevel -= Math.pow(volume - 70, 1.5) * 0.5;
  }
  
  // Excessive bass can cause hearing fatigue
  if (bassLevel > 80) {
    protectionLevel -= (bassLevel - 80) * 0.5;
  }
  
  // High treble can damage hair cells in the inner ear
  if (trebleLevel > 75) {
    protectionLevel -= (trebleLevel - 75) * 0.7;
  }
  
  // Ensure the protection level is between 0-100
  return Math.max(0, Math.min(100, Math.round(protectionLevel)));
}

/**
 * Analyzes audio spectrum for potentially harmful frequencies
 * @param frequencyData Array of frequency magnitude data
 * @param sampleRate Audio context sample rate
 * @returns Object with harmful frequency metrics
 */
export function analyzeHarmfulFrequencies(frequencyData: Uint8Array, sampleRate: number) {
  const binSize = sampleRate / frequencyData.length;
  const highFreqThreshold = 10000; // Hz
  const highFreqStartBin = Math.floor(highFreqThreshold / binSize);
  
  let highFreqEnergy = 0;
  let totalEnergy = 1; // Avoid division by zero
  
  // Calculate energy in high frequency range
  for (let i = highFreqStartBin; i < frequencyData.length; i++) {
    highFreqEnergy += frequencyData[i];
  }
  
  // Calculate total energy across all frequencies
  for (let i = 0; i < frequencyData.length; i++) {
    totalEnergy += frequencyData[i];
  }
  
  // Calculate the ratio of high frequency energy to total energy
  const highFreqRatio = highFreqEnergy / totalEnergy;
  
  return {
    highFrequencyRatio: highFreqRatio,
    isHarmful: highFreqRatio > 0.3 // If high frequencies make up more than 30% of the total energy
  };
}
