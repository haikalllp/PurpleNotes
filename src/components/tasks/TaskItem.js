/**
 * Individual task item component with drag and drop support
 */
import { Task } from '../../models/Task.js';
import { DOMUtils } from '../../utils/DOMUtils.js';

export class TaskItem {
    /**
     * @param {Object} options
     * @param {Task} options.task - Task instance to display
     * @param {number} options.index - Task index in list
     * @param {Function} options.onDelete - Callback when task is deleted
     * @param {Function} options.onComplete - Callback when task is completed
     * @param {Function} options.onDrop - Callback when task is dropped
     */
    constructor({ task, index, onDelete, onComplete, onDrop }) {
        this.task = task;
        this.index = index;
        this.onDelete = onDelete;
        this.onComplete = onComplete;
        this.onDrop = onDrop;
        this.element = this.createTaskElement();
        this.initialize();
    }

    /**
     * Create the task item DOM element
     * @private
     * @returns {HTMLElement}
     */
    createTaskElement() {
        const taskElement = DOMUtils.createFromHTML(`
            <li class="task-item ${this.task.completed ? 'completed' : ''}" 
                data-task-id="${this.task.id}"
                data-index="${this.index}"
                draggable="true">
                <label class="task-label">
                    <input type="checkbox" ${this.task.completed ? 'checked' : ''}>
                    <span class="task-text">${this.task.text}</span>
                </label>
                ${this.task.completed ? `
                    <button class="task-delete-btn" aria-label="Delete task">✕</button>
                ` : ''}
            </li>
        `);

        return taskElement;
    }

    /**
     * Initialize event listeners
     * @private
     */
    initialize() {
        this.setupCheckboxHandler();
        this.setupDeleteHandler();
        this.setupDragAndDrop();
    }

    /**
     * Set up checkbox change handler
     * @private
     */
    setupCheckboxHandler() {
        const checkbox = this.element.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', async (e) => {
            this.task.completed = e.target.checked;
            await this.task.toggleComplete();
            this.element.classList.toggle('completed', this.task.completed);
            
            if (this.onComplete) {
                this.onComplete(this.task);
            }
        });
    }

    /**
     * Set up delete button handler
     * @private
     */
    setupDeleteHandler() {
        const deleteBtn = this.element.querySelector('.task-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                await DOMUtils.fadeOut(this.element);
                await Task.delete(this.task.id);
                if (this.onDelete) {
                    this.onDelete(this.task);
                }
            });
        }
    }

    /**
     * Set up drag and drop handlers
     * @private
     */
    setupDragAndDrop() {
        this.element.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.element.addEventListener('dragend', this.handleDragEnd.bind(this));
        this.element.addEventListener('dragover', this.handleDragOver.bind(this));
        this.element.addEventListener('dragenter', this.handleDragEnter.bind(this));
        this.element.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.element.addEventListener('drop', this.handleDrop.bind(this));
    }

    /**
     * Handle drag start event
     * @private
     * @param {DragEvent} e
     */
    handleDragStart(e) {
        this.element.classList.add('dragging');
        setTimeout(() => this.element.classList.add('ghost'), 0);
    }

    /**
     * Handle drag end event
     * @private
     */
    handleDragEnd() {
        this.element.classList.remove('dragging', 'ghost');
    }

    /**
     * Handle drag over event
     * @private
     * @param {DragEvent} e
     */
    handleDragOver(e) {
        e.preventDefault();
        const dropTarget = this.getDropTarget(e.clientY);
        
        if (dropTarget) {
            const rect = dropTarget.getBoundingClientRect();
            const offset = e.clientY - rect.top;
            const middle = rect.height / 2;
            
            dropTarget.classList.remove('drop-target-above', 'drop-target-below');
            dropTarget.classList.add(offset < middle ? 'drop-target-above' : 'drop-target-below');
        }
    }

    /**
     * Handle drag enter event
     * @private
     * @param {DragEvent} e
     */
    handleDragEnter(e) {
        e.preventDefault();
        this.element.classList.add('drop-target');
    }

    /**
     * Handle drag leave event
     * @private
     */
    handleDragLeave() {
        this.element.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
    }

    /**
     * Handle drop event
     * @private
     */
    handleDrop() {
        if (this.onDrop) {
            this.onDrop(parseInt(this.element.dataset.index));
        }
        this.element.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
    }

    /**
     * Get nearest drop target based on Y coordinate
     * @private
     * @param {number} y - Y coordinate
     * @returns {HTMLElement|null}
     */
    getDropTarget(y) {
        const taskElements = [...document.querySelectorAll('.task-item:not(.dragging)')];
        return taskElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    /**
     * Update task index
     * @param {number} index - New index
     */
    updateIndex(index) {
        this.index = index;
        this.element.dataset.index = index;
    }

    /**
     * Remove the task item element
     */
    remove() {
        this.element.remove();
    }
}