/*****************************
 * INITIALIZATION & SETUP
 *****************************/
document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const DOM = {
        noteForm: document.getElementById('noteForm'),
        taskForm: document.getElementById('taskForm'),
        notesContainer: document.getElementById('notesContainer'),
        taskList: document.getElementById('taskList'),
        enableReminder: document.getElementById('enableReminder'),
        noteReminder: document.getElementById('noteReminder'),
        themeToggle: document.getElementById('themeToggle')
    };

    // Audio Resources
    const audio = {
        notification: new Audio('sounds/notification.mp3'),
        switchOn: new Audio('sounds/SwitchOnEdit.mp3'),
        switchOff: new Audio('sounds/SwitchOffEdit.mp3'),
        reminderDismiss: new Audio('sounds/ReminderButton.mp3'),
        trash: new Audio('sounds/Trashed.mp3'),
        taskComplete: new Audio('sounds/Scratch3.mp3'),
        clearAll: new Audio('sounds/Scratch1.mp3')
    };

    // Data Stores
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const activeNotifications = new Set();

    /**
     * Handles note form submission
     * @param {Event} e - Form submit event
     */
    function handleNoteSubmit(e) {
        e.preventDefault();
        
        const title = DOM.noteForm.querySelector('#noteTitle').value;
        const content = DOM.noteForm.querySelector('#noteContent').value;
        
        // Validate reminder if enabled
        if (DOM.enableReminder.checked && !DOM.noteReminder.value) {
            DOM.noteReminder.focus();
            return;
        }
        
        const noteData = {
            id: Date.now(),
            title: title,
            content: content,
            reminder: DOM.enableReminder.checked ? new Date(DOM.noteReminder.value).getTime() : null,
            created: Date.now(),
            notified: false,
            pinned: false
        };
        
        notes.push(noteData);
        StorageService.saveNotes();
        displayNotes();
        DOM.noteForm.reset();
        toggleReminderField(); // Reset reminder field state
    }

    /**
     * Handles task form submission
     * @param {Event} e - Form submit event
     */
    function handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskInput = DOM.taskForm.querySelector('#taskInput');
        const taskData = {
            id: Date.now(),
            text: taskInput.value,
            completed: false
        };
        
        tasks.push(taskData);
        StorageService.saveTasks();
        displayTasks();
        DOM.taskForm.reset();
    }

