/**
 * Purple Notes - Main Application Entry Point
 */
import { ThemeUtils } from './src/utils/ThemeUtils.js';
import { NoteList } from './src/components/notes/NoteList.js';
import { NoteForm } from './src/components/notes/NoteForm.js';
import { TaskList } from './src/components/tasks/TaskList.js';
import { TaskForm } from './src/components/tasks/TaskForm.js';
import StorageService from './src/services/StorageService.js';
import AudioService from './src/services/AudioService.js';
import NotificationService from './src/services/NotificationService.js';

class PurpleNotesApp {
    constructor() {
        this.noteList = null;
        this.noteForm = null;
        this.taskList = null;
        this.taskForm = null;
        this.initialize();
        this.setupErrorHandling();
        this.setupCleanup();
    }

    /**
     * Initialize application components
     */
    initialize() {
        try {
            // Ensure localStorage is available
            if (!StorageService.isAvailable()) {
                console.error('LocalStorage is not available');
                this.showStorageError();
                return;
            }

            // Initialize theme
            ThemeUtils.initialize();

            // Initialize components when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Initialize application components
     * @private
     */
    initializeComponents() {
        try {
            // Initialize Notes section
            this.noteList = new NoteList({
                containerId: 'notesContainer'
            });

            this.noteForm = new NoteForm({
                onSubmit: (note) => this.handleNoteSubmit(note)
            });

            // Initialize Tasks section
            this.taskList = new TaskList({
                containerId: 'taskList'
            });

            this.taskForm = new TaskForm({
                onSubmit: (task) => this.handleTaskSubmit(task)
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing components:', error);
            this.showError('Failed to initialize components');
        }
    }

    /**
     * Handle note submission
     * @private
     * @param {Note} note
     */
    handleNoteSubmit(note) {
        try {
            this.noteList.addNote(note);
        } catch (error) {
            console.error('Error adding note:', error);
            this.showError('Failed to add note');
        }
    }

    /**
     * Handle task submission
     * @private
     * @param {Task} task
     */
    handleTaskSubmit(task) {
        try {
            this.taskList.addTask(task);
        } catch (error) {
            console.error('Error adding task:', error);
            this.showError('Failed to add task');
        }
    }

    /**
     * Set up global event listeners
     * @private
     */
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                try {
                    ThemeUtils.toggleTheme();
                } catch (error) {
                    console.error('Error toggling theme:', error);
                }
            });
        }

        // Clear cache button
        const clearCacheBtn = document.querySelector('.clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.handleClearCache());
        }

        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause any active sounds when tab is hidden
                AudioService.stopAllEffects();
            }
        });
    }

    /**
     * Set up error handling
     * @private
     */
    setupErrorHandling() {
        window.onerror = (message, source, line, column, error) => {
            console.error('Global error:', { message, source, line, column, error });
            this.showError('An unexpected error occurred');
        };

        window.onunhandledrejection = (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showError('An unexpected error occurred');
        };
    }

    /**
     * Set up cleanup handlers
     * @private
     */
    setupCleanup() {
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Clean up resources
     * @private
     */
    cleanup() {
        if (this.noteList) this.noteList.destroy?.();
        if (this.taskList) this.taskList.destroy?.();
        AudioService.stopAllEffects();
        NotificationService.dismissAll();
    }

    /**
     * Handle keyboard shortcuts
     * @private
     * @param {KeyboardEvent} e
     */
    handleKeyboardShortcuts(e) {
        try {
            // Ctrl/Cmd + N: Focus note form
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                document.getElementById('noteTitle')?.focus();
            }
            
            // Ctrl/Cmd + T: Focus task form
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                document.getElementById('taskInput')?.focus();
            }
        } catch (error) {
            console.error('Error handling keyboard shortcut:', error);
        }
    }

    /**
     * Handle clear cache action
     * @private
     */
    async handleClearCache() {
        try {
            const result = await this.showConfirmation(
                'Are you sure you want to clear all app data? This will remove all notes and tasks.'
            );

            if (result) {
                StorageService.clearAll();
                location.reload();
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            this.showError('Failed to clear application data');
        }
    }

    /**
     * Show confirmation dialog
     * @private
     * @param {string} message - Confirmation message
     * @returns {Promise<boolean>}
     */
    showConfirmation(message) {
        return new Promise(resolve => {
            const confirmed = confirm(message);
            resolve(confirmed);
        });
    }

    /**
     * Show error message
     * @private
     * @param {string} message - Error message
     */
    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerHTML = `
            <div class="error-content">
                <h2>Error</h2>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(error);
    }

    /**
     * Show storage error message
     * @private
     */
    showStorageError() {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerHTML = `
            <div class="error-content">
                <h2>Storage Error</h2>
                <p>Local storage is not available. Please ensure:</p>
                <ul>
                    <li>You're not in private/incognito mode</li>
                    <li>Local storage is not disabled in your browser</li>
                    <li>You have sufficient storage space available</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(error);
    }
}

// Initialize application
new PurpleNotesApp();
