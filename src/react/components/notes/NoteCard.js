/**
 * Individual note card component
 */
import { DOMUtils } from '../../../utils/DOMUtils.js';
import { Note } from '../../../models/Note.js';
import AudioService from '../../../services/AudioService.js';

export class NoteCard {
    /**
     * @param {Object} options
     * @param {Note} options.note - Note instance to display
     * @param {Function} options.onDelete - Callback when note is deleted
     * @param {Function} options.onPin - Callback when note is pinned/unpinned
     */
    constructor({ note, onDelete, onPin }) {
        this.note = note;
        this.onDelete = onDelete;
        this.onPin = onPin;
        this.element = this.createNoteElement();
        this.initialize();
    }

    /**
     * Create the note card DOM element
     * @private
     * @returns {HTMLElement}
     */
    createNoteElement() {
        const noteElement = DOMUtils.createFromHTML(`
            <div class="note-card ${this.note.pinned ? 'pinned' : ''}" 
                 data-reminder-time="${this.note.reminder || ''}"
                 data-created-time="${this.note.created}"
                 ${this.note.reminder ? `data-progress="${this.calculateProgress()}"` : ''}>
                <div class="note-content-wrapper flex flex-col gap-2">
                    <div class="note-header">
                        <h3 class="note-title">${this.note.title}</h3>
                        <button class="pin-button" title="${this.note.pinned ? 'Unpin' : 'Pin'} note">
                            <span class="pin-icon"></span>
                        </button>
                    </div>
                    <p class="note-content">${this.note.content}</p>
                    <div class="note-meta">
                        <div class="note-date">Created: ${new Date(this.note.created).toLocaleString()}</div>
                        ${this.note.pinned ? '<div class="pin-badge">📌 Pinned</div>' : ''}
                    </div>
                    ${this.createReminderHTML()}
                    <div class="note-actions">
                        ${!this.note.pinned ? `
                            <button class="delete-btn" data-id="${this.note.id}">
                                <span class="delete-icon">×</span>
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `);

        return noteElement;
    }

    /**
     * Create reminder HTML if note has reminder
     * @private
     * @returns {string}
     */
    createReminderHTML() {
        if (!this.note.reminder) return '';

        const { hours, minutes } = this.note.getRemainingTime();
        const timeDisplay = hours + minutes === 0 ? 'less than a minute' : `${hours}h ${minutes}m`;
        const isComplete = this.note.isReminderComplete();

        return `
            <div class="reminder-info">
                <div class="reminder-status">
                    ${isComplete ? 'Reminder Alerted' : `Reminding in ${timeDisplay}`}
                </div>
                <div class="progress-bar-wrapper">
                    <div class="progress-bar">
                        <div class="progress ${isComplete ? 'complete' : ''}" 
                             style="width: ${this.calculateProgress()}%">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calculate progress percentage for reminder
     * @private
     * @returns {number}
     */
    calculateProgress() {
        return this.note.calculateProgress();
    }

    /**
     * Initialize event listeners
     * @private
     */
    initialize() {
        // Pin button handler
        this.element.querySelector('.pin-button').addEventListener('click', () => {
            this.note.togglePin();
            if (this.onPin) {
                this.onPin(this.note);
            }
        });

        // Delete button handler
        const deleteBtn = this.element.querySelector('.delete-btn');
        if (deleteBtn && !this.note.pinned) {
            deleteBtn.addEventListener('click', async () => {
                await AudioService.playEffect('trash');
                await DOMUtils.fadeOut(this.element);
                Note.delete(this.note.id);
                if (this.onDelete) {
                    this.onDelete(this.note);
                }
            });
        }
    }

    /**
     * Update reminder progress
     */
    updateProgress() {
        if (!this.note.reminder) return;

        const reminderInfo = this.element.querySelector('.reminder-info');
        if (!reminderInfo) return;

        const progressBar = reminderInfo.querySelector('.progress');
        const reminderStatus = reminderInfo.querySelector('.reminder-status');
        const progress = this.calculateProgress();
        const isComplete = this.note.isReminderComplete();
        
        // Update progress bar
        progressBar.style.width = `${progress}%`;
        progressBar.classList.toggle('complete', isComplete);
        
        // Update reminder status text
        const { hours, minutes } = this.note.getRemainingTime();
        const timeDisplay = hours + minutes <= 0 
            ? 'less than a minute' 
            : `${hours}h ${minutes}m`;
        
        reminderStatus.textContent = isComplete 
            ? 'Reminder Alerted' 
            : `Reminding in ${timeDisplay}`;
    }

    /**
     * Remove the note card element
     */
    remove() {
        this.element.remove();
    }
}