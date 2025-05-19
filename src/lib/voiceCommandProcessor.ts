
import { VoiceCommand } from './types';
import { toast } from '@/components/ui/use-toast';

type CommandHandler = () => void;

interface CommandMapping {
  patterns: string[];
  handler: CommandHandler;
  feedback: {
    title: string;
    description: string;
  };
}

/**
 * Enhanced voice command processor with fuzzy matching capabilities
 * for more accurate and flexible command recognition
 */
export class VoiceCommandProcessor {
  private commandMappings: CommandMapping[] = [];
  
  /**
   * Register a new voice command with multiple pattern variations
   */
  registerCommand(
    patterns: string[], 
    handler: CommandHandler, 
    feedback: { title: string; description: string }
  ): void {
    this.commandMappings.push({
      patterns,
      handler,
      feedback
    });
  }

  /**
   * Process a voice command with improved fuzzy matching
   * @returns Whether the command was recognized and executed
   */
  processCommand(command: string): boolean {
    if (!command) return false;
    
    const normalizedCommand = this.normalizeCommand(command);
    let executed = false;
    
    // Check for each registered command
    for (const mapping of this.commandMappings) {
      const { patterns, handler, feedback } = mapping;
      
      // Try to match any pattern with fuzzy matching
      if (this.fuzzyMatchesAny(normalizedCommand, patterns)) {
        try {
          // Execute the command handler
          handler();
          
          // Show success feedback
          toast({
            title: feedback.title,
            description: feedback.description
          });
          
          executed = true;
          break;
        } catch (error) {
          console.error("Error executing voice command:", error);
          toast({
            title: "Command Error",
            description: "There was an error executing the command",
            variant: "destructive"
          });
        }
      }
    }
    
    return executed;
  }
  
  /**
   * Normalize a command string for better matching
   */
  private normalizeCommand(command: string): string {
    return command.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  /**
   * Check if the command matches any of the patterns with fuzzy matching
   */
  private fuzzyMatchesAny(command: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      // Exact match
      if (command.includes(pattern.toLowerCase())) {
        return true;
      }
      
      // Words in pattern should appear in command in any order
      const patternWords = pattern.toLowerCase().split(/\s+/);
      return patternWords.every(word => 
        command.includes(word) || this.similarWordsInCommand(word, command)
      );
    });
  }
  
  /**
   * Check for similar words to handle minor speech recognition errors
   * Using Levenshtein distance for fuzzy matching
   */
  private similarWordsInCommand(word: string, command: string): boolean {
    if (word.length <= 3) return false; // Only match longer words to avoid false positives
    
    const commandWords = command.split(/\s+/);
    
    // Check for similar words with levenshtein distance
    return commandWords.some(cmdWord => {
      if (cmdWord.length < 3) return false;
      const distance = this.levenshteinDistance(word, cmdWord);
      
      // Adapt tolerance based on word length
      const maxDistance = Math.max(2, Math.floor(word.length / 4));
      return distance <= maxDistance;
    });
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   * for fuzzy string matching
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j-1] === b[i-1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,       // deletion
          matrix[i][j-1] + 1,       // insertion
          matrix[i-1][j-1] + cost   // substitution
        );
      }
    }
    
    return matrix[b.length][a.length];
  }
}
