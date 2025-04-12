
export * from './audioProvider';
export * from './audioTypes';
export * from './useAudio';
export * from './audioUtils';

// Re-export the useAudioContext as useAudio for backward compatibility
export { useAudioContext as useAudio } from './audioProvider';
