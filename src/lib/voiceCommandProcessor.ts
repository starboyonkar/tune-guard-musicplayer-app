
import { ToastWithId } from './types';
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
  private commandHistory: string[] = [];
  private contextualKeywords: Record<string, string[]> = {};
  
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
   * Register contextual keywords to improve recognition in specific contexts
   */
  registerContextualKeywords(context: string, keywords: string[]): void {
    this.contextualKeywords[context] = keywords;
  }

  /**
   * Process a voice command with improved fuzzy matching
   * @returns Whether the command was recognized and executed
   */
  processCommand(command: string): boolean {
    if (!command) return false;
    
    const normalizedCommand = this.normalizeCommand(command);
    let executed = false;
    
    // Store command in history for context-aware processing
    this.commandHistory.unshift(normalizedCommand);
    if (this.commandHistory.length > 5) {
      this.commandHistory.pop();
    }
    
    // Check for each registered command
    for (const mapping of this.commandMappings) {
      const { patterns, handler, feedback } = mapping;
      
      // Try to match any pattern with fuzzy matching
      if (this.fuzzyMatchesAny(normalizedCommand, patterns)) {
        try {
          console.log(`Executing voice command: "${command}" matched pattern in: ${patterns.join(", ")}`);
          
          // Execute the command handler
          handler();
          
          // Show success feedback
          toast({
            title: feedback.title,
            description: feedback.description,
            variant: "default"
          } as ToastWithId);
          
          executed = true;
          break;
        } catch (error) {
          console.error("Error executing voice command:", error);
          toast({
            title: "Command Error",
            description: "There was an error executing the command",
            variant: "destructive"
          } as ToastWithId);
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
   * Enhanced with contextual awareness and phonetic similarity
   */
  private fuzzyMatchesAny(command: string, patterns: string[]): boolean {
    // Check for exact matches first (fastest path)
    for (const pattern of patterns) {
      if (command.includes(pattern.toLowerCase())) {
        return true;
      }
    }
    
    // Extract all potential context keywords from recent commands
    const potentialContextKeywords: string[] = [];
    for (const context in this.contextualKeywords) {
      for (const historyCmd of this.commandHistory) {
        if (historyCmd.includes(context.toLowerCase())) {
          potentialContextKeywords.push(...this.contextualKeywords[context]);
          break;
        }
      }
    }
    
    // More sophisticated fuzzy matching with context awareness
    return patterns.some(pattern => {
      // Exact match already checked above
      
      // Check for keyword matches in any order
      const patternWords = pattern.toLowerCase().split(/\s+/);
      const commandWords = command.split(/\s+/);
      
      // Count how many pattern words appear in the command
      let matchedWords = 0;
      for (const word of patternWords) {
        // Skip very short words for matching (articles, etc)
        if (word.length < 3) continue;
        
        // Check if the word or a similar one appears in the command
        if (commandWords.some(cmdWord => {
          // Exact match
          if (cmdWord === word) return true;
          
          // Similar word match for longer words
          if (cmdWord.length >= 4 && word.length >= 4) {
            const distance = this.levenshteinDistance(word, cmdWord);
            const maxDistance = Math.ceil(Math.min(word.length, cmdWord.length) * 0.3); // Allow more variance for longer words
            return distance <= maxDistance;
          }
          
          return false;
        })) {
          matchedWords++;
        }
      }
      
      // Calculate match percentage (ignore very short pattern words)
      const significantWords = patternWords.filter(w => w.length >= 3).length;
      const matchPercentage = significantWords > 0 ? matchedWords / significantWords : 0;
      
      // Boost match score if contextual keywords are found
      let contextBoost = 0;
      if (potentialContextKeywords.length > 0) {
        for (const keyword of potentialContextKeywords) {
          if (command.includes(keyword)) {
            contextBoost = 0.1; // 10% boost for contextual relevance
            break;
          }
        }
      }
      
      // Return true if match percentage is high enough (with context boost)
      return (matchPercentage + contextBoost) >= 0.7; // Require 70% match or better
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
  
  /**
   * Process a partial command that might be still in progress
   * Returns potential matches for active feedback
   */
  getPotentialMatches(partialCommand: string): string[] {
    if (!partialCommand || partialCommand.length < 3) return [];
    
    const normalized = this.normalizeCommand(partialCommand);
    const matches: string[] = [];
    
    for (const mapping of this.commandMappings) {
      for (const pattern of mapping.patterns) {
        if (pattern.toLowerCase().includes(normalized)) {
          matches.push(pattern);
        }
      }
    }
    
    return matches;
  }
}
