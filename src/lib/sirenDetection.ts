
// Frequency ranges typical for ambulance sirens (in Hz)
// Most sirens oscillate between 600-1000Hz and can have harmonics up to 2000-3000Hz
const SIREN_FREQUENCY_RANGES = [
  { min: 600, max: 1000, weight: 1.0 },  // Primary siren frequency
  { min: 1000, max: 1500, weight: 0.8 }, // First harmonic
  { min: 1500, max: 2500, weight: 0.5 }  // Second harmonic
];

// How many consecutive frames we need to detect a siren
const DETECTION_THRESHOLD_FRAMES = 8;
// How many consecutive quiet frames before we consider the siren gone
const SILENCE_THRESHOLD_FRAMES = 15;

/**
 * Analyzes frequency data to detect patterns typical of ambulance sirens
 */
export const analyzeSirenPattern = (
  frequencyData: Uint8Array, 
  sampleRate: number, 
  sensitivity: number = 0.6
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
    
    // Look for the distinctive oscillating pattern in this range
    for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
      const value = frequencyData[i];
      rangeEnergy += value;
      
      // Detect peaks (typical of siren's oscillating pattern)
      if (increasing && value < lastValue && lastValue > 150) {
        peakCount++;
      }
      
      increasing = value > lastValue;
      lastValue = value;
    }
    
    // Normalize energy by the number of bins we examined
    const avgEnergy = rangeEnergy / (endBin - startBin);
    
    // Weight the contribution of this frequency range
    sirenConfidence += (avgEnergy / 256) * range.weight;
    
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
  public sensitivity: number = 0.6;
  
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
    
    // Check if we likely have a siren (confidence above threshold)
    if (confidence > 0.3) {
      this.consecutiveDetections++;
      this.consecutiveSilence = 0;
      
      // If we have enough consecutive detections and haven't already triggered
      if (this.consecutiveDetections >= DETECTION_THRESHOLD_FRAMES && !this.sirenDetected) {
        this.sirenDetected = true;
        this.onSirenDetected();
      }
    } else {
      // No siren detected in this frame
      this.consecutiveDetections = 0;
      
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
  }
}
