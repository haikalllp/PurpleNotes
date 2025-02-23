/**
 * Represents a note in the application
 */
import StorageService from '../../react/services/StorageService.js';

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
        // Create new instance with updated pin state
        const updatedNote = { ...this, pinned: !this.pinned };
        Object.setPrototypeOf(updatedNote, Note.prototype);
        
        // Update all properties on this instance
        Object.assign(this, updatedNote);
        
        // Save changes
        Note.save();
    }

    /**
     * Mark the note as notified
     */
    markNotified() {
        this.notified = true;
        const notes = Note.getAll();
        const noteIndex = notes.findIndex(n => n.id === this.id);
        if (noteIndex !== -1) {
            notes[noteIndex] = this;
            Note.save(notes);
        }
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
            // Create a minimal note instance first
            const note = new Note({
                title: data.title,
                content: data.content,
                reminder: data.reminder,
                pinned: data.pinned
            });
            
            // Explicitly preserve specific properties
            note.id = data.id;
            note.created = data.created;
            note.notified = !!data.notified; // Ensure boolean type
            
            return note;
        });
    }

    /**
     * Save all notes
     * @param {Array<Note>} notes - Array of notes to save
     */
    static save(notes = Note.getAll()) {
        // Ensure all notes have proper prototype chain before saving
        const processedNotes = notes.map(note => {
            if (!(note instanceof Note)) {
                const preservedNote = { ...note };
                Object.setPrototypeOf(preservedNote, Note.prototype);
                return preservedNote;
            }
            return note;
        });
        StorageService.saveNotes(processedNotes);
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
        // Create a shallow copy to avoid modifying the original array
        const sortedNotes = notes.map(note => {
            // Preserve all properties when creating array copy
            const preservedNote = { ...note };
            // Ensure prototype methods are available
            Object.setPrototypeOf(preservedNote, Note.prototype);
            return preservedNote;
        });
        
        return sortedNotes.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.created - a.created;
        });
    }
}