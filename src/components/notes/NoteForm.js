/**
 * Note creation form component
 */
import { Note } from '../../models/Note.js';
import { DOMUtils } from '../../utils/DOMUtils.js';

export class NoteForm {
    /**
     * @param {Object} options
     * @param {Function} options.onSubmit - Callback when note is created
     */
    constructor({ onSubmit }) {
        this.form = DOMUtils.getElement('noteForm');
        this.enableReminder = DOMUtils.getElement('enableReminder');
        this.reminderField = DOMUtils.getElement('noteReminder');
        this.onSubmit = onSubmit;
        this.initialize();
    }

    /**
     * Initialize form
     */
    initialize() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.enableReminder.addEventListener('change', this.toggleReminderField.bind(this));
        this.setupReminderValidation();
        this.toggleReminderField(); // Initial state
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const titleInput = this.form.querySelector('#noteTitle');
        const contentInput = this.form.querySelector('#noteContent');
        
        // Validate reminder if enabled
        if (this.enableReminder.checked && !this.reminderField.value) {
            this.reminderField.focus();
            return;
        }
        
        const noteData = {
            title: titleInput.value,
            content: contentInput.value,
            reminder: this.enableReminder.checked ? new Date(this.reminderField.value).getTime() : null
        };
        
        const note = new Note(noteData);
        Note.add(note);
        
        if (this.onSubmit) {
            this.onSubmit(note);
        }
        
        this.form.reset();
        this.toggleReminderField(); // Reset reminder field state
    }

    /**
     * Toggle reminder datetime field visibility
     */
    toggleReminderField() {
        const reminderField = this.reminderField;
        
        if (this.enableReminder.checked) {
            // Set min datetime to now + 1 minute
            const now = new Date();
            now.setMinutes(now.getMinutes() + 1);
            const minDateTime = now.toISOString().slice(0, 16);
            reminderField.min = minDateTime;
            
            // Show reminder field with animation
            reminderField.style.display = 'block';
            reminderField.style.opacity = '0';
            reminderField.style.transform = 'translateY(-50%) translateX(-10px)';
            
            requestAnimationFrame(() => {
                reminderField.style.opacity = '1';
                reminderField.style.transform = 'translateY(-50%) translateX(0)';
                reminderField.focus();
            });
        } else {
            // Hide reminder field with animation
            reminderField.style.opacity = '0';
            reminderField.style.transform = 'translateY(-50%) translateX(-10px)';
            
            setTimeout(() => {
                reminderField.style.display = 'none';
                reminderField.value = '';
            }, 300);
        }
        
        reminderField.required = this.enableReminder.checked;
    }

    /**
     * Setup reminder datetime validation
     */
    setupReminderValidation() {
        this.reminderField.addEventListener('input', (e) => {
            const selectedDate = new Date(e.target.value);
            const now = new Date();
            
            if (selectedDate <= now) {
                e.target.setCustomValidity('Please select a future time');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    /**
     * Reset form to initial state
     */
    reset() {
        this.form.reset();
        this.toggleReminderField();
    }
}