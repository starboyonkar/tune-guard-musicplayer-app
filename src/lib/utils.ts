
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // Format as YYYY-MM-DD for input type="date"
  return date.toISOString().split('T')[0];
}

export function matchesVoiceCommand(input: string, commands: string[]): boolean {
  if (!input) return false;
  
  // Clean the input
  const cleanInput = input.toLowerCase().trim();
  
  // Direct match check first (most efficient)
  if (commands.includes(cleanInput)) return true;
  
  // Then check for commands contained within the input
  // This helps with longer sentences where the command appears somewhere in the middle
  return commands.some(cmd => {
    // For multi-word commands, ensure all words appear in the same order
    if (cmd.includes(' ')) {
      const cmdWords = cmd.split(' ');
      let lastIndex = -1;
      
      // Check if all words in the command appear in the input in the correct order
      return cmdWords.every(word => {
        const index = cleanInput.indexOf(word, lastIndex + 1);
        if (index > lastIndex) {
          lastIndex = index;
          return true;
        }
        return false;
      });
    } else {
      // For single-word commands, check if they appear as a whole word
      const regex = new RegExp(`\\b${cmd}\\b`, 'i');
      return regex.test(cleanInput);
    }
  });
}

export function calculateDOBFromAge(age: number): string {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  
  // Set to middle of the year by default (July 1st)
  const dob = new Date(birthYear, 6, 1);
  
  // Format as ISO string and take just the date part
  return dob.toISOString().split('T')[0];
}

// Function to debounce execution
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

// Throttle function to limit execution frequency
export function throttle<F extends (...args: any[]) => any>(
  func: F,
  limit: number
): (...args: Parameters<F>) => void {
  let inThrottle = false;
  
  return function(this: any, ...args: Parameters<F>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
