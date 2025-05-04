
class SoundEffects {
  private touchSound: HTMLAudioElement | null = null;
  private notificationSound: HTMLAudioElement | null = null;
  private errorSound: HTMLAudioElement | null = null;
  private successSound: HTMLAudioElement | null = null;
  private activationSound: HTMLAudioElement | null = null;
  private deactivationSound: HTMLAudioElement | null = null;
  private commandRecognizedSound: HTMLAudioElement | null = null;

  initialize() {
    // Only initialize if audio is supported
    if (typeof Audio === 'undefined') return;

    // Initialize on user interaction to avoid autoplay restrictions
    this.touchSound = new Audio('/audio/touch.mp3');
    this.notificationSound = new Audio('/audio/notification.mp3');
    this.errorSound = new Audio('/audio/error.mp3');
    this.successSound = new Audio('/audio/success.mp3');
    this.activationSound = new Audio('/audio/activation.mp3');
    this.deactivationSound = new Audio('/audio/deactivation.mp3');
    this.commandRecognizedSound = new Audio('/audio/command-recognized.mp3');

    // Preload sounds
    this.touchSound.preload = 'auto';
    this.notificationSound.preload = 'auto';
    this.errorSound.preload = 'auto';
    this.successSound.preload = 'auto';
    this.activationSound.preload = 'auto';
    this.deactivationSound.preload = 'auto';
    this.commandRecognizedSound.preload = 'auto';
  }

  playTouchFeedback() {
    this.playSafely(this.touchSound);
  }

  playNotification() {
    this.playSafely(this.notificationSound);
  }

  playError() {
    this.playSafely(this.errorSound);
  }

  playSuccess() {
    this.playSafely(this.successSound);
  }
  
  playActivation() {
    this.playSafely(this.activationSound || this.successSound);
  }
  
  playDeactivation() {
    this.playSafely(this.deactivationSound || this.notificationSound);
  }
  
  playCommandRecognized() {
    this.playSafely(this.commandRecognizedSound || this.successSound);
  }

  private playSafely(audio: HTMLAudioElement | null) {
    if (!audio) return;

    try {
      // Reset the playback position and play
      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise) {
        playPromise.catch(error => {
          console.error(`Error playing ${audio.src ? audio.src.split('/').pop() : 'sound'}: `, error);
        });
      }
    } catch (error) {
      console.error(`Error playing ${audio.src ? audio.src.split('/').pop() : 'sound'}: `, error);
    }
  }
}

export const soundEffects = new SoundEffects();
