# Purple Notes

A browser-based notes and tasks application with reminders and theme support.

## Quick Start

1. **Automatic Start (Recommended)**
   - Double-click `start.bat`
   - The application will install dependencies and open automatically

2. **Manual Start**

   ```bash
   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

## Features

- Create and manage notes with reminders
- Create and organize tasks with drag-and-drop
- Light and dark theme support
- Data persistence using localStorage
- Responsive design for all devices

## Development Setup

### Prerequisites

- Node.js and npm installed
- Modern web browser (Chrome, Firefox, Edge, or Safari)

### Available Scripts

- `npm run dev` - Starts the development server with auto-reload
- `npm start` - Starts the server without opening browser

### Project Structure

purple-notes/
├── src/
│   ├── components/     # UI components
│   ├── models/        # Data models
│   ├── services/      # Application services
│   └── utils/         # Utility functions
├── styles.css         # Global styles
├── app.js            # Application entry point
└── index.html        # Main HTML file

```
## Alternative Run Methods

### Using VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Using Python HTTP Server
```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

## Browser Support

- Chrome (Latest)
- Brave (Latest)
- Edge (Latest)
- OperaGX (Latest)

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: Focus note input
- `Ctrl/Cmd + T`: Focus task input
- `Escape`: Close dialogs

## Important Notes

- The application requires a local server due to ES module restrictions
- Data is stored in browser's localStorage
- Clear cache to reset all data

## Troubleshooting

### Common Issues

1. **Module loading errors**
   - Ensure you're running through a local server
   - Don't open index.html directly in browser

2. **Data not persisting**
   - Check if localStorage is enabled
   - Ensure you're not in private/incognito mode

3. **Server already in use**
   - Check if another server is running on port 5500
   - Close other instances or use a different port

For more detailed information, see howToRun.html in the project directory.
