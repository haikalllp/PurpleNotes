# Purple Notes Architecture

## Overview

Purple Notes is a modern React application for managing notes and tasks, built with Vite as the build tool and bundler.

## Core Architecture

### Build System
- **Vite**: Fast development server and optimized production builds
- **ES Modules**: Native browser modules with tree-shaking
- **Hot Module Replacement**: Fast refresh during development

### Core Files
- **config.js**: Application-wide configuration and settings management
- **app.js**: Main React application entry point and component tree initialization
- **index.html**: Root HTML container for mounting the React application

### React Components

```
src/
├── react/
│   └── components/     # React UI components
│       ├── notes/      # Notes related components
│       │   ├── NoteForm   # Note creation component
│       │   ├── NoteCard   # Individual note display
│       │   └── NoteList   # Notes collection manager
│       └── tasks/      # Tasks related components
│           ├── TaskForm   # Task creation component
│           ├── TaskItem   # Individual task display
│           └── TaskList   # Tasks collection manager
|       ├── models/            # Data models
|       ├── services/          # Core services
|       └── utils/            # Utility functions
├── config          # application-wide configuration and settings management


### Data Layer
- **Models**: Note and Task entities
- **Services**: Storage, Audio, and Notification handling
- **State Management**: React state and local storage persistence

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

## Development Workflow

### Scripts
- `npm run dev`: Start development server with HMR
- `npm run build`: Create production build
- `npm run preview`: Preview production build locally

### Build Configuration
- Vite for development and production builds
- React plugin for JSX compilation
- CSS modules support
- Asset optimization

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

### React Architecture
- Functional components
- React Hooks for state management
- Component composition
- Props for component communication

### CSS Architecture
- Modular CSS organization
- Component-based styling
- Shared utilities and animations
- CSS custom properties for theming
- Mobile-first responsive design
- Performance optimizations

### Build System
- Vite for fast development
- Optimized production builds
- Asset optimization
- Code splitting

### State Management
- React state hooks
- Local storage for persistence
- Event-based updates
- Clean state initialization

## File Structure

```
purple-notes/
├── src/               # Source code
│   ├── react/         # React components
│       ├── components/   # UI components
│       ├── models/        # Data models
│       ├── services/      # Core services
│       └── utils/         # Utility functions
│   ├── config.js        # application-wide configuration and settings
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
- Props for parent-child communication
- Context for global state
- Custom hooks for shared logic
- Service-based state management

## Data Flow
1. User interactions trigger component handlers
2. Components update React state
3. State changes trigger re-renders
4. Services handle side effects
5. Components react to state changes

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

### React Optimizations
- Memo for expensive renders
- Callback memoization
- Code splitting
- Lazy loading

### CSS Optimizations
- Modular file organization
- Efficient selectors
- Reduced specificity conflicts
- Hardware-accelerated animations
- Will-change optimizations

### Build Optimizations
- Tree shaking
- Code splitting
- Asset optimization
- Caching strategies

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
- State management solutions
