
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

// Voice recognition service for capturing speech
export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private continuousMode: boolean = true;
  
  constructor() {
    this.initializeRecognition();
  }
  
  private initializeRecognition() {
    try {
      // Browser compatibility handling
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = this.continuousMode;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        // Set up event listeners
        this.recognition.onresult = this.handleRecognitionResult.bind(this);
        this.recognition.onend = this.handleRecognitionEnd.bind(this);
        this.recognition.onerror = this.handleRecognitionError.bind(this);
        
        console.log('Speech recognition initialized successfully');
      } else {
        console.error('Speech recognition not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }
  }
  
  private handleRecognitionResult(event: SpeechRecognitionEvent) {
    const result = event.results[event.results.length - 1];
    if (result.isFinal) {
      const transcript = result[0].transcript.trim();
      console.log('Voice command recognized:', transcript);
      
      if (this.onResultCallback && transcript) {
        this.onResultCallback(transcript);
      }
    }
  }
  
  private handleRecognitionEnd() {
    console.log('Speech recognition ended');
    // Restart if in continuous mode and still listening
    if (this.isListening && this.continuousMode) {
      try {
        this.recognition?.start();
      } catch (e) {
        console.error('Error restarting speech recognition:', e);
        this.isListening = false;
      }
    }
  }
  
  private handleRecognitionError(event: SpeechRecognitionErrorEvent) {
    console.error('Speech recognition error:', event.error);
    this.isListening = false;
  }
  
  public start(callback: (text: string) => void) {
    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      return false;
    }
    
    if (this.isListening) {
      return true; // Already listening
    }
    
    try {
      this.onResultCallback = callback;
      this.recognition.start();
      this.isListening = true;
      console.log('Speech recognition started');
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.isListening = false;
      return false;
    }
  }
  
  public stop() {
    if (!this.recognition || !this.isListening) {
      return;
    }
    
    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('Speech recognition stopped');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
  
  public isActive(): boolean {
    return this.isListening;
  }
  
  public setContinuousMode(continuous: boolean) {
    this.continuousMode = continuous;
    if (this.recognition) {
      this.recognition.continuous = continuous;
    }
  }
}

// Add declaration for Web Speech API since TypeScript doesn't include it by default
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
