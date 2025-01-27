# Purple Notes Architecture

## Overview
Purple Notes is a client-side web application for managing notes and tasks with features like reminders, drag-and-drop organization, and theme switching.

## Core Components

### Models
- **Note**: Represents a note with title, content, reminder settings, and pin status
- **Task**: Represents a task with text content and completion status

### Services
- **StorageService**: Handles local storage persistence for notes and tasks
- **NotificationService**: Manages reminder notifications and alerts
- **AudioService**: Controls sound effects throughout the application

### Utilities
- **DOMUtils**: Centralizes DOM manipulation and queries
- **ThemeUtils**: Manages theme switching and persistence

### Components

#### Notes
- **NoteForm**: Handles note creation with optional reminders
- **NoteList**: Manages the display and organization of notes
- **NoteCard**: Individual note display with actions (pin, delete)

#### Tasks  
- **TaskForm**: Handles task creation
- **TaskList**: Manages task display with drag-and-drop reordering
- **TaskItem**: Individual task with completion toggle and delete

#### Shared
- **ConfirmDialog**: Reusable confirmation dialog
- **LoadingSpinner**: Loading state indicator

## Data Flow
1. User interactions trigger component-level handlers
2. Components communicate with Models for data operations
3. Models use Services for persistence and notifications
4. Services emit events that Components listen to for updates

## Key Features

### Reminders
- Implemented through NotificationService
- Uses browser notifications
- Visual progress indicators
- Sound alerts

### Theme Switching
- Light/dark mode support
- Persisted preference
- Smooth transitions
- Custom CSS properties

### Drag and Drop
- Native HTML5 drag-and-drop API
- Visual feedback during dragging
- Optimistic updates
- Persisted ordering

## Technical Decisions

### CSS Architecture
- CSS custom properties for theming
- BEM-like naming convention
- Modular organization by component
- Responsive design with mobile-first approach

### JavaScript Architecture
- ES6 modules for code organization
- Event-driven communication
- Service-based architecture
- Progressive enhancement

### Performance Considerations
- Optimized animations
- Debounced event handlers
- Efficient DOM updates
- Local storage for persistence

## Future Considerations
- Potential PWA implementation
- Data sync capabilities
- Enhanced reminder options
- Additional theme choices