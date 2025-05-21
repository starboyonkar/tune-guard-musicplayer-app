import { toast } from '@/components/ui/use-toast';

type CommandHandler = () => void;

interface CommandMapping {
  patterns: string[];
  handler: CommandHandler;
  feedback: {
    title: string;
    description: string;
  };
  priority?: number; // Higher number means higher priority
}

/**
 * Enhanced voice command processor with improved matching capabilities
 * for more accurate and flexible command recognition
 */
export class VoiceCommandProcessor {
  private commandMappings: CommandMapping[] = [];
  private commandHistory: string[] = [];
  private contextualKeywords: Record<string, string[]> = {};
  private lastProcessedCommand: string = '';
  private processingThrottleTimer: NodeJS.Timeout | null = null;
  private alternativeCommands: Record<string, string[]> = {};
  private commandsToRetry: string[] = [];
  private contextMode: string | null = null;
  
  /**
   * Register a new voice command with multiple pattern variations
   */
  registerCommand(
    patterns: string[], 
    handler: CommandHandler, 
    feedback: { title: string; description: string },
    priority: number = 1
  ): void {
    this.commandMappings.push({
      patterns,
      handler,
      feedback,
      priority
    });
    
    // Sort commands by priority after registration
    this.commandMappings.sort((a, b) => (b.priority || 1) - (a.priority || 1));
  }

  /**
   * Register contextual keywords to improve recognition in specific contexts
   * and also register alternative phrasings for commands
   */
  registerContextualKeywords(context: string, keywords: string[]): void {
    this.contextualKeywords[context] = keywords;
  }
  
  /**
   * Register alternative commands that might be misheard by speech recognition
   */
  registerAlternativeCommands(command: string, alternatives: string[]): void {
    this.alternativeCommands[command] = alternatives;
  }
  
  /**
   * Set the current context mode to improve command recognition accuracy
   * in specific application states
   */
  setContextMode(mode: string | null): void {
    this.contextMode = mode;
    console.log(`Voice command context set to: ${mode || 'default'}`);
  }

