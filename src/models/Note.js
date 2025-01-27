/**
 * Represents a note in the application
 */
import StorageService from '../services/StorageService.js';

export class Note {
    /**
     * Create a new note
     * @param {Object} data - Note data
     * @param {string} data.title - Note title
     * @param {string} data.content - Note content
     * @param {number} [data.reminder] - Optional reminder timestamp
     * @param {boolean} [data.pinned=false] - Whether note is pinned
     */
    constructor({ title, content, reminder = null, pinned = false }) {
        this.id = Date.now();
        this.title = title;
        this.content = content;
        this.reminder = reminder;
        this.created = Date.now();
        this.notified = false;
        this.pinned = pinned;
    }

    /**
     * Toggle the pinned state of the note
     */
    togglePin() {
        this.pinned = !this.pinned;
        Note.save();
    }

    /**
     * Mark the note as notified
     */
    markNotified() {
        this.notified = true;
        Note.save();
    }

    /**
     * Calculate reminder progress percentage
     * @returns {number} Progress percentage (0-100)
     */
    calculateProgress() {
        if (!this.reminder) return 0;
        
        const now = Date.now();
        const totalTime = this.reminder - this.created;
        const elapsedTime = now - this.created;
        return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
    }

    /**
     * Get remaining time until reminder
     * @returns {Object} Object containing hours and minutes left
     */
    getRemainingTime() {
        if (!this.reminder) return { hours: 0, minutes: 0 };
        
        const timeLeft = this.reminder - Date.now();
        return {
            hours: Math.floor(timeLeft / (1000 * 60 * 60)),
            minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
        };
    }

    /**
     * Check if reminder is complete
     * @returns {boolean} True if reminder time has passed
     */
    isReminderComplete() {
        return this.reminder && Date.now() >= this.reminder;
    }

    // Static methods for managing notes collection

    /**
     * Get all notes
     * @returns {Array<Note>} Array of notes
     */
    static getAll() {
        return StorageService.loadNotes().map(data => {
            const note = new Note(data);
            Object.assign(note, data);
            return note;
        });
    }

    /**
     * Save all notes
     * @param {Array<Note>} notes - Array of notes to save
     */
    static save(notes = Note.getAll()) {
        StorageService.saveNotes(notes);
    }

    /**
     * Add a new note
     * @param {Note} note - Note to add
     */
    static add(note) {
        const notes = Note.getAll();
        notes.push(note);
        Note.save(notes);
    }

    /**
     * Delete a note
     * @param {number} id - ID of note to delete
     */
    static delete(id) {
        const notes = Note.getAll().filter(note => note.id !== id);
        Note.save(notes);
    }

    /**
     * Sort notes by pinned status and creation date
     * @param {Array<Note>} notes - Notes to sort
     * @returns {Array<Note>} Sorted notes
     */
    static sort(notes) {
        return [...notes].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.created - a.created;
        });
    }
}