
// Frequency ranges typical for ambulance sirens (in Hz)
// Most sirens oscillate between 600-1000Hz and can have harmonics up to 2000-3000Hz
const SIREN_FREQUENCY_RANGES = [
  { min: 600, max: 1000, weight: 1.0 },  // Primary siren frequency
  { min: 1000, max: 1500, weight: 0.8 }, // First harmonic
  { min: 1500, max: 2500, weight: 0.5 }  // Second harmonic
];

// How many consecutive frames we need to detect a siren - reduced for faster detection
const DETECTION_THRESHOLD_FRAMES = 5; // Changed from 8 to 5 for faster response
// How many consecutive quiet frames before we consider the siren gone
const SILENCE_THRESHOLD_FRAMES = 10; // Reduced from 15 to 10 for quicker resumption

/**
 * Analyzes frequency data to detect patterns typical of ambulance sirens
 */
export const analyzeSirenPattern = (
  frequencyData: Uint8Array, 
  sampleRate: number, 
  sensitivity: number = 0.7 // Increased default sensitivity
): number => {
  const binSize = sampleRate / frequencyData.length;
  let sirenConfidence = 0;
  
  // Calculate the energy in the siren frequency range
  SIREN_FREQUENCY_RANGES.forEach(range => {
    const startBin = Math.floor(range.min / binSize);
    const endBin = Math.ceil(range.max / binSize);
    
    let rangeEnergy = 0;
    let peakCount = 0;
    let lastValue = 0;
    let increasing = false;
    
    // Enhanced pattern detection
    let peaks: number[] = [];
    let valleys: number[] = [];
    
    // Look for the distinctive oscillating pattern in this range
    for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
      const value = frequencyData[i];
      rangeEnergy += value;
      
      // Improved peak detection with tracking
      if (increasing && value < lastValue && lastValue > 140) { // Lower threshold for detection
        peakCount++;
        peaks.push(lastValue);
      } else if (!increasing && value > lastValue && lastValue < 60) {
        valleys.push(lastValue);
      }
      
      increasing = value > lastValue;
      lastValue = value;
    }
    
    // Normalize energy by the number of bins we examined
    const avgEnergy = rangeEnergy / (endBin - startBin);
    
    // Weight the contribution of this frequency range
    sirenConfidence += (avgEnergy / 256) * range.weight;
    
    // Enhanced pattern analysis
    if (peaks.length >= 2 && valleys.length >= 1) {
      // Check for oscillating pattern
      const peakAvg = peaks.reduce((sum, val) => sum + val, 0) / peaks.length;
      const valleyAvg = valleys.reduce((sum, val) => sum + val, 0) / valleys.length;
      const peakToPeak = peakAvg - valleyAvg;
      
      if (peakToPeak > 70) { // Significant oscillation
        sirenConfidence += 0.15 * peakCount * range.weight;
      }
    }
    
    // Add additional confidence if we detected the oscillating pattern
    if (peakCount > 1) {
      sirenConfidence += 0.1 * peakCount * range.weight;
    }
  });
  
  // Apply sensitivity factor (higher sensitivity = easier to trigger)
  return sirenConfidence * sensitivity;
}

/**
 * Siren detector that tracks state over time
 */
export class SirenDetector {
  private consecutiveDetections: number = 0;
  private consecutiveSilence: number = 0;
  private sirenDetected: boolean = false;
  private onSirenDetected: () => void;
  private onSirenGone: () => void;
  public sensitivity: number = 0.7; // Increased default sensitivity
  private confidenceHistory: number[] = []; // Keep track of recent confidence values
  
  constructor(
    onSirenDetected: () => void,
    onSirenGone: () => void,
    sensitivity?: number
  ) {
    this.onSirenDetected = onSirenDetected;
    this.onSirenGone = onSirenGone;
    if (sensitivity !== undefined) this.sensitivity = sensitivity;
  }
  
  /**
   * Process new audio data to detect sirens
   */
  public processAudioFrame(frequencyData: Uint8Array, sampleRate: number): boolean {
    const confidence = analyzeSirenPattern(frequencyData, sampleRate, this.sensitivity);
    
    // Track confidence history for better decision making
    this.confidenceHistory.push(confidence);
    if (this.confidenceHistory.length > 10) {
      this.confidenceHistory.shift();
    }
    
    // Calculate average confidence over recent frames
    const avgConfidence = this.confidenceHistory.reduce((sum, val) => sum + val, 0) / 
                        this.confidenceHistory.length;
    
    // Check if we likely have a siren (confidence above threshold)
    if (avgConfidence > 0.28) { // Lowered threshold for quicker detection
      this.consecutiveDetections++;
      this.consecutiveSilence = 0;
      
      // If we have enough consecutive detections and haven't already triggered
      if (this.consecutiveDetections >= DETECTION_THRESHOLD_FRAMES && !this.sirenDetected) {
        this.sirenDetected = true;
        this.onSirenDetected();
      }
    } else {
      // No siren detected in this frame
      this.consecutiveDetections = Math.max(0, this.consecutiveDetections - 1); // Gradual decrease
      
      if (this.sirenDetected) {
        this.consecutiveSilence++;
        
        // If silence has persisted, consider the siren gone
        if (this.consecutiveSilence >= SILENCE_THRESHOLD_FRAMES) {
          this.sirenDetected = false;
          this.onSirenGone();
        }
      }
    }
    
    return this.sirenDetected;
  }
  
  /**
   * Resets the detector state
   */
  public reset(): void {
    this.consecutiveDetections = 0;
    this.consecutiveSilence = 0;
    this.sirenDetected = false;
    this.confidenceHistory = [];
  }
}