  /**
   * Process a voice command with improved fuzzy matching
   * @returns Whether the command was recognized and executed
   */
  processCommand(command: string): boolean {
    if (!command) return false;
    
    // Prevent duplicate command processing
    if (command === this.lastProcessedCommand) {
      return false;
    }
    
    // Apply throttling to prevent rapid command executions
    if (this.processingThrottleTimer) {
      clearTimeout(this.processingThrottleTimer);
    }
    
    const normalizedCommand = this.normalizeCommand(command);
    let executed = false;
    
    // Store command in history for context-aware processing
    if (!this.commandHistory.includes(normalizedCommand)) {
      this.commandHistory.unshift(normalizedCommand);
      if (this.commandHistory.length > 10) { // Expanded history for better context
        this.commandHistory.pop();
      }
    }
    
    // Sort commands so higher priority ones are checked first
    const sortedCommands = [...this.commandMappings].sort((a, b) => 
      (b.priority || 1) - (a.priority || 1)
    );
    
    // Check if this command was previously failed and is being retried
    const isRetry = this.commandsToRetry.includes(normalizedCommand);
    
    // Check for each registered command
    for (const mapping of sortedCommands) {
      const { patterns, handler, feedback } = mapping;
      
      // Enhanced fuzzy matching - use more aggressive matching for retries
      const matchConfidence = this.fuzzyMatchesAny(normalizedCommand, patterns);
      const shouldExecute = isRetry ? matchConfidence > 0.5 : matchConfidence > 0.7;
      
      if (shouldExecute) {
        try {
          console.log(`Executing voice command: "${command}" matched pattern in: ${patterns.join(", ")} (confidence: ${matchConfidence.toFixed(2)})`);
          
          // Execute the command handler
          handler();
          
          // Show success feedback using toast
          toast({
            title: feedback.title,
            description: feedback.description,
            variant: "default",
          });
          
          executed = true;
          this.lastProcessedCommand = command;
          
          // Remove from retry list if it was there
          if (isRetry) {
            this.commandsToRetry = this.commandsToRetry.filter(cmd => cmd !== normalizedCommand);
          }
          
          // Set throttle to prevent duplicate executions
          this.processingThrottleTimer = setTimeout(() => {
            this.processingThrottleTimer = null;
          }, 1500);
          
          break;
        } catch (error) {
          console.error("Error executing voice command:", error);
          toast({
            title: "Command Error",
            description: "There was an error executing the command",
            variant: "destructive",
          });
        }
      }
      // If there's a partial match but not enough to execute, remember for potential retry
      else if (matchConfidence > 0.5 && !isRetry) {
        this.commandsToRetry.push(normalizedCommand);
        // Limit the retry list
        if (this.commandsToRetry.length > 5) {
          this.commandsToRetry.shift();
        }
      }
    }
    
    // If not executed but we had a near match, give more helpful feedback
    if (!executed && this.commandsToRetry.includes(normalizedCommand)) {
      // Get potential matches for better feedback
      const potentialMatches = this.getPotentialMatches(normalizedCommand);
      
      if (potentialMatches.length > 0) {
        toast({
          title: "Did you mean?",
          description: `Try saying: "${potentialMatches[0]}"`,
          variant: "default",
        });
        return false;
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
   * @returns A confidence score between 0 and 1
   */
  private fuzzyMatchesAny(command: string, patterns: string[]): number {
    // Check for exact matches first (fastest path)
    for (const pattern of patterns) {
      if (command.includes(pattern.toLowerCase())) {
        return 1.0; // Perfect match
      }
    }
    
    // Check for exact matches against alternative commands
    for (const pattern of patterns) {
      const alternatives = this.alternativeCommands[pattern] || [];
      if (alternatives.some(alt => command.includes(alt.toLowerCase()))) {
        return 0.95; // Very high confidence for alternative matches
      }
    }
    
    // Extract all potential context keywords from recent commands
    const potentialContextKeywords: string[] = [];
    
    // Add current context keywords if available
    if (this.contextMode && this.contextualKeywords[this.contextMode]) {
      potentialContextKeywords.push(...this.contextualKeywords[this.contextMode]);
    }
    
    // Also add keywords from recent command history
    for (const context in this.contextualKeywords) {
      for (const historyCmd of this.commandHistory) {
        if (historyCmd.includes(context.toLowerCase())) {
          potentialContextKeywords.push(...this.contextualKeywords[context]);
          break;
        }
      }
    }
    
    // More sophisticated fuzzy matching with context awareness
    const matchScores = patterns.map(pattern => {
      // Exact match already checked above
      
      // Check for keyword matches in any order
      const patternWords = pattern.toLowerCase().split(/\s+/);
      const commandWords = command.split(/\s+/);
      
      // Count how many pattern words appear in the command
      let matchedWords = 0;
      let totalPatternWordLength = 0;
      let matchedWordLength = 0;
      
      for (const word of patternWords) {
        // Skip very short words for matching (articles, etc)
        if (word.length < 3) continue;
        
        totalPatternWordLength += word.length;
        
        // Check if the word or a similar one appears in the command
        const wordMatch = commandWords.some(cmdWord => {
          // Exact match
          if (cmdWord === word) {
            matchedWordLength += word.length;
            return true;
          }
          
          // Similar word match for longer words
          if (cmdWord.length >= 4 && word.length >= 4) {
            const distance = this.levenshteinDistance(word, cmdWord);
            const maxDistance = Math.ceil(Math.min(word.length, cmdWord.length) * 0.3); // Allow more variance for longer words
            
            if (distance <= maxDistance) {
              // Partial credit based on how close the match is
              matchedWordLength += word.length * (1 - distance/word.length);
              return true;
            }
          }
          
          // Check if command word sounds like pattern word
          if (this.soundsLike(cmdWord, word)) {
            matchedWordLength += word.length * 0.8; // 80% credit for phonetic matches
            return true;
          }
          
          return false;
        });
        
        if (wordMatch) {
          matchedWords++;
        }
      }
      
      // Calculate match percentage by both word count and character coverage
      const significantWords = patternWords.filter(w => w.length >= 3).length;
      const wordMatchPercentage = significantWords > 0 ? matchedWords / significantWords : 0;
      const charMatchPercentage = totalPatternWordLength > 0 ? matchedWordLength / totalPatternWordLength : 0;
      
      // Combine both metrics with more weight on character matching
      let matchPercentage = (wordMatchPercentage * 0.4) + (charMatchPercentage * 0.6);
      
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
      
      // Boost score if the command contains distinctive keywords from the pattern
      const distinctiveKeywords = this.getDistinctiveKeywords(pattern);
      for (const keyword of distinctiveKeywords) {
        if (command.includes(keyword)) {
          contextBoost += 0.05; // Additional 5% boost for each distinctive keyword
        }
      }
      
      // Add recency boost if recent commands are similar (user might be trying to repeat)
      if (this.commandHistory.length > 0) {
        const mostRecentCommand = this.commandHistory[0];
        if (mostRecentCommand !== command) { // Don't boost exact repeats
          const similarity = this.commandSimilarity(pattern, mostRecentCommand);
          if (similarity > 0.7) {
            // Add a small recency boost if user seems to be trying same command
            contextBoost += 0.05;
          }
        }
      }
      
      // Return combined score (capped at 1.0)
      return Math.min(1.0, matchPercentage + contextBoost);
    });
    
    // Return the highest match score among all patterns
    return Math.max(0, ...matchScores);
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
   * Rudimentary function to check if two words sound similar
   * based on simplified phonetics
   */
  private soundsLike(word1: string, word2: string): boolean {
    if (Math.abs(word1.length - word2.length) > 2) return false;
    
    // Map similar phonetic patterns
    const simplifyPhonetics = (word: string): string => {
      return word
        .replace(/[aeiou]+/g, 'a') // Replace all vowels with 'a'
        .replace(/ck/g, 'k')      // Common phonetic equivalents
        .replace(/ph/g, 'f')
        .replace(/[sz]/g, 's')
        .replace(/[dt]/g, 'd')
        .replace(/[bp]/g, 'b')
        .replace(/[gkq]/g, 'g')
        .replace(/[mn]/g, 'm')
        .replace(/[vf]/g, 'v')
        .replace(/[cks]/g, 'k');
    };
    
    const phonetic1 = simplifyPhonetics(word1);
    const phonetic2 = simplifyPhonetics(word2);
    
    const distance = this.levenshteinDistance(phonetic1, phonetic2);
    return distance <= 1; // Allow only very small differences in phonetic representation
  }
  
  /**
   * Calculate similarity between two commands
   */
  private commandSimilarity(cmd1: string, cmd2: string): number {
    const words1 = cmd1.toLowerCase().split(/\s+/);
    const words2 = cmd2.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word1 of words1) {
      if (word1.length < 3) continue; // Skip short words
      for (const word2 of words2) {
        if (word2.length < 3) continue;
        if (word1 === word2 || this.levenshteinDistance(word1, word2) <= 1) {
          matches++;
          break;
        }
      }
    }
    
    // Calculate similarity as percentage of matched words
    const significantWords1 = words1.filter(w => w.length >= 3).length;
    const significantWords2 = words2.filter(w => w.length >= 3).length;
    const maxWords = Math.max(significantWords1, significantWords2);
    
    return maxWords > 0 ? matches / maxWords : 0;
  }
  
  /**
   * Extract distinctive keywords from a command pattern
   */
  private getDistinctiveKeywords(pattern: string): string[] {
    const words = pattern.toLowerCase().split(/\s+/);
    // Filter out common words and keep only distinctive ones
    const commonWords = ['the', 'a', 'an', 'to', 'for', 'and', 'or', 'but', 'is', 'are', 'was', 'be'];
    return words.filter(word => word.length > 3 && !commonWords.includes(word));
  }
  
  /**
   * Process a partial command that might be still in progress
   * Returns potential matches for active feedback
   */
  getPotentialMatches(partialCommand: string): string[] {
    if (!partialCommand || partialCommand.length < 3) return [];
    
    const normalized = this.normalizeCommand(partialCommand);
    const matches: string[] = [];
    const scores: {pattern: string, score: number}[] = [];
    
    for (const mapping of this.commandMappings) {
      for (const pattern of mapping.patterns) {
        const matchScore = this.fuzzyMatchesAny(normalized, [pattern]);
        if (matchScore > 0.5) {
          scores.push({pattern, score: matchScore});
        }
      }
    }
    
    // Sort by match score and return top matches
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.pattern);
  }
  
  /**
   * Reset the processor state (useful when voice recognition restarts)
   */
  reset(): void {
    this.lastProcessedCommand = '';
    this.commandsToRetry = [];
    if (this.processingThrottleTimer) {
      clearTimeout(this.processingThrottleTimer);
      this.processingThrottleTimer = null;
    }
  }
}
