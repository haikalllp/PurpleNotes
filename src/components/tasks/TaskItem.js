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
                <div class="task-label">
                    <input type="checkbox" ${this.task.completed ? 'checked' : ''}>
                    <span class="task-text">${this.task.text}</span>
                </div>
                <button class="task-delete-btn"
                    aria-label="Delete task"
                    style="visibility: ${this.task.completed ? 'visible' : 'hidden'}">
                    ✕
                </button>
            </li>
        `);

        // Let CSS handle transitions and animations
        return taskElement;

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
        const taskLabel = this.element.querySelector('.task-label');

        // Handle checkbox change
        const handleCompletion = async () => {
            if (this.onComplete) {
                await this.onComplete(this.task);
            }
        };

        // Handle checkbox change
        checkbox.addEventListener('change', async (e) => {
            e.stopPropagation();
            await handleCompletion();
        });

        // Handle label click (excluding checkbox and delete button)
        taskLabel.addEventListener('click', async (e) => {
            if (!e.target.closest('input[type="checkbox"]') && !e.target.closest('.task-delete-btn')) {
                e.preventDefault();
                e.stopPropagation();
                checkbox.checked = !checkbox.checked;
                await handleCompletion();
            }
        });
    }

    /**
     * Update the completion state UI
     * @param {boolean} completed - New completion state
     */
    updateCompletionState(completed) {
        this.task.completed = completed;

        // Let CSS handle all transitions by toggling classes
        this.element.classList.toggle('completed', completed);

        // Update checkbox state
        const checkbox = this.element.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = completed;
        }

        // Handle delete button visibility through CSS classes only
        const deleteBtn = this.element.querySelector('.task-delete-btn');
        if (deleteBtn) {
            deleteBtn.classList.toggle('visible', completed);
        }
    }

    /**
     * Set up delete button handler
     * @private
     */
    setupDeleteHandler() {
        const deleteBtn = this.element.querySelector('.task-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                // Add the fade-out animation
                this.element.classList.add('fade-out');
                
                // Wait for animation to complete before triggering deletion
                this.element.addEventListener('animationend', () => {
                    if (this.onDelete) {
                        this.onDelete(this.task);
                    }
                }, { once: true });
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
        e.dataTransfer.setData('text/plain', this.index.toString());
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
    handleDrop(e) {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(this.element.dataset.index);
        
        if (!isNaN(fromIndex) && !isNaN(toIndex) && this.onDrop) {
            this.onDrop(fromIndex);
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