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
        this.initialize();
    }

    /**
     * Initialize task list
     */
    initialize() {
        this.loadTasks();
        this.setupClearAllButton();
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
        this.container.innerHTML = '';
        
        // Clear old task item references
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
        this.displayTasks();
    }

    /**
     * Handle task deletion
     * @param {Task} task - Task being deleted
     */
    handleTaskDelete(task) {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.taskItems.delete(task.id);
        Task.save(this.tasks);
    }

    /**
     * Handle task completion
     * @param {Task} task - Task being completed
     */
    handleTaskComplete(task) {
        Task.save(this.tasks);
        // Refresh display to show/hide delete button
        this.displayTasks();
    }

    /**
     * Handle task drop during drag and drop
     * @param {number} fromIndex - Starting index
     * @param {number} toIndex - Target index
     */
    handleTaskDrop(fromIndex, toIndex) {
        Task.reorder(fromIndex, toIndex);
        this.loadTasks(); // Reload to get updated order
    }

    /**
     * Set up clear all button functionality
     */
    setupClearAllButton() {
        const clearButton = document.querySelector('.tasks-section .clear-btn');
        if (clearButton) {
            clearButton.addEventListener('click', async () => {
                const result = await DOMUtils.showConfirmation({
                    message: 'Are you sure you want to delete all tasks?'
                });

                if (result) {
                    await Task.clearAll();
                    this.loadTasks();
                } else {
                    AudioService.stopEffect('clearAll');
                }
            });
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
        await Task.clearCompleted();
        this.loadTasks();
    }

    /**
     * Clear all tasks
     */
    async clearAll() {
        await Task.clearAll();
        this.loadTasks();
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