
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

// Audio analysis utilities for siren detection
export function calculateFrequencyDominance(frequencyData: Uint8Array, lowerBin: number, upperBin: number): number {
  // Calculate energy in the specified frequency band
  let energyInBand = 0;
  let totalEnergy = 0;
  
  for (let i = 0; i < frequencyData.length; i++) {
    if (i >= lowerBin && i <= upperBin) {
      energyInBand += frequencyData[i];
    }
    totalEnergy += frequencyData[i];
  }
  
  // Return the ratio of energy in band to total energy
  return totalEnergy > 0 ? energyInBand / totalEnergy : 0;
}

// Detect oscillating patterns in audio (like sirens)
export function detectOscillationPattern(
  timeData: Float32Array,
  sampleRate: number,
  minFreq: number = 0.5, // Minimum oscillations per second
  maxFreq: number = 4    // Maximum oscillations per second
): number {
  // This is a simplified algorithm to detect oscillating patterns
  // A real implementation would use techniques like autocorrelation or FFT
  
  // We're looking for zero-crossings at the right frequency
  let zeroCrossings = 0;
  for (let i = 1; i < timeData.length; i++) {
    if ((timeData[i] >= 0 && timeData[i - 1] < 0) || 
        (timeData[i] < 0 && timeData[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  
  // Calculate oscillations per second
  const duration = timeData.length / sampleRate;
  const oscillationsPerSecond = zeroCrossings / (2 * duration);
  
  // Calculate how well this matches our target range (0-1 score)
  if (oscillationsPerSecond < minFreq || oscillationsPerSecond > maxFreq) {
    return 0;
  }
  
  // Linear score where 1.0 is perfect match to expected oscillation rate
  const range = maxFreq - minFreq;
  const midpoint = minFreq + range / 2;
  const distance = Math.abs(oscillationsPerSecond - midpoint);
  const normalizedScore = 1 - (distance / (range / 2));
  
  return Math.max(0, normalizedScore);
}
