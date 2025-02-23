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
        this.isDragging = false;
        this.pressTimer = null;
        this.dragStarted = false;
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
                <div class="task-content">
                    <input type="checkbox" 
                           ${this.task.completed ? 'checked' : ''} 
                           aria-label="Toggle task completion"
                           role="checkbox"
                           aria-checked="${this.task.completed}">
                    <span class="task-text">${this.task.text}</span>
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
        const taskContent = this.element.querySelector('.task-content');

        const updateTaskState = async (completed) => {
            if (this.isTransitioning || this.isDragging) return;
            this.isTransitioning = true;

            try {
                // Update UI
                checkbox.checked = completed;
                this.element.classList.toggle('completed', completed);
                this.element.setAttribute('aria-label',
                    `${completed ? 'Completed' : 'Incomplete'} task: ${this.task.text}`);
                checkbox.setAttribute('aria-checked', completed);

                // Handle delete button
                let deleteBtn = this.element.querySelector('.task-delete-btn');
                if (completed && !deleteBtn) {
                    deleteBtn = document.createElement('button');
                    deleteBtn.className = 'task-delete-btn';
                    deleteBtn.setAttribute('aria-label', 'Delete task');
                    deleteBtn.setAttribute('role', 'button');
                    deleteBtn.textContent = '✕';
                    this.element.appendChild(deleteBtn);
                    this.setupDeleteHandler();
                } else if (!completed && deleteBtn) {
                    deleteBtn.remove();
                }

                // Handle animation
                checkbox.style.animation = 'none';
                checkbox.offsetHeight; // Force reflow
                checkbox.style.animation = `${completed ? 'checkPulse' : 'uncheckPulse'} 0.2s ease-in-out`;

                // Update model state
                await this.task.toggleComplete();

                if (this.onComplete) {
                    this.onComplete(this.task);
                }
            } catch (error) {
                console.error('Error updating task state:', error);
                requestAnimationFrame(() => {
                    checkbox.checked = !completed;
                    this.element.classList.toggle('completed', !completed);
                    if (this.element.querySelector('.task-delete-btn')) {
                        this.element.querySelector('.task-delete-btn').remove();
                    }
                });
            } finally {
                this.isTransitioning = false;
            }
        };

        // Single click handler for task content
        taskContent.addEventListener('click', (e) => {
            const isCheckbox = e.target.type === 'checkbox';
            if (!isCheckbox) {
                e.preventDefault();
                e.stopPropagation();
                updateTaskState(!checkbox.checked);
            }
        });

        // Handle direct checkbox changes
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            updateTaskState(e.target.checked);
        });
    }

    /**
     * Set up delete button handler
     * @private
     */
    setupDeleteHandler() {
        const deleteBtn = this.element.querySelector('.task-delete-btn');
        if (!deleteBtn) return;

        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (this.isTransitioning || this.isDragging) return;
            this.isTransitioning = true;

            try {
                this.element.classList.add('fade-out');
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
                    this.task = new Task(updatedTask);
                    
                    if (!this.isTransitioning && !this.isDragging) {
                        requestAnimationFrame(() => {
                            const checkbox = this.element.querySelector('input[type="checkbox"]');
                            if (checkbox) {
                                checkbox.checked = this.task.completed;
                                this.element.classList.toggle('completed', this.task.completed);
                            }
                        });
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
        if (this.isTransitioning || e.target.closest('input, button')) {
            e.preventDefault();
            return;
        }
        this.isDragging = true;
        e.dataTransfer.effectAllowed = 'move';
        // Store both the task ID and index to ensure we're moving the correct task
        const dragData = JSON.stringify({
            taskId: this.task.id,
            index: this.index
        });
        e.dataTransfer.setData('text/plain', dragData);
        
        // Add ghost effect and set cursor style
        this.element.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
        
        // Create and append ghost element
        const rect = this.element.getBoundingClientRect();
        const ghost = this.element.cloneNode(true);
        ghost.classList.add('ghost');
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.position = 'fixed';
        ghost.style.top = '-1000px';
        ghost.style.opacity = '0.8';
        document.body.appendChild(ghost);
        
        e.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);
        
        // Remove ghost element after drag starts
        setTimeout(() => {
            document.body.removeChild(ghost);
        }, 0);
    }

    handleDragEnd() {
        this.isDragging = false;
        this.element.classList.remove('dragging', 'ghost');
        document.body.style.cursor = '';
        
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
        });
    }
    /**
     * Handle drag over event
     * @private
     * @param {DragEvent} e
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const dropInfo = this.getDropPosition(e.clientY);
        if (dropInfo) {
            const { element, position } = dropInfo;
            this.updateDropTargetStyle(element, position);
        }
    }

    /**
     * Handle drag enter event
     * @private
     * @param {DragEvent} e
     */
    handleDragEnter(e) {
        if (this.isTransitioning || !this.isDragging) return;
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
        e.stopPropagation();
        
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const fromIndex = parseInt(dragData.index);
            const dropInfo = this.getDropPosition(e.clientY);
            
            if (dropInfo) {
                const targetIndex = parseInt(dropInfo.element.dataset.index);
                let toIndex = dropInfo.position === 'below' ? targetIndex + 1 : targetIndex;
                
                // Adjust toIndex if dropping below the dragged item
                if (fromIndex < targetIndex) {
                    toIndex--;
                }
                
                if (!isNaN(fromIndex) && !isNaN(toIndex) && this.onDrop && fromIndex !== toIndex) {
                    this.onDrop(fromIndex, toIndex);
                }
            }
        } catch (error) {
            console.error('Error processing drag data:', error);
        }
        
        this.element.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
    }

    /**
     * Get drop position information
     * @private
     * @param {number} y - Mouse Y coordinate
     * @returns {{ element: HTMLElement, position: 'above' | 'below' } | null}
     */
    getDropPosition(y) {
        // Get all task elements including the dragging one
        const taskElements = [...document.querySelectorAll('.task-item')];
        if (taskElements.length === 0) return null;

        // Find the closest task element based on vertical position
        let closestTask = null;
        let closestDistance = Infinity;
        let position = 'below';

        for (const task of taskElements) {
            const box = task.getBoundingClientRect();
            const taskMiddle = box.top + box.height / 2;
            const distance = Math.abs(y - taskMiddle);

            // If we're very close to the middle of a task, prefer that task
            if (distance < box.height * 0.2) {
                closestTask = task;
                position = y < taskMiddle ? 'above' : 'below';
                break;
            }

            // Check if this task is closer than the previous closest
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTask = task;
                position = y < taskMiddle ? 'above' : 'below';
            }
        }

        if (!closestTask) return null;

        return {
            element: closestTask,
            position: position
        };
    }

    /**
     * Update drop target visual style
     * @private
     * @param {HTMLElement} element - Target element
     * @param {'above' | 'below'} position - Drop position
     */
    updateDropTargetStyle(element, position) {
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('drop-target-above', 'drop-target-below');
        });
        
        element.classList.add(`drop-target-${position}`);
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