/**
 * Represents a task in the application
 */
import StorageService from '../services/StorageService.js';
import AudioService from '../services/AudioService.js';

export class Task {
    /**
     * Create a new task
     * @param {Object} data - Task data
     * @param {string} data.text - Task text content
     * @param {boolean} [data.completed=false] - Whether task is completed
     */
    constructor({ text, completed = false }) {
        this.id = Date.now();
        this.text = text;
        this.completed = completed;
    }

    /**
     * Toggle the completed state of the task
     * @returns {Promise<void>}
     */
    async toggleComplete() {
        // Toggle state
        this.completed = !this.completed;
        
        // Get all tasks and find this task
        const tasks = Task.getAll();
        const taskIndex = tasks.findIndex(t => t.id === this.id);
        
        if (taskIndex !== -1) {
            // Update task in array
            tasks[taskIndex] = this;
            
            // Save changes
            Task.save(tasks);
            
            // Play completion sound if completed
            if (this.completed) {
                try {
                    await AudioService.playEffect('taskComplete');
                } catch (error) {
                    console.error('Error playing completion sound:', error);
                }
            }
        }
    }

    // Static methods for managing tasks collection

    /**
     * Get all tasks
     * @returns {Array<Task>} Array of tasks
     */
    static getAll() {
        return StorageService.loadTasks().map(data => {
            // Create a new task with minimal data
            const task = new Task({
                text: data.text,
                completed: !!data.completed // Ensure boolean type
            });
            
            // Preserve the ID
            task.id = data.id;
            
            return task;
        });
    }

    /**
     * Save all tasks
     * @param {Array<Task>} tasks - Array of tasks to save
     */
    static save(tasks = Task.getAll()) {
        // Ensure all tasks have proper prototype chain and state
        const processedTasks = tasks.map(task => {
            const processedTask = new Task({
                text: task.text,
                completed: Boolean(task.completed)
            });
            processedTask.id = task.id;
            return processedTask;
        });
        StorageService.saveTasks(processedTasks);
    }

    /**
     * Add a new task
     * @param {Task} task - Task to add
     */
    static add(task) {
        const tasks = Task.getAll();
        tasks.push(task);
        Task.save(tasks);
    }

    /**
     * Delete a task
     * @param {number} id - ID of task to delete
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await AudioService.playEffect('trash');
        const tasks = Task.getAll().filter(task => task.id !== id);
        Task.save(tasks);
    }

    /**
     * Reorder tasks by swapping positions
     * @param {number} fromIndex - Starting index
     * @param {number} toIndex - Target index
     */
    static reorder(fromIndex, toIndex) {
        const tasks = Task.getAll();
        const [taskToMove] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, taskToMove);
        Task.save(tasks);
    }

    /**
     * Clear all completed tasks
     * @returns {Promise<void>}
     */
    static async clearCompleted() {
        await AudioService.playEffect('clearAll');
        const tasks = Task.getAll().filter(task => !task.completed);
        Task.save(tasks);
    }

    /**
     * Clear all tasks
     * @returns {Promise<void>}
     */
    static async clearAll() {
        await AudioService.playEffect('clearAll');
        Task.save([]);
    }
}