/**
 * Manages all localStorage operations for the application
 */
import { STORAGE_KEYS } from '../config.js';

class StorageService {
    constructor() {
        // Initialize storage
        this.initialize();
    }

    /**
     * Initialize storage checks
     */
    initialize() {
        // Ensure storage is available
        if (!this.isAvailable()) {
            throw new Error('LocalStorage is not available');
        }

        // Initialize with empty arrays if not exists
        if (!this.loadNotes()) {
            this.saveNotes([]);
        }
        if (!this.loadTasks()) {
            this.saveTasks([]);
        }
    }

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     * @throws {Error} If storage operation fails
     */
    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
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
        if (!Array.isArray(notes)) {
            throw new Error('Notes must be an array');
        }
        this.save(STORAGE_KEYS.notes, notes);
    }

    /**
     * Load notes from localStorage
     * @returns {Array} Array of note objects
     */
    loadNotes() {
        const notes = this.load(STORAGE_KEYS.notes, []);
        return Array.isArray(notes) ? notes : [];
    }

    /**
     * Save tasks to localStorage
     * @param {Array} tasks - Array of task objects
     */
    saveTasks(tasks) {
        if (!Array.isArray(tasks)) {
            throw new Error('Tasks must be an array');
        }
        this.save(STORAGE_KEYS.tasks, tasks);
    }

    /**
     * Load tasks from localStorage
     * @returns {Array} Array of task objects
     */
    loadTasks() {
        const tasks = this.load(STORAGE_KEYS.tasks, []);
        return Array.isArray(tasks) ? tasks : [];
    }

    /**
     * Save theme preference
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        if (typeof theme !== 'string') {
            throw new Error('Theme must be a string');
        }
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
            // Only clear our app's keys
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });

            // Reinitialize storage
            this.initialize();
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
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        const notes = this.loadNotes();
        const tasks = this.loadTasks();

        return {
            notesCount: notes.length,
            tasksCount: tasks.length,
            storageUsed: this.calculateStorageSize(),
            maxStorage: 5 * 1024 * 1024 // 5MB localStorage limit
        };
    }

    /**
     * Calculate current storage size
     * @private
     * @returns {number} Size in bytes
     */
    calculateStorageSize() {
        let total = 0;
        Object.values(STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                total += (key.length + item.length) * 2; // UTF-16 uses 2 bytes per character
            }
        });
        return total;
    }
}

// Export singleton instance
export default new StorageService();