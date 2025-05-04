
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

// Dispatch custom events for voice commands
export function dispatchVoiceCommandEvent(commandType: string): void {
  let eventName = '';
  
  switch (commandType) {
    case 'PLAY':
      eventName = 'play-audio';
      break;
    case 'PAUSE':
      eventName = 'pause-audio';
      break;
    case 'NEXT':
      eventName = 'next-track';
      break;
    case 'PREVIOUS':
      eventName = 'previous-track';
      break;
    case 'LOGOUT':
      eventName = 'user-logout';
      break;
    case 'EDIT_PROFILE':
      eventName = 'open-profile-editor';
      break;
    case 'CLOSE':
      eventName = 'close-active-panel';
      break;
    case 'HELP':
      eventName = 'show-command-reference';
      break;
    default:
      return;
  }
  
  // Create and dispatch the custom event
  const event = new CustomEvent(eventName);
  document.dispatchEvent(event);
}

// Throttle function to prevent multiple rapid calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

// Debounce function for events that should wait until activity stops
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
