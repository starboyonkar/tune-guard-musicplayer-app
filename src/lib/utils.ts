
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

// Simple utility to check if a command matches any pattern
export function matchesVoiceCommand(input: string, patterns: string[]): boolean {
  const lowerInput = input.toLowerCase();
  return patterns.some(pattern => lowerInput.includes(pattern.toLowerCase()));
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
