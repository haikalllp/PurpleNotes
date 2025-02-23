/**
 * Task creation form component
 */
import { Task } from '../../models/Task.js';
import { DOMUtils } from '../../utils/DOMUtils.js';

export class TaskForm {
    /**
     * @param {Object} options
     * @param {Function} options.onSubmit - Callback when task is created
     */
    constructor({ onSubmit }) {
        this.form = DOMUtils.getElement('taskForm');
        this.input = this.form.querySelector('#taskInput');
        this.onSubmit = onSubmit;
        this.initialize();
    }

    /**
     * Initialize form
     */
    initialize() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Add input validation
        this.input.addEventListener('input', this.validateInput.bind(this));
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.input.value.trim()) {
            this.input.focus();
            return;
        }
        
        const taskData = {
            text: this.input.value.trim()
        };
        
        const task = new Task(taskData);
        Task.add(task);
        
        if (this.onSubmit) {
            this.onSubmit(task);
        }
        
        this.form.reset();
        this.input.focus();
    }

    /**
     * Validate input field
     * @param {Event} e - Input event
     */
    validateInput(e) {
        const value = e.target.value.trim();
        if (!value) {
            e.target.setCustomValidity('Task text is required');
        } else {
            e.target.setCustomValidity('');
        }
    }

    /**
     * Reset form to initial state
     */
    reset() {
        this.form.reset();
    }

    /**
     * Focus the input field
     */
    focus() {
        this.input.focus();
    }

    /**
     * Get current input value
     * @returns {string}
     */
    getValue() {
        return this.input.value;
    }

    /**
     * Set input value
     * @param {string} value
     */
    setValue(value) {
        this.input.value = value;
        this.validateInput({ target: this.input });
    }

    /**
     * Check if form is valid
     * @returns {boolean}
     */
    isValid() {
        return this.form.checkValidity();
    }
}