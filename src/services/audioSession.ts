import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Platform } from 'react-native';

/**
 * Audio Session Service
 * 
 * Configures the app's audio session for:
 * - Background playback
 * - Lock screen controls
 * - Audio interruption handling
 */

export interface AudioSessionConfig {
    allowsRecording?: boolean;
    playsInSilentMode?: boolean;
    staysActiveInBackground?: boolean;
}

/**
 * Configure audio session for optimal playback
 * Should be called once at app startup
 */
export async function configureAudioSession(
    config: AudioSessionConfig = {}
): Promise<boolean> {
    const {
        allowsRecording = false,
        playsInSilentMode = true,
        staysActiveInBackground = true,
    } = config;

    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: allowsRecording,
            playsInSilentModeIOS: playsInSilentMode,
            staysActiveInBackground: staysActiveInBackground,
            interruptionModeIOS: InterruptionModeIOS.DuckOthers,
            interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        console.warn('[AudioSession] Configured for background playback');
        return true;
    } catch (error) {
        console.error('[AudioSession] Failed to configure:', error);
        return false;
    }
}

/**
 * Reset audio session to defaults
 * Useful when entering a mode that doesn't need background audio
 */
export async function resetAudioSession(): Promise<boolean> {
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: false,
            staysActiveInBackground: false,
            interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
            interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        return true;
    } catch (error) {
        console.error('[AudioSession] Failed to reset:', error);
        return false;
    }
}

/**
 * Check if the platform supports background audio
 */
export function supportsBackgroundAudio(): boolean {
    // Web doesn't support true background audio the same way
    return Platform.OS !== 'web';
}

export default {
    configureAudioSession,
    resetAudioSession,
    supportsBackgroundAudio,
};
