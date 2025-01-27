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
        this.initialize();
    }

    /**
     * Initialize note list
     */
    initialize() {
        this.loadNotes();
        this.setupReminderCheck();
        this.setupClearAllButton();
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
        this.container.innerHTML = '';
        
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
        this.displayNotes();
    }

    /**
     * Handle note deletion
     * @param {Note} note - Note being deleted
     */
    handleNoteDelete(note) {
        this.notes = this.notes.filter(n => n.id !== note.id);
        this.noteCards.delete(note.id);
        Note.save(this.notes); // Fix: Add save call
    }

    /**
     * Handle note pin/unpin
     * @param {Note} note - Note being pinned/unpinned
     */
    handleNotePin(note) {
        Note.save(this.notes); // Fix: Add save call
        this.displayNotes(); // Refresh to maintain sort order
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
                    note.markNotified();
                }
            });
            
            // Update progress bars
            this.noteCards.forEach(noteCard => {
                noteCard.updateProgress();
            });
        }, 1000);
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.reminderCheckInterval) {
            clearInterval(this.reminderCheckInterval);
        }
        this.noteCards.clear();
    }

    /**
     * Set up clear all button functionality
     */
    setupClearAllButton() {
        const clearButton = document.querySelector('.notes-section .clear-btn');
        if (clearButton) {
            clearButton.addEventListener('click', async () => {
                try {
                    const result = await DOMUtils.showConfirmation({
                        message: 'Are you sure you want to delete all notes?',
                        subtext: 'Pinned notes will be unpinned and deleted as well.'
                    });

                    if (result) {
                        await AudioService.playEffect('clearAll');
                        this.notes = [];
                        Note.save(this.notes);
                        this.displayNotes();
                    } else {
                        AudioService.stopEffect('clearAll');
                    }
                } catch (error) {
                    console.error('Error clearing notes:', error);
                    // Continue with clearing even if sound fails
                    this.notes = [];
                    Note.save(this.notes);
                    this.displayNotes();
                }
            });
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