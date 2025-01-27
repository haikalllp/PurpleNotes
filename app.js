/**
 * Purple Notes - Main Application Entry Point
 */
import { ThemeUtils } from './src/utils/ThemeUtils.js';
import { NoteList } from './src/components/notes/NoteList.js';
import { NoteForm } from './src/components/notes/NoteForm.js';
import { TaskList } from './src/components/tasks/TaskList.js';
import { TaskForm } from './src/components/tasks/TaskForm.js';
import StorageService from './src/services/StorageService.js';

class PurpleNotesApp {
    constructor() {
        this.noteList = null;
        this.noteForm = null;
        this.taskList = null;
        this.taskForm = null;
        this.initialize();
    }

    /**
     * Initialize application components
     */
    initialize() {
        // Ensure localStorage is available
        if (!StorageService.isAvailable()) {
            console.error('LocalStorage is not available');
            this.showStorageError();
            return;
        }

        // Initialize theme
        ThemeUtils.initialize();

        // Initialize components when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeComponents();
            this.setupEventListeners();
        });
    }

    /**
     * Initialize application components
     * @private
     */
    initializeComponents() {
        // Initialize Notes section
        this.noteList = new NoteList({
            containerId: 'notesContainer'
        });

        this.noteForm = new NoteForm({
            onSubmit: (note) => this.noteList.addNote(note)
        });

        // Initialize Tasks section
        this.taskList = new TaskList({
            containerId: 'taskList'
        });

        this.taskForm = new TaskForm({
            onSubmit: (task) => this.taskList.addTask(task)
        });
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
                ThemeUtils.toggleTheme();
            });
        }

        // Clear cache button
        const clearCacheBtn = document.querySelector('.clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.handleClearCache());
        }

        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    /**
     * Handle keyboard shortcuts
     * @private
     * @param {KeyboardEvent} e
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: Focus note form
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('noteTitle').focus();
        }
        
        // Ctrl/Cmd + T: Focus task form
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            document.getElementById('taskInput').focus();
        }
    }

    /**
     * Handle clear cache action
     * @private
     */
    async handleClearCache() {
        const result = await this.showConfirmation(
            'Are you sure you want to clear all app data? This will remove all notes and tasks.'
        );

        if (result) {
            StorageService.clearAll();
            location.reload();
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
            </div>
        `;
        document.body.appendChild(error);
    }
}

// Initialize application
new PurpleNotesApp();
