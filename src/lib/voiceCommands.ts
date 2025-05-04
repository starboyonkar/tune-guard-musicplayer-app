
// Voice commands configuration
export const VOICE_COMMANDS = {
  // Playback controls
  PLAY: ['play', 'resume', 'start playing'],
  PAUSE: ['pause', 'stop', 'stop playing'],
  NEXT: ['next', 'skip', 'next song', 'next track', 'play next'],
  PREVIOUS: ['previous', 'back', 'previous song', 'go back', 'play previous'],
  
  // Account & Navigation
  LOGOUT: ['log out', 'sign out', 'logout', 'exit app', 'sign off', 'log off', 'logout now', 'exit account', 'sign me out'],
  EDIT_PROFILE: ['edit profile', 'open profile', 'update profile', 'change profile', 'modify profile', 'profile settings', 'my profile', 'show my profile', 'edit my profile', 'account settings'],
  CLOSE: ['close', 'close window', 'close dialog', 'exit', 'dismiss', 'close this', 'go back', 'cancel'],
  
  // Help & Guidance
  HELP: ['help', 'voice commands', 'what can i say', 'command list', 'show commands'],
};

// Command groups for UI presentation
export const COMMAND_GROUPS = {
  playback: [
    { name: "Play", variations: VOICE_COMMANDS.PLAY },
    { name: "Pause", variations: VOICE_COMMANDS.PAUSE },
    { name: "Next Song", variations: VOICE_COMMANDS.NEXT },
    { name: "Previous Song", variations: VOICE_COMMANDS.PREVIOUS },
  ],
  account: [
    { name: "Edit Profile", variations: VOICE_COMMANDS.EDIT_PROFILE },
    { name: "Logout", variations: VOICE_COMMANDS.LOGOUT },
  ],
  navigation: [
    { name: "Close", variations: VOICE_COMMANDS.CLOSE },
    { name: "Help", variations: VOICE_COMMANDS.HELP },
  ]
};

// Browser compatibility for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
  mozSpeechRecognition?: any;
  msSpeechRecognition?: any;
}

// Enhanced voice command processor with browser support
export class VoiceCommandProcessor {
  private recognition: any = null;
  private isInitialized: boolean = false;
  private isListening: boolean = false;
  private commandCallback: ((command: string) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;
  private statusCallback: ((status: string) => void) | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  // Initialize speech recognition with proper browser support
  private initSpeechRecognition(): boolean {
    if (this.isInitialized) return true;
    
    try {
      const windowWithSpeech = window as IWindow;
      
      // Check for browser support
      const SpeechRecognitionImpl = 
        windowWithSpeech.SpeechRecognition || 
        windowWithSpeech.webkitSpeechRecognition ||
        windowWithSpeech.mozSpeechRecognition ||
        windowWithSpeech.msSpeechRecognition;
      
      if (!SpeechRecognitionImpl) {
        console.error("Speech recognition is not supported in this browser");
        if (this.errorCallback) {
          this.errorCallback("Speech recognition is not supported in this browser");
        }
        return false;
      }
      
      this.recognition = new SpeechRecognitionImpl();
      
      if (this.recognition) {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        // Set up recognition event handlers
        this.recognition.onresult = this.handleRecognitionResult.bind(this);
        this.recognition.onerror = this.handleRecognitionError.bind(this);
        this.recognition.onend = this.handleRecognitionEnd.bind(this);
        this.recognition.onstart = this.handleRecognitionStart.bind(this);
        
        this.isInitialized = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      if (this.errorCallback) {
        this.errorCallback(`Error initializing speech recognition: ${error}`);
      }
      return false;
    }
  }

  // Process recognition results
  private handleRecognitionResult(event: any): void {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0].transcript)
      .join(' ')
      .toLowerCase();
    
    // Process only if we have a final result or meaningful interim result
    if (event.results[0].isFinal || transcript.length > 5) {
      this.processCommand(transcript);
    }
  }

  // Handle recognition errors
  private handleRecognitionError(event: any): void {
    console.error("Speech recognition error:", event.error);
    
    if (this.errorCallback) {
      let message = "Voice recognition error";
      
      switch (event.error) {
        case 'not-allowed':
          message = "Microphone access denied. Please allow microphone access in your browser settings.";
          break;
        case 'no-speech':
          message = "No speech detected. Please try speaking again.";
          break;
        case 'network':
          message = "Network error occurred. Please check your connection.";
          break;
        default:
          message = `Voice recognition error: ${event.error}`;
      }
      
      this.errorCallback(message);
    }
    
    // Attempt to restart if recognition stops due to error
    if (this.isListening) {
      setTimeout(() => {
        if (this.isListening) {
          this.restartListening();
        }
      }, 1000);
    }
  }

  // Handle recognition end event
  private handleRecognitionEnd(): void {
    if (this.statusCallback) {
      this.statusCallback("inactive");
    }
    
    // Restart if needed
    if (this.isListening) {
      this.restartListening();
    }
  }

  // Handle recognition start event
  private handleRecognitionStart(): void {
    if (this.statusCallback) {
      this.statusCallback("active");
    }
  }

  // Process the transcript to identify commands
  private processCommand(transcript: string): void {
    if (!transcript || transcript.trim() === '') return;
    
    // Check for each command type
    for (const [commandType, variations] of Object.entries(VOICE_COMMANDS)) {
      if (this.matchCommand(transcript, variations as string[])) {
        if (this.commandCallback) {
          this.commandCallback(commandType);
          return; // Exit after first match
        }
      }
    }
  }

  // Match transcript against command variations
  private matchCommand(transcript: string, variations: string[]): boolean {
    const normalized = transcript.toLowerCase().trim();
    
    // Direct match
    if (variations.includes(normalized)) {
      return true;
    }
    
    // Partial match within transcript
    for (const variation of variations) {
      if (normalized.includes(variation)) {
        return true;
      }
    }
    
    return false;
  }

  // Start listening for commands
  public start(): boolean {
    if (!this.isInitialized && !this.initSpeechRecognition()) {
      return false;
    }
    
    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      if (this.errorCallback) {
        this.errorCallback(`Failed to start speech recognition: ${error}`);
      }
      return false;
    }
  }

  // Stop listening for commands
  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    this.isListening = false;
  }

  // Restart listening
  private restartListening(): void {
    if (!this.isListening) return;
    
    try {
      setTimeout(() => {
        if (this.isListening) {
          this.recognition.start();
        }
      }, 300);
    } catch (error) {
      console.error("Failed to restart speech recognition:", error);
    }
  }

  // Set callback for recognized commands
  public onCommand(callback: (command: string) => void): void {
    this.commandCallback = callback;
  }

  // Set callback for errors
  public onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }

  // Set callback for status updates
  public onStatus(callback: (status: string) => void): void {
    this.statusCallback = callback;
  }
  
  // Check if the recognition is currently active
  public isActive(): boolean {
    return this.isListening;
  }
  
  // Check if speech recognition is supported
  public static isSupported(): boolean {
    const windowWithSpeech = window as IWindow;
    return !!(
      windowWithSpeech.SpeechRecognition || 
      windowWithSpeech.webkitSpeechRecognition ||
      windowWithSpeech.mozSpeechRecognition ||
      windowWithSpeech.msSpeechRecognition
    );
  }
}
