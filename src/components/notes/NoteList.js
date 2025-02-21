/**
 * Manages the collection and display of notes
 */
import { Note } from '../../models/Note.js';
import { NoteCard } from './NoteCard.js';
import { DOMUtils } from '../../utils/DOMUtils.js';
import AudioService from '../../services/AudioService.js';
import NotificationService from '../../services/NotificationService.js';

export class NoteList {
    /**
     * @param {Object} options
     * @param {string} options.containerId - ID of container element
     */
    constructor({ containerId }) {
        this.container = DOMUtils.getElement(containerId);
        this.notes = [];
        this.noteCards = new Map(); // Map of note ID to NoteCard instance
        this.reminderCheckInterval = null;
        this.clearButtonListener = null;
        this.initialize();
    }

    /**
     * Initialize note list
     */
    initialize() {
        // Show loading state
        this.showLoadingState();
        
        // Load notes with a small delay to show loading state
        setTimeout(() => {
            this.loadNotes();
            this.setupReminderCheck();
            this.setupClearAllButton();
        }, 100);
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <span>Loading notes...</span>
            </div>
        `;
    }

    /**
     * Load notes from storage and display them
     */
    loadNotes() {
        this.notes = Note.getAll();
        this.displayNotes();
    }

    /**
     * Display all notes
     */
    displayNotes() {
        // Clear the container first
        this.container.innerHTML = '';

        // If no notes, show empty state
        if (this.notes.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>No notes yet. Create your first note!</p>
                </div>
            `;
            return;
        }
        
        // Sort notes: pinned first, then by creation date
        const sortedNotes = Note.sort(this.notes);
        
        // Clear old note card references
        this.noteCards.clear();
        
        // Create and display note cards
        sortedNotes.forEach(note => {
            const noteCard = new NoteCard({
                note,
                onDelete: () => this.handleNoteDelete(note),
                onPin: () => this.handleNotePin(note)
            });
            
            this.noteCards.set(note.id, noteCard);
            this.container.appendChild(noteCard.element);
        });
    }

    /**
     * Add a new note
     * @param {Note} note - Note to add
     */
    addNote(note) {
        this.notes.push(note);
        Note.save(this.notes);
        this.displayNotes();
    }

    /**
     * Handle note deletion
     * @param {Note} note - Note being deleted
     */
    handleNoteDelete(note) {
        this.notes = this.notes.filter(n => n.id !== note.id);
        this.noteCards.delete(note.id);
        Note.save(this.notes);
        this.displayNotes(); // Refresh display
    }

    /**
     * Handle note pin/unpin
     * @param {Note} note - Note being pinned/unpinned
     */
    handleNotePin(note) {
        // Find and update the note in our array
        const noteIndex = this.notes.findIndex(n => n.id === note.id);
        if (noteIndex !== -1) {
            // Create a new Note instance with updated properties
            const updatedNote = { ...this.notes[noteIndex], pinned: !this.notes[noteIndex].pinned };
            Object.setPrototypeOf(updatedNote, Note.prototype);
            this.notes[noteIndex] = updatedNote;
            
            // Save and refresh display
            Note.save(this.notes);
            this.displayNotes(); // Refresh to maintain sort order
        }
    }

    /**
     * Set up periodic reminder checks
     */
    setupReminderCheck() {
        // Clear any existing interval
        if (this.reminderCheckInterval) {
            clearInterval(this.reminderCheckInterval);
        }

        this.reminderCheckInterval = setInterval(() => {
            this.notes.forEach(note => {
                if (NotificationService.shouldNotify(note)) {
                    NotificationService.showNotification(note);
                }
            });
            
            // Update progress bars
            this.noteCards.forEach(noteCard => {
                noteCard.updateProgress();
            });
        }, 1000);
    }

    /**
     * Set up clear all button functionality
     */
    setupClearAllButton() {
        const clearButton = document.querySelector('.notes-section .clear-btn');
        if (clearButton) {
            // Remove existing listener if any
            if (this.clearButtonListener) {
                clearButton.removeEventListener('click', this.clearButtonListener);
            }

            this.clearButtonListener = async () => {
                try {
                    const result = await DOMUtils.showConfirmation({
                        message: 'Are you sure you want to delete all notes?',
                        subtext: 'Pinned notes will be unpinned and deleted as well.'
                    });

                    if (result) {
                        await AudioService.playEffect('clearAll');
                        await this.clearAll();
                    } else {
                        AudioService.stopEffect('clearAll');
                    }
                } catch (error) {
                    console.error('Error during clear all:', error);
                    // Proceed with clearing even if sound fails
                    await this.clearAll();
                }
            };

            clearButton.addEventListener('click', this.clearButtonListener);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.reminderCheckInterval) {
            clearInterval(this.reminderCheckInterval);
        }

        // Clean up note cards
        this.noteCards.forEach(noteCard => noteCard.destroy?.());
        this.noteCards.clear();

        // Remove clear button listener
        const clearButton = document.querySelector('.notes-section .clear-btn');
        if (clearButton && this.clearButtonListener) {
            clearButton.removeEventListener('click', this.clearButtonListener);
        }
    }

    /**
     * Get note by ID
     * @param {number} id - Note ID
     * @returns {Note|undefined}
     */
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    /**
     * Get all pinned notes
     * @returns {Array<Note>}
     */
    getPinnedNotes() {
        return this.notes.filter(note => note.pinned);
    }

    /**
     * Get all notes with active reminders
     * @returns {Array<Note>}
     */
    getReminderNotes() {
        return this.notes.filter(note => note.reminder && !note.isReminderComplete());
    }

    /**
     * Clear all notes
     */
    async clearAll() {
        try {
            await AudioService.playEffect('clearAll');
        } catch (error) {
            console.error('Error playing clear sound:', error);
        }
        this.notes = [];
        Note.save(this.notes);
        this.displayNotes();
    }
}