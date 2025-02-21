/**
 * Manages all audio playback in the application
 */
import { AUDIO_CONFIG } from '../config.js';

class AudioService {
    constructor() {
        this.audioElements = {};
        this.initializeAudio();
    }

    /**
     * Initialize audio elements with configurations
     * @private
     */
    initializeAudio() {
        Object.entries(AUDIO_CONFIG).forEach(([key, config]) => {
            const audio = new Audio(config.src);
            if (config.loop) audio.loop = true;
            this.audioElements[key] = audio;
        });
    }

    /**
     * Play an audio effect with specified configurations
     * @param {string} effectName - Name of the effect to play
     * @returns {Promise} - Resolves when audio starts playing
     */
    async playEffect(effectName) {
        const audio = this.audioElements[effectName];
        const config = AUDIO_CONFIG[effectName];

        if (!audio) {
            console.error(`Audio effect ${effectName} not found`);
            return;
        }

        try {
            if (config.currentTime !== undefined) {
                audio.currentTime = config.currentTime;
            }
            if (config.volume !== undefined) {
                audio.volume = config.volume;
            }
            await audio.play();
        } catch (error) {
            console.error(`Error playing ${effectName} sound:`, error);
        }
    }

    /**
     * Stop a currently playing audio effect
     * @param {string} effectName - Name of the effect to stop
     */
    stopEffect(effectName) {
        const audio = this.audioElements[effectName];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    /**
     * Stop all currently playing audio effects
     */
    stopAllEffects() {
        Object.values(this.audioElements).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }
}

// Export singleton instance
export default new AudioService();