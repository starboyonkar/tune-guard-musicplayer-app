
// Voice command mapping with approved commands only
export const VOICE_COMMANDS = {
  PLAY: ['play', 'resume', 'start playing'],
  PAUSE: ['pause', 'stop', 'stop playing'],
  NEXT: ['next', 'skip', 'next song', 'next track', 'play next'],
  PREVIOUS: ['previous', 'back', 'previous song', 'go back', 'play previous'],
  LOGOUT: ['log out', 'sign out', 'logout', 'exit app', 'sign off', 'log off', 'logout now', 'exit account', 'sign me out'],
  HELP: ['help', 'voice commands', 'what can I say', 'command list', 'show commands'],
  EDIT_PROFILE: ['edit profile', 'open profile', 'update profile', 'change profile', 'modify profile', 'profile settings', 'my profile', 'show my profile', 'edit my profile', 'account settings'],
  CLOSE: ['close', 'close window', 'close dialog', 'exit', 'dismiss', 'close this', 'go back', 'cancel']
};

/**
 * Matches an input string against approved voice commands
 * @param input The user's voice input to check
 * @returns The matched command type or null if no match
 */
export function matchVoiceCommand(input: string): keyof typeof VOICE_COMMANDS | null {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check each command category
  for (const [commandType, phrases] of Object.entries(VOICE_COMMANDS)) {
    // Check if any phrase in this command type matches the input
    if (phrases.some(phrase => {
      // Simple fuzzy matching - check if the input contains the phrase
      // or the phrase contains the input (for shorter commands)
      return normalizedInput.includes(phrase) || 
             (phrase.length < 5 && normalizedInput === phrase);
    })) {
      return commandType as keyof typeof VOICE_COMMANDS;
    }
  }
  
  return null;
}
