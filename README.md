# Purple Notes

A browser-based notes and tasks application with reminders and theme support.

## How to Run the Application

### Method 1: Using VS Code Live Server (Recommended)
1. Install the "Live Server" extension in VS Code
   - Click the Extensions icon in the sidebar
   - Search for "Live Server"
   - Install "Live Server" by Ritwick Dey

2. Open with Live Server
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - The app will open in your default browser at `http://127.0.0.1:5500`

### Method 2: Using any Local Server
You can use any of these methods to serve the application:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx live-server

# Using PHP
php -S localhost:8000
```

Then open your browser to the corresponding localhost address.

## Important Note
Due to browser security restrictions on ES modules, the application must be served through a web server. Opening the `index.html` file directly in a browser will not work.

## Features
- Create and manage notes with reminders
- Create and organize tasks with drag-and-drop
- Light and dark theme support
- Data persistence using localStorage
- Responsive design for all devices

## Browser Support
- Chrome (Latest)
- Firefox (Latest)
- Edge (Latest)
- Safari (Latest)

## Keyboard Shortcuts
- `Ctrl/Cmd + N`: Focus note input
- `Ctrl/Cmd + T`: Focus task input
- `Escape`: Close dialogs