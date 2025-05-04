
/**
 * Voice Recognition Service
 * 
 * Handles the speech recognition functionality for the application
 * with optimized command detection.
 */

import { VOICE_COMMANDS } from './voiceCommands';
import { matchesVoiceCommand } from './utils';

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

type VoiceRecognitionCallback = (command: string) => void;

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private commandCallback: VoiceRecognitionCallback | null = null;
  private interimResults: string = '';
  private confidenceThreshold: number = 0.7;
  private commandTimeout: number | null = null;
  private lastProcessedCommand: string = '';
  private lastProcessedTime: number = 0;
  private commandCooldown: number = 1000; // 1 second cooldown between same commands

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    // Set up event handlers
    this.recognition.onresult = this.handleRecognitionResult.bind(this);
    this.recognition.onend = this.handleRecognitionEnd.bind(this);
    this.recognition.onerror = this.handleRecognitionError.bind(this);
  }

  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    let transcript = '';
    let isFinal = false;
    let confidence = 0;

    // Process the recognition results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      confidence = event.results[i][0].confidence;
      isFinal = event.results[i].isFinal;
    }

    // Clean up the transcript
    transcript = transcript.trim().toLowerCase();

    // Process final results with sufficient confidence
    if (isFinal && confidence > this.confidenceThreshold) {
      this.processCommand(transcript);
    } else if (!isFinal) {
      // Store interim results for potential future use
      this.interimResults = transcript;
      
      // Clear any existing timeout
      if (this.commandTimeout !== null) {
        clearTimeout(this.commandTimeout);
      }
      
      // Set timeout to process the command if no final result arrives
      this.commandTimeout = window.setTimeout(() => {
        if (this.interimResults) {
          this.processCommand(this.interimResults);
          this.interimResults = '';
        }
      }, 1500);
    }
  }

  private processCommand(transcript: string): void {
    // Don't process empty transcripts
    if (!transcript) return;
    
    // Check if this is the same command processed recently
    const now = Date.now();
    const isSameCommand = transcript === this.lastProcessedCommand;
    const elapsed = now - this.lastProcessedTime;
    
    if (isSameCommand && elapsed < this.commandCooldown) {
      return; // Skip if same command within cooldown period
    }
    
    console.log('Processing voice command:', transcript);
    
    if (this.commandCallback) {
      this.commandCallback(transcript);
      
      // Update last processed command info
      this.lastProcessedCommand = transcript;
      this.lastProcessedTime = now;
    }
  }

  private handleRecognitionEnd(): void {
    // Auto-restart recognition if still supposed to be listening
    if (this.isListening && this.recognition) {
      try {
        this.recognition.start();
        console.log('Voice recognition restarted');
      } catch (e) {
        console.error('Error restarting voice recognition:', e);
        // Try to re-initialize if there was an error
        setTimeout(() => {
          this.initRecognition();
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch (err) {
              console.error('Failed to restart voice recognition:', err);
            }
          }
        }, 1000);
      }
    }
  }

  private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
    console.error('Voice recognition error:', event.error);
    
    // Handle specific error types
    if (event.error === 'not-allowed') {
      console.error('Microphone access denied');
    } else if (event.error === 'no-speech') {
      // Ignore no-speech errors and just restart
    } else {
      // For other errors, try to restart after a short delay
      setTimeout(() => {
        if (this.isListening && this.recognition) {
          this.stop();
          this.start(this.commandCallback!);
        }
      }, 1000);
    }
  }

  public start(callback: VoiceRecognitionCallback): void {
    this.commandCallback = callback;
    
    if (!this.recognition) {
      this.initRecognition();
    }
    
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        console.log('Voice recognition started');
      } catch (e) {
        console.error('Error starting voice recognition:', e);
      }
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        console.log('Voice recognition stopped');
      } catch (e) {
        console.error('Error stopping voice recognition:', e);
      }
    }
    
    this.commandCallback = null;
    
    // Clear any pending timeouts
    if (this.commandTimeout !== null) {
      clearTimeout(this.commandTimeout);
      this.commandTimeout = null;
    }
  }

  public isSupported(): boolean {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }
}

// Create and export a singleton instance
export const voiceRecognition = new VoiceRecognitionService();