/*****************************
 * DATA PERSISTENCE
 *****************************/

    class StorageService {
        static saveNotes() {
            try {
                localStorage.setItem('notes', JSON.stringify(notes));
            } catch (error) {
                console.error('Error saving notes:', error);
                alert('Failed to save notes to storage');
            }
        }
        
        static saveTasks() {
            try {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            } catch (error) {
                console.error('Error saving tasks:', error);
                alert('Failed to save tasks to storage');
            }
        }
        
        static loadNotes() {
            try {
                return JSON.parse(localStorage.getItem('notes')) || [];
            } catch (error) {
                console.error('Error loading notes:', error);
                return [];
            }
        }
        
        static loadTasks() {
            try {
                return JSON.parse(localStorage.getItem('tasks')) || [];
            } catch (error) {
                console.error('Error loading tasks:', error);
                return [];
            }
        }
    }

    // Display Functions
    function displayNotes() {
        DOM.notesContainer.innerHTML = '';
        
        // Sort notes: pinned first, then by creation date
        const sortedNotes = [...notes].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.created - a.created;
        });
        
        sortedNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = `note-card ${note.pinned ? 'pinned' : ''}`;
            
            let reminderInfo = '';
            if (note.reminder) {
                const now = Date.now();
                const totalTime = note.reminder - note.created;
                const elapsedTime = now - note.created;
                const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
                const isComplete = now >= note.reminder;
                
                const finalProgress = isComplete ? 100 : Math.round(progress);
                noteElement.setAttribute('data-progress', finalProgress);
                
                const timeLeft = note.reminder - now;
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const timeDisplay = hoursLeft + minutesLeft === 0 
                    ? 'less than a minute' 
                    : `${hoursLeft}h ${minutesLeft}m`;
                
                reminderInfo = `
                    <div class="reminder-info">
                        <div class="reminder-status">
                            ${isComplete ? 'Reminder Alerted' : `Reminding in ${timeDisplay}`}
                        </div>
                        <div class="progress-bar-wrapper">
                            <div class="progress-bar">
                                <div class="progress ${isComplete ? 'complete' : ''}" 
                                     style="width: ${finalProgress}%">
                                </div>
                            </div>
                        </div>
                    </div>`;
            }
            
            noteElement.setAttribute('data-reminder-time', note.reminder);
            noteElement.setAttribute('data-created-time', note.created);
            
            noteElement.innerHTML = `
                <div class="note-content-wrapper flex flex-col gap-2">
                    <div class="note-header">
                        <h3 class="note-title">${note.title}</h3>
                        <button class="pin-button" title="${note.pinned ? 'Unpin' : 'Pin'} note">
                            <span class="pin-icon"></span>
                        </button>
                    </div>
                    <p class="note-content">${note.content}</p>
                    <div class="note-meta">
                        <div class="note-date">Created: ${new Date(note.created).toLocaleString()}</div>
                        ${note.pinned ? '<div class="pin-badge">📌 Pinned</div>' : ''}
                    </div>
                    ${reminderInfo}
                    <div class="note-actions">
                        ${!note.pinned ? `<button class="delete-btn" data-id="${note.id}">
                            <span class="delete-icon">×</span>
                            Delete
                        </button>` : ''}
                    </div>
                </div>
            `;
            
            // Add pin button event listener
            noteElement.querySelector('.pin-button').addEventListener('click', () => {
                note.pinned = !note.pinned;
                StorageService.saveNotes();
                displayNotes();
            });

            // Add delete button event listener only for unpinned notes
            const deleteBtn = noteElement.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (!note.pinned) {
                         // Play trash sound
                         audio.trash.currentTime = 0.35;
                         audio.trash.volume = 0.35; // ~5dB reduction
                         audio.trash.play().catch(error => {
                             console.error('Error playing trash sound:', error);
                         });

                        // Add fade-out class first
                        noteElement.classList.add('fade-out');
                        
                        // Wait for animation to complete before removing
                        noteElement.addEventListener('animationend', () => {
                            
                            notes = notes.filter(n => n.id !== note.id);
                            StorageService.saveNotes();
                            displayNotes();
                        }, { once: true });
                    }
                });
            }
             
            DOM.notesContainer.appendChild(noteElement);
        });
    }

    function displayTasks() {
        DOM.taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const taskElement = document.createElement('li');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.taskId = task.id;
            taskElement.draggable = true;
            taskElement.dataset.index = index;

            // Drag and Drop Event Handlers
            taskElement.addEventListener('dragstart', handleDragStart);
            taskElement.addEventListener('dragover', handleDragOver);
            taskElement.addEventListener('dragenter', handleDragEnter);
            taskElement.addEventListener('dragleave', handleDragLeave);
            taskElement.addEventListener('drop', handleDrop);
            taskElement.addEventListener('dragend', handleDragEnd);
            taskElement.innerHTML = `
                <label class="task-label">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </label>
                ${task.completed ? `<button class="task-delete-btn">✕</button>` : ''}
            `;
            
            taskElement.querySelector('input').addEventListener('change', (e) => {
                task.completed = e.target.checked;
                 // Play task complete sound
                 if (task.completed) {
                    audio.taskComplete.currentTime = 0.12;
                    audio.taskComplete.volume = 0.10; // ~7dB reduction
                    audio.taskComplete.play().catch(error => {
                        console.error('Error playing task complete sound:', error);
                    });
                }
                StorageService.saveTasks();
                taskElement.classList.toggle('completed', task.completed);

                displayTasks(); // Refresh to show/hide delete button
                
            });

            const deleteBtn = taskElement.querySelector('.task-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    // Play trash sound
                    audio.trash.currentTime = 0.35;
                    audio.trash.volume = 0.35; // ~10dB reduction
                    audio.trash.play().catch(error => {
                        console.error('Error playing trash sound:', error);
                    });
                    deleteTask(task.id);
                });
            }
            
            DOM.taskList.appendChild(taskElement);
        });

        // Add event listener for delete buttons
        DOM.taskList.querySelectorAll('.task-delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.currentTarget.closest('.task-item').dataset.taskId;
                deleteTask(taskId);
            });
        });
    }

    // Notification System
    function checkReminders() {
        notes.forEach(note => {
            if (note.reminder && note.reminder <= Date.now() && !note.notified) {
                showNotification(note);
                note.notified = true;
                StorageService.saveNotes();
                displayNotes();
            }
        });
    }

    let notificationSound = null;
    
    function showNotification(note) {
        const notification = document.createElement('div');
        notification.className = 'notification-overlay';
        notification.innerHTML = `
            <div class="notification-card">
                <div class="notification-header">
                    <h3 class="notification-title">${note.title}</h3>
                    <div class="notification-time">
                        ${new Date(note.reminder).toLocaleString()}
                    </div>
                </div>
                <div class="notification-body">
                    <p>${note.content}</p>
                </div>
                <div class="notification-footer">
                    <button class="notification-continue primary-btn">Dismiss</button>
                </div>
            </div>
        `;

        // Create/reuse audio element
        if (!notificationSound) {
            notificationSound = new Audio('sounds/notification.mp3');
            notificationSound.loop = true;
        }
        
        const notificationCard = notification.querySelector('.notification-card');
        
        // Ensure sound plays properly and is not already playing
        notificationSound.pause();
        notificationSound.currentTime = 0;
        
        // Play the sound and start shaking
        notificationSound.play().then(() => {
            let shakeInterval;
            
            // Function to start shaking
            const startShaking = () => {
                // Initial shake
                notificationCard.classList.add('shaking');
                
                // Set up interval for repeated shaking
                shakeInterval = setInterval(() => {
                    if (!notification.isConnected) {
                        clearInterval(shakeInterval);
                        return;
                    }
                    // Force reflow to ensure smooth animation restart
                    void notificationCard.offsetWidth;
                    notificationCard.classList.remove('shaking');
                    void notificationCard.offsetWidth;
                    notificationCard.classLgist.add('shaking');
                }, 2300); // Shake every 2.30 seconds
            };

            // Start shaking
            startShaking();

            // Add event listener to remove shake when animation ends
            notificationCard.addEventListener('animationend', () => {
                notificationCard.classList.remove('shaking');
            });

            // Handle dismiss button click
            notification.querySelector('.notification-continue').addEventListener('click', () => {
                clearInterval(shakeInterval);
                notification.remove();
                notificationSound.pause();
                notificationSound.currentTime = 0;
                
                // Play dismiss sound
                audio.reminderDismiss.currentTime = 0;
                audio.reminderDismiss.play().catch(error => {
                    console.error('Error playing dismiss sound:', error);
                });
            });

        }).catch(error => {
            console.error('Error playing notification sound:', error);
        });

        document.body.appendChild(notification);
        
        // Add initial animation state
        notification.style.opacity = '0';
        notificationCard.style.transform = 'translateY(20px) scale(0.95)';
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notificationCard.style.transform = 'translateY(0) scale(1)';
        }, 10);
    }

    function toggleReminderField() {
        const reminderField = DOM.noteReminder;
        
        if (DOM.enableReminder.checked) {
            // Set min datetime to now
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
        
        reminderField.required = DOM.enableReminder.checked;
    }

    // Add this to ensure the reminder toggle works
    document.addEventListener('DOMContentLoaded', () => {
        const enableReminder = document.getElementById('enableReminder');
        const noteReminder = document.getElementById('noteReminder');
        
        enableReminder.addEventListener('change', () => {
            toggleReminderField();
        });
        
        // Initialize reminder field state
        toggleReminderField();
    });

    // Clear All Functions
    function showConfirmationDialog(message, callback) {
        const template = document.getElementById('confirmation-template');
        const dialog = template.content.cloneNode(true);
        
        // Update the main message
        dialog.querySelector('.confirmation-header p').textContent = message;
        
        // Show subtext only for notes clear all
        const subtext = dialog.querySelector('.confirmation-header .subtext');
        if (message.includes('tasks')) {
            subtext.style.display = 'none'; // Hide subtext for tasks
        } else {
            subtext.style.display = 'block'; // Show subtext for notes
        }
        
        document.body.appendChild(dialog);
        
        const confirmationElement = document.querySelector('.confirmation-dialog');
        
        // Add initial animation state
        confirmationElement.style.opacity = '0';
        confirmationElement.querySelector('.confirmation-content').style.transform = 'scale(0.95) translateY(10px)';
        
        // Animate in
        requestAnimationFrame(() => {
            confirmationElement.style.opacity = '1';
            confirmationElement.querySelector('.confirmation-content').style.transform = 'scale(1) translateY(0)';
        });
        
        // Handle confirm
        confirmationElement.querySelector('.confirm-btn').addEventListener('click', () => {
            // Animate out
            confirmationElement.style.opacity = '0';
            confirmationElement.querySelector('.confirmation-content').style.transform = 'scale(0.95) translateY(10px)';
            // Play clear all sound immediately
        audio.clearAll.currentTime = 0.6;
        audio.clearAll.play().catch(error => {
            console.error('Error playing clear all sound:', error);
        });
            
            setTimeout(() => {
                confirmationElement.remove();
                callback(true);
            }, 200);
        });
        
        // Handle cancel
        confirmationElement.querySelector('.cancel-btn').addEventListener('click', () => {
            // Animate out
            confirmationElement.style.opacity = '0';
            confirmationElement.querySelector('.confirmation-content').style.transform = 'scale(0.95) translateY(10px)';
            
            setTimeout(() => {
                confirmationElement.remove();
                callback(false);
            }, 200);
        });
    }

     // Expose clear functions to global scope
     window.clearAllNotes = clearAllNotes;
     window.clearAllTasks = clearAllTasks;

    function clearAllNotes() {
        
        showConfirmationDialog('Are you sure you want to delete all notes?', (confirmed) => {
            if (confirmed) {
                notes = [];
                StorageService.saveNotes();
                displayNotes();
            } else {
                // Stop sound if user cancels
                audio.clearAll.pause();
                audio.clearAll.currentTime = 0;
            }
        });
    }

    function clearAllTasks() {
        
        showConfirmationDialog('Are you sure you want to delete all tasks?', (confirmed) => {
            if (confirmed) {
                tasks = [];
                StorageService.saveTasks();
                displayTasks();
            } else {
                // Stop sound if user cancels
                audio.clearAll.pause();
                audio.clearAll.currentTime = 0;
            }
        });
    }

    // Initialize event listeners
    function initEventListeners() {
        DOM.noteForm.addEventListener('submit', handleNoteSubmit);
        DOM.taskForm.addEventListener('submit', handleTaskSubmit);
        DOM.enableReminder.addEventListener('change', toggleReminderField);
        DOM.themeToggle.addEventListener('click', handleThemeToggle);
        
        // Add input event listener for reminder datetime validation
        DOM.noteReminder.addEventListener('input', (e) => {
            const selectedDate = new Date(e.target.value);
            const now = new Date();
            
            if (selectedDate <= now) {
                e.target.setCustomValidity('Please select a future time');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    // Initial Setup
    function initializeApp() {
        // Set initial theme from storage
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Initialize UI components
        toggleReminderField();
        displayNotes();
        displayTasks();
        
        // Set up event listeners
        initEventListeners();
        
        // Start background processes
        setInterval(checkReminders, 1000);
        setInterval(updateProgressBars, 1000);
        
        // Add clear cache button event listener
        document.querySelector('.clear-cache-btn')?.addEventListener('click', clearCache);
    }

    // Drag and Drop Functions
    let dragStartIndex;

    function handleDragStart(e) {
        dragStartIndex = +this.dataset.index;
        this.classList.add('dragging');
        setTimeout(() => this.classList.add('ghost'), 0);
    }

    function handleDragOver(e) {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const dropTarget = getDropTarget(e.clientY);
        
        if (dropTarget) {
            const rect = dropTarget.getBoundingClientRect();
            const offset = e.clientY - rect.top;
            const middle = rect.height / 2;
            
            dropTarget.classList.remove('drop-target-above', 'drop-target-below');
            dropTarget.classList.add(offset < middle ? 'drop-target-above' : 'drop-target-below');
        }
    }

    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drop-target');
    }

    function handleDragLeave() {
        this.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
    }

    function handleDrop() {
        const dragEndIndex = +this.dataset.index;
        swapTasks(dragStartIndex, dragEndIndex);
        this.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
    }

    function handleDragEnd() {
        this.classList.remove('dragging', 'ghost');
        displayTasks(); // Refresh to clear any drop target styles
    }

    function getDropTarget(y) {
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

    function swapTasks(fromIndex, toIndex) {
        const taskToMove = tasks[fromIndex];
        tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, taskToMove);
        StorageService.saveTasks();
    }

    // Start the application
    initializeApp();

    /**
     * Handles theme toggle functionality
     */
    function handleThemeToggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Play appropriate sound effect first
        const sound = newTheme === 'dark' ? audio.switchOff : audio.switchOn;
        sound.currentTime = 0; // Rewind to start
        sound.play().catch(error => {
            console.error('Error playing theme switch sound:', error);
        });
        
        // Update theme after sound starts
        setTimeout(() => {
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }, 130);
    }

    // Update the interval to only update when needed
    function updateProgressBars() {
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach(bar => {
            const noteElement = bar.closest('.note-card');
            if (noteElement && noteElement.hasAttribute('data-progress')) {
                const reminderInfo = noteElement.querySelector('.reminder-info');
                if (reminderInfo) {
                    const reminderStatus = reminderInfo.querySelector('.reminder-status');
                    const now = Date.now();
                    const reminder = parseInt(noteElement.getAttribute('data-reminder-time'));
                    const created = parseInt(noteElement.getAttribute('data-created-time'));
                    
                    const totalTime = reminder - created;
                    const elapsedTime = now - created;
                    const progress = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
                    const isComplete = now >= reminder;
                    
                    // Update progress bar without affecting the card
                    bar.style.width = `${progress}%`;
                    bar.classList.toggle('complete', isComplete);
                    
                    // Update reminder status text
                    const timeLeft = reminder - now;
                    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const timeDisplay = hoursLeft + minutesLeft <= 0 
                        ? 'less than a minute' 
                        : `${hoursLeft}h ${minutesLeft}m`;
                    
                    reminderStatus.textContent = isComplete ? 'Reminder Alerted' : `Reminding in ${timeDisplay}`;
                }
            }
        });
    }

    // Update progress bars every second without causing reflow
    setInterval(updateProgressBars, 1000);

    function deleteTask(taskId) {
        const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
        if (taskElement) {
            // Add fade-out class
            taskElement.classList.add('fade-out');
            
            // Wait for animation to complete before removing
            taskElement.addEventListener('animationend', () => {
                tasks = tasks.filter(task => task.id !== taskId);
                StorageService.saveTasks();
                displayTasks();
            }, { once: true });
        }
    }

    function clearCache() {
        if (confirm('Are you sure you want to clear all app data? This will remove all notes and tasks.')) {
            localStorage.clear();
            notes = [];
            tasks = [];
            StorageService.saveNotes();
            StorageService.saveTasks();
            displayNotes();
            displayTasks();
            location.reload(); // Refresh to ensure clean state
        }
    }
});
