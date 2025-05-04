
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function matchesVoiceCommand(input: string, commandVariations: string[]): boolean {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for exact match
  if (commandVariations.includes(normalizedInput)) {
    return true;
  }
  
  // Check if any variation is included in the input
  for (const variation of commandVariations) {
    if (normalizedInput.includes(variation)) {
      return true;
    }
  }
  
  return false;
}

export function dispatchVoiceCommandEvent(command: string): void {
  // Map command name to event name
  let eventName: string;
  
  switch (command) {
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
      console.warn(`No event mapping for command: ${command}`);
      return;
  }
  
  // Dispatch the custom event
  const event = new CustomEvent(eventName);
  document.dispatchEvent(event);
}
