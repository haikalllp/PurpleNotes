/**
 * Theme management utilities
 */
import { THEMES } from '../config.js';
import StorageService from '../services/StorageService.js';
import AudioService from '../services/AudioService.js';

export const ThemeUtils = {
    /**
     * Current theme
     * @type {string}
     */
    currentTheme: THEMES.light,

    /**
     * Initialize theme from storage
     */
    initialize() {
        const savedTheme = StorageService.loadTheme();
        this.setTheme(savedTheme);
    },

    /**
     * Get current theme
     * @returns {string} Current theme name
     */
    getCurrentTheme() {
        return this.currentTheme;
    },

    /**
     * Set theme
     * @param {string} theme - Theme to set
     */
    setTheme(theme) {
        if (!THEMES[theme]) {
            console.warn(`Invalid theme: ${theme}`);
            theme = THEMES.light;
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        StorageService.saveTheme(theme);
    },

    /**
     * Toggle between light and dark themes
     * @returns {Promise<void>}
     */
    async toggleTheme() {
        const newTheme = this.currentTheme === THEMES.light ? THEMES.dark : THEMES.light;
        
        // Play appropriate sound effect
        const soundEffect = newTheme === THEMES.dark ? 'switchOff' : 'switchOn';
        await AudioService.playEffect(soundEffect);
        
        // Update theme after sound starts
        setTimeout(() => {
            this.setTheme(newTheme);
        }, 130);
    },

    /**
     * Check if current theme is dark
     * @returns {boolean} True if dark theme is active
     */
    isDarkTheme() {
        return this.currentTheme === THEMES.dark;
    },

    /**
     * Apply theme-specific styles to element
     * @param {HTMLElement} element - Element to style
     * @param {Object} styles - Styles to apply for each theme
     * @param {Object} styles.light - Light theme styles
     * @param {Object} styles.dark - Dark theme styles
     */
    applyThemeStyles(element, styles) {
        const themeStyles = this.isDarkTheme() ? styles.dark : styles.light;
        Object.entries(themeStyles).forEach(([property, value]) => {
            element.style[property] = value;
        });
    }
};