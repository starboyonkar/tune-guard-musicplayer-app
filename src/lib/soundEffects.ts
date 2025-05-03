
// Sound effects utility for app interaction feedback

class SoundEffects {
  private static instance: SoundEffects;
  private notificationSound: HTMLAudioElement;
  private touchSound: HTMLAudioElement;
  private initialized: boolean = false;

  private constructor() {
    this.notificationSound = new Audio('https://www.zedge.net/ringtone/13202c7e-4f9a-47ae-8e25-b13eaaacf490');
    this.touchSound = new Audio('/sounds/touch-feedback.mp3');
    
    // Preload sounds
    this.notificationSound.load();
    this.touchSound.load();
  }

  static getInstance(): SoundEffects {
    if (!SoundEffects.instance) {
      SoundEffects.instance = new SoundEffects();
    }
    return SoundEffects.instance;
  }

  initialize() {
    if (!this.initialized) {
      // Create dummy user interaction to allow audio to play later
      document.addEventListener('click', () => {
        if (!this.initialized) {
          this.initialized = true;
          // Play and immediately pause to initialize audio context
          const silentPlay = () => {
            this.notificationSound.volume = 0;
            this.notificationSound.play().catch(() => {});
            setTimeout(() => this.notificationSound.pause(), 1);
          };
          silentPlay();
        }
      }, { once: true });
    }
  }

  playNotification() {
    if (this.initialized) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.volume = 1;
      this.notificationSound.play().catch(err => console.error("Error playing notification sound:", err));
    }
  }

  playTouchFeedback() {
    if (this.initialized) {
      this.touchSound.currentTime = 0;
      this.touchSound.volume = 0.5;
      this.touchSound.play().catch(err => console.error("Error playing touch sound:", err));
    }
  }
}

export const soundEffects = SoundEffects.getInstance();
