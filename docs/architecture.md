# Purple Notes Architecture

## Overview

Purple Notes is a modern, modular web application for managing notes and tasks, built with vanilla JavaScript using ES modules.

## Core Architecture

### Data Layer

- **Models**: Note and Task entities
- **Services**: Storage, Audio, and Notification handling
- **State Management**: Local storage persistence

### Styles Organization

```
styles/
├── base/
│   ├── variables.css   # Theme variables and custom properties
│   ├── reset.css       # Base resets and normalizations
│   └── utils.css       # Shared utilities and animations
├── layout/
│   ├── grid.css       # Layout grid system
│   ├── header.css     # Header component styles
│   └── footer.css     # Footer component styles
└── components/
    ├── forms.css      # Form elements and controls
    ├── notes.css      # Note cards and interactions
    ├── tasks.css      # Task list and interactions
    └── dialogs.css    # Notifications and modals
```

### Components

```
src/
├── components/
│   ├── notes/          # Notes related components
│   │   ├── NoteForm    # Note creation component
│   │   ├── NoteCard    # Individual note display
│   │   └── NoteList    # Notes collection manager
│   └── tasks/          # Tasks related components
│       ├── TaskForm    # Task creation component
│       ├── TaskItem    # Individual task display
│       └── TaskList    # Tasks collection manager
├── models/             # Data models
├── services/           # Core services
└── utils/             # Utility functions
```

## Key Features

### Notes System
- Rich text notes with titles
- Reminder functionality
- Pin/unpin capability
- Local storage persistence

### Tasks System
- Todo list management
- Drag-and-drop reordering
- Completion tracking
- Visual feedback

### Theme System
- Light/dark mode support
- System preference detection
- Smooth transitions
- Theme persistence
- CSS custom properties for theming

### Notifications
- Reminder notifications
- Sound effects
- Visual feedback
- Timer management

## Technical Decisions

### CSS Architecture
- Modular CSS organization
- Component-based styling
- Shared utilities and animations
- CSS custom properties for theming
- Mobile-first responsive design
- Performance optimizations

### ES Modules
- Native browser modules
- No build step required
- Clear dependency management
- Code splitting

### Local Server Requirement
- Required for ES modules
- Multiple run options:
  - npm live-server
  - VS Code Live Server
  - Python HTTP server

### State Management
- Local storage for persistence
- In-memory state for performance
- Event-based updates
- Clean state initialization

## File Structure

```
purple-notes/
├── src/               # Source code
│   ├── components/    # UI components
│   ├── models/       # Data models
│   ├── services/     # Core services
│   └── utils/        # Utility functions
├── styles/           # Modular CSS files
│   ├── base/         # Base styles
│   ├── layout/       # Layout components
│   ├── components/   # Component styles
│   └── main.css      # CSS entry point
├── docs/             # Documentation
├── sounds/           # Audio assets
├── icons/            # Visual assets
├── app.js           # Application entry
├── index.html       # Main HTML
└── package.json     # Project config
```

## Component Communication
- Event-driven architecture
- Callback-based updates
- Service-based state management
- DOM event delegation

## Data Flow
1. User interactions trigger component handlers
2. Components communicate with models
3. Models update through services
4. Services emit events
5. Components react to events

## Style Organization

### Base Styles
- Variables (CSS custom properties)
- Reset and normalization
- Utility classes
- Shared animations

### Layout Components
- Grid system
- Header layout
- Footer layout
- Responsive containers

### UI Components
- Forms and inputs
- Note cards
- Task items
- Dialog modals

### Responsive Design
- Mobile-first approach
- Breakpoint management
- Flexible layouts
- Component adaptability

## Performance

### CSS Optimizations
- Modular file organization
- Efficient selectors
- Reduced specificity conflicts
- Hardware-accelerated animations
- Will-change optimizations

### JavaScript Performance
- Efficient DOM updates
- Event delegation
- Resource cleanup
- Memory leak prevention

## Browser Support
- Modern browsers (Chrome, Firefox, Edge, Safari)
- ES6+ features
- Local storage capability
- CSS Grid and Flexbox
- CSS Custom Properties

## Future Considerations
- PWA implementation
- Service worker
- Cloud sync
- Enhanced notifications
- CSS Module support
