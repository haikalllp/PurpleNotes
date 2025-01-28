/**
 * Individual task item component with enhanced interactions and transitions
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
        this.isTransitioning = false;
        this.element = this.createTaskElement();
        this.initialize();
    }

    /**
     * Create the task item DOM element with accessibility support
     * @private
     * @returns {HTMLElement}
     */
    createTaskElement() {
        const taskElement = DOMUtils.createFromHTML(`
            <li class="task-item ${this.task.completed ? 'completed' : ''}"
                data-task-id="${this.task.id}"
                data-index="${this.index}"
                draggable="true"
                role="listitem"
                aria-label="${this.task.completed ? 'Completed task' : 'Incomplete task'}: ${this.task.text}">
                <div class="task-label">
                    <input type="checkbox" 
                           ${this.task.completed ? 'checked' : ''} 
                           aria-label="Toggle task completion"
                           role="checkbox"
                           aria-checked="${this.task.completed}">
                    <span class="task-text ${this.task.completed ? 'completed' : ''}">${this.task.text}</span>
                </div>
                ${this.task.completed ?
                    `<button class="task-delete-btn" 
                             aria-label="Delete task"
                             role="button">✕</button>`
                    : ''
                }
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
        this.setupStorageSync();
    }

    /**
     * Set up checkbox change handler with state management
     * @private
     */
    setupCheckboxHandler() {
        const checkbox = this.element.querySelector('input[type="checkbox"]');
        const taskLabel = this.element.querySelector('.task-label');

        const updateTaskState = async (completed) => {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            try {
                // Update UI immediately for responsiveness
                checkbox.checked = completed;
                this.element.classList.toggle('completed', completed);
                this.element.setAttribute('aria-label', 
                    `${completed ? 'Completed' : 'Incomplete'} task: ${this.task.text}`);
                checkbox.setAttribute('aria-checked', completed);

                // Handle delete button
                let deleteBtn = this.element.querySelector('.task-delete-btn');
                if (completed) {
                    if (!deleteBtn) {
                        deleteBtn = document.createElement('button');
                        deleteBtn.className = 'task-delete-btn';
                        deleteBtn.setAttribute('aria-label', 'Delete task');
                        deleteBtn.setAttribute('role', 'button');
                        deleteBtn.textContent = '✕';
                        deleteBtn.style.opacity = '0';
                        this.element.appendChild(deleteBtn);
                        
                        // Trigger animation after a frame
                        requestAnimationFrame(() => {
                            deleteBtn.style.opacity = '1';
                            this.setupDeleteHandler();
                        });
                    }
                } else if (deleteBtn) {
                    deleteBtn.style.opacity = '0';
                    await new Promise(resolve => {
                        setTimeout(() => {
                            deleteBtn.remove();
                            resolve();
                        }, 300); // Match transition duration
                    });
                }

                // Update model state
                await this.task.toggleComplete();

                // Notify parent after successful state update
                if (this.onComplete) {
                    this.onComplete(this.task);
                }
            } catch (error) {
                console.error('Error updating task state:', error);
                // Revert UI state on error
                checkbox.checked = !completed;
                this.element.classList.toggle('completed', !completed);
                if (this.element.querySelector('.task-delete-btn')) {
                    this.element.querySelector('.task-delete-btn').remove();
                }
            } finally {
                this.isTransitioning = false;
            }
        };

        // Handle checkbox change
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            updateTaskState(e.target.checked);
        });

        // Handle label click (excluding checkbox and delete button)
        taskLabel.addEventListener('click', (e) => {
            if (!e.target.closest('input[type="checkbox"]') && 
                !e.target.closest('.task-delete-btn')) {
                e.preventDefault();
                e.stopPropagation();
                updateTaskState(!checkbox.checked);
            }
        });
    }

    /**
     * Set up delete button handler with animation
     * @private
     */
    setupDeleteHandler() {
        const deleteBtn = this.element.querySelector('.task-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (this.isTransitioning) return;
                this.isTransitioning = true;

                try {
                    this.element.classList.add('fade-out');
                    
                    // Wait for animation
                    await new Promise(resolve => {
                        this.element.addEventListener('animationend', resolve, { once: true });
                    });

                    await Task.delete(this.task.id);
                    
                    if (this.onDelete) {
                        this.onDelete(this.task);
                    }
                } catch (error) {
                    console.error('Error deleting task:', error);
                    this.element.classList.remove('fade-out');
                } finally {
                    this.isTransitioning = false;
                }
            });
        }
    }

    /**
     * Set up storage synchronization
     * @private
     */
    setupStorageSync() {
        this.handleStorageUpdate = (event) => {
            const { key, newValue } = event.detail;
            if (key === 'tasks') {
                const updatedTask = newValue.find(t => t.id === this.task.id);
                if (updatedTask && updatedTask.lastModified > this.task.lastModified) {
                    // Update local state
                    this.task = new Task(updatedTask);
                    
                    // Update UI
                    const checkbox = this.element.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = this.task.completed;
                        this.element.classList.toggle('completed', this.task.completed);
                    }
                }
            }
        };

        window.addEventListener('storage-update', this.handleStorageUpdate);
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
        if (this.isTransitioning) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', this.index.toString());
        this.element.classList.add('dragging');
        requestAnimationFrame(() => this.element.classList.add('ghost'));
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
        if (this.isTransitioning) return;
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
        if (this.isTransitioning) return;
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
     * @param {DragEvent} e
     */
    handleDrop(e) {
        if (this.isTransitioning) return;
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(this.element.dataset.index);
        
        if (!isNaN(fromIndex) && !isNaN(toIndex) && this.onDrop) {
            this.onDrop(fromIndex, toIndex);
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
    async remove() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        try {
            this.element.classList.add('fade-out');
            await new Promise(resolve => {
                this.element.addEventListener('animationend', resolve, { once: true });
            });
            this.element.remove();
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Clean up event listeners and references
     */
    destroy() {
        window.removeEventListener('storage-update', this.handleStorageUpdate);
        this.element.remove();
    }
}