/**
 * Manages all localStorage operations for the application with support for
 * cross-tab synchronization and atomic operations
 */
import { STORAGE_KEYS } from '../../config.js';

class StorageService {
    constructor() {
        // Initialize storage
        this.initialize();
        // Set up storage event listener for cross-tab sync
        this.setupStorageEventListener();
        // Lock state for atomic operations
        this.locks = new Map();
    }

    /**
     * Initialize storage checks and setup
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
     * Set up storage event listener for cross-tab synchronization
     * @private
     */
    setupStorageEventListener() {
        window.addEventListener('storage', (event) => {
            // Handle changes from other tabs
            if (Object.values(STORAGE_KEYS).includes(event.key)) {
                // Dispatch custom event for component updates
                const customEvent = new CustomEvent('storage-update', {
                    detail: {
                        key: event.key,
                        newValue: event.newValue ? JSON.parse(event.newValue) : null
                    }
                });
                window.dispatchEvent(customEvent);
            }
        });
    }

    /**
     * Acquire a lock for atomic operations
     * @private
     * @param {string} key - Storage key to lock
     * @returns {Promise<boolean>} True if lock acquired
     */
    async acquireLock(key) {
        if (this.locks.get(key)) {
            return false;
        }
        this.locks.set(key, true);
        return true;
    }

    /**
     * Release a lock after atomic operation
     * @private
     * @param {string} key - Storage key to unlock
     */
    releaseLock(key) {
        this.locks.delete(key);
    }

    /**
     * Save data to localStorage with atomic operation support
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     * @throws {Error} If storage operation fails
     */
    async save(key, data) {
        try {
            // Wait for lock
            while (!(await this.acquireLock(key))) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);

            // Notify other components of the update
            window.dispatchEvent(new CustomEvent('storage-update', {
                detail: { key, newValue: data }
            }));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            throw new Error(`Failed to save ${key} to storage`);
        } finally {
            this.releaseLock(key);
        }
    }

    /**
     * Load data from localStorage with fallback
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
    async saveNotes(notes) {
        if (!Array.isArray(notes)) {
            throw new Error('Notes must be an array');
        }
        await this.save(STORAGE_KEYS.notes, notes);
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
     * Save tasks to localStorage with atomic operation support
     * @param {Array} tasks - Array of task objects
     */
    async saveTasks(tasks) {
        if (!Array.isArray(tasks)) {
            throw new Error('Tasks must be an array');
        }
        await this.save(STORAGE_KEYS.tasks, tasks);
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
     * Update specific task atomically
     * @param {number} taskId - Task ID to update
     * @param {Function} updateFn - Function that receives current task and returns updated task
     * @returns {Promise<void>}
     */
    async updateTask(taskId, updateFn) {
        const tasks = this.loadTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            const updatedTask = updateFn(tasks[taskIndex]);
            tasks[taskIndex] = updatedTask;
            await this.saveTasks(tasks);
        }
    }

    /**
     * Save theme preference
     * @param {string} theme - Theme name
     */
    async saveTheme(theme) {
        if (typeof theme !== 'string') {
            throw new Error('Theme must be a string');
        }
        await this.save(STORAGE_KEYS.theme, theme);
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
    async clearAll() {
        try {
            // Wait for all operations to complete
            const keys = Object.values(STORAGE_KEYS);
            for (const key of keys) {
                while (!(await this.acquireLock(key))) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            // Clear our app's keys
            keys.forEach(key => {
                localStorage.removeItem(key);
            });

            // Release all locks
            keys.forEach(key => this.releaseLock(key));

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