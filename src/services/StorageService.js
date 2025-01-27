/**
 * Manages all localStorage operations for the application
 */
import { STORAGE_KEYS } from '../config.js';

class StorageService {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     * @throws {Error} If storage operation fails
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            throw new Error(`Failed to save ${key} to storage`);
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed data or default value
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Save notes to localStorage
     * @param {Array} notes - Array of note objects
     */
    saveNotes(notes) {
        this.save(STORAGE_KEYS.notes, notes);
    }

    /**
     * Load notes from localStorage
     * @returns {Array} Array of note objects
     */
    loadNotes() {
        return this.load(STORAGE_KEYS.notes, []);
    }

    /**
     * Save tasks to localStorage
     * @param {Array} tasks - Array of task objects
     */
    saveTasks(tasks) {
        this.save(STORAGE_KEYS.tasks, tasks);
    }

    /**
     * Load tasks from localStorage
     * @returns {Array} Array of task objects
     */
    loadTasks() {
        return this.load(STORAGE_KEYS.tasks, []);
    }

    /**
     * Save theme preference
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        this.save(STORAGE_KEYS.theme, theme);
    }

    /**
     * Load theme preference
     * @param {string} defaultTheme - Default theme if none stored
     * @returns {string} Theme name
     */
    loadTheme(defaultTheme = 'light') {
        return this.load(STORAGE_KEYS.theme, defaultTheme);
    }

    /**
     * Clear all application data from localStorage
     */
    clearAll() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw new Error('Failed to clear storage');
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Export singleton instance
export default new StorageService();