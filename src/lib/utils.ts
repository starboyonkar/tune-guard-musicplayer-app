
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
