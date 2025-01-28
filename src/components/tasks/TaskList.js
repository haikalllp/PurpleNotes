/**
 * Manages the collection and display of tasks
 */
import { Task } from '../../models/Task.js';
import { TaskItem } from './TaskItem.js';
import { DOMUtils } from '../../utils/DOMUtils.js';
import AudioService from '../../services/AudioService.js';

export class TaskList {
    /**
     * @param {Object} options
     * @param {string} options.containerId - ID of container element
     */
    constructor({ containerId }) {
        this.container = DOMUtils.getElement(containerId);
        this.tasks = [];
        this.taskItems = new Map(); // Map of task ID to TaskItem instance
        this.dragStartIndex = null;
        this.clearButtonListener = null;
        this.initialize();
    }

    /**
     * Initialize task list
     */
    initialize() {
        // Show loading state
        this.showLoadingState();
        
        // Load tasks with a small delay to show loading state
        setTimeout(() => {
            this.loadTasks();
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
                <span>Loading tasks...</span>
            </div>
        `;
    }

    /**
     * Load tasks from storage and display them
     */
    loadTasks() {
        this.tasks = Task.getAll();
        this.displayTasks();
    }

    /**
     * Display all tasks
     */
    displayTasks() {
        // Clear the container first
        this.container.innerHTML = '';

        // If no tasks, show empty state
        if (this.tasks.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>No tasks yet. Add your first task!</p>
                </div>
            `;
            return;
        }
        
        // Clear old task item references and cleanup
        this.taskItems.forEach(taskItem => taskItem.destroy?.());
        this.taskItems.clear();
        
        // Create and display task items
        this.tasks.forEach((task, index) => {
            const taskItem = new TaskItem({
                task,
                index,
                onDelete: () => this.handleTaskDelete(task),
                onComplete: () => this.handleTaskComplete(task),
                onDrop: (dropIndex) => this.handleTaskDrop(index, dropIndex)
            });
            
            this.taskItems.set(task.id, taskItem);
            this.container.appendChild(taskItem.element);
        });
    }

    /**
     * Add a new task
     * @param {Task} task - Task to add
     */
    addTask(task) {
        this.tasks.push(task);
        Task.save(this.tasks);
        this.displayTasks();
    }

    /**
     * Handle task deletion
     * @param {Task} task - Task being deleted
     */
    async handleTaskDelete(task) {
        const taskItem = this.taskItems.get(task.id);
        if (!taskItem) return;

        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index === -1) return;

        // Update data state immediately
        this.tasks.splice(index, 1);
        await Task.save(this.tasks);
        await Task.delete(task.id);

        // Set up reorder animations for tasks below the deleted one
        const tasks = Array.from(this.container.children);
        tasks.forEach((el, idx) => {
            if (idx > index) {
                // Add reorder class for transition
                el.classList.add('reorder');
                // Move up
                el.style.transform = 'translateY(-100%)';
                
                // Force reflow
                el.offsetHeight;
                
                // Animate back to position
                el.style.transform = '';

                // Update index
                const taskId = parseInt(el.dataset.taskId);
                const item = this.taskItems.get(taskId);
                if (item) {
                    item.updateIndex(idx - 1);
                }
            }
        });

        // Start fade out animation
        taskItem.element.classList.add('fade-out');

        // Wait for fade out and then clean up
        await new Promise(resolve => {
            taskItem.element.addEventListener('animationend', () => {
                taskItem.element.remove();
                this.taskItems.delete(task.id);
                resolve();
            }, { once: true });
        });

        // Remove reorder class after animation
        tasks.forEach(el => el.classList.remove('reorder'));

        // Show empty state if needed
        if (this.tasks.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>No tasks yet. Add your first task!</p>
                </div>
            `;
        }
    }

    /**
     * Handle task completion
     * @param {Task} task - Task being completed
     */
    async handleTaskComplete(task) {
        const taskIndex = this.tasks.findIndex(t => t.id === task.id);
        if (taskIndex === -1) return;

        // Toggle completion state
        const completed = !this.tasks[taskIndex].completed;
        
        // Update both memory and storage state immediately
        this.tasks[taskIndex].completed = completed;
        await Task.save(this.tasks);
        
        // Update UI state
        const taskItem = this.taskItems.get(task.id);
        if (taskItem) {
            // Let CSS handle transitions through class changes
            taskItem.element.classList.toggle('completed', completed);
            const checkbox = taskItem.element.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = completed;
            }

            // Toggle visible class for delete button transitions
            const deleteBtn = taskItem.element.querySelector('.task-delete-btn');
            if (deleteBtn) {
                deleteBtn.classList.toggle('visible', completed);
            }
        }
    }

    /**
     * Handle task drop during drag and drop
     * @param {number} fromIndex - Starting index
     * @param {number} toIndex - Target index
     */
    handleTaskDrop(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        // Use Task.reorder to handle the reordering
        Task.reorder(fromIndex, toIndex);
        
        // Reload tasks to ensure we have the latest order
        this.loadTasks();
    }

    /**
     * Set up clear all button functionality
     */
    setupClearAllButton() {
        const clearButton = document.querySelector('.tasks-section .clear-btn');
        if (clearButton) {
            // Remove existing listener if any
            if (this.clearButtonListener) {
                clearButton.removeEventListener('click', this.clearButtonListener);
            }

            this.clearButtonListener = async () => {
                try {
                    const result = await DOMUtils.showConfirmation({
                        message: 'Are you sure you want to delete all tasks?'
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
        // Clean up task items
        this.taskItems.forEach(taskItem => taskItem.destroy?.());
        this.taskItems.clear();

        // Remove clear button listener
        const clearButton = document.querySelector('.tasks-section .clear-btn');
        if (clearButton && this.clearButtonListener) {
            clearButton.removeEventListener('click', this.clearButtonListener);
        }
    }

    /**
     * Get task by ID
     * @param {number} id - Task ID
     * @returns {Task|undefined}
     */
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    /**
     * Get completed tasks
     * @returns {Array<Task>}
     */
    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    /**
     * Get incomplete tasks
     * @returns {Array<Task>}
     */
    getIncompleteTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    /**
     * Clear completed tasks
     */
    async clearCompleted() {
        try {
            await AudioService.playEffect('clearAll');
            this.tasks = this.getIncompleteTasks();
            Task.save(this.tasks);
            this.displayTasks();
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            // Proceed with clearing even if sound fails
            this.tasks = this.getIncompleteTasks();
            Task.save(this.tasks);
            this.displayTasks();
        }
    }

    /**
     * Clear all tasks
     */
    async clearAll() {
        try {
            await AudioService.playEffect('clearAll');
        } catch (error) {
            console.error('Error playing clear sound:', error);
        }
        this.tasks = [];
        Task.save(this.tasks);
        this.displayTasks();
    }

    /**
     * Get task count
     * @returns {Object} Object containing total, completed, and incomplete counts
     */
    getTaskCounts() {
        return {
            total: this.tasks.length,
            completed: this.getCompletedTasks().length,
            incomplete: this.getIncompleteTasks().length
        };
    }
}