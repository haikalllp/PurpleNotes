---

title: "Contributing to the Vite Configuration"

---

## Understanding the Vite Setup

This section provides an overview of the Vite configuration used in our project. The configuration file is located at `vite.config.js` and is essential for setting up the development environment.

The following is the current configuration:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [ // added to allow any ngrok subdomain
      '.ngrok-free.app',
      '.ngrok.io'
    ],
    cors: true, // Enable CORS
    port: 3500,
    host: 'localhost', // set to true to use network and open the local IP address
    strictPort: true
  }
})
```

### Key Configuration Options:

- **plugins**: This includes the React plugin for Vite, which is necessary for React applications.
- **server**: This section configures the development server.
  - **allowedHosts**: Specifies which hosts are allowed to connect to the server. This is particularly useful for ngrok subdomains.
  - **cors**: Enables Cross-Origin Resource Sharing.
  - **port**: Sets the port for the development server (default is 3500).
  - **host**: Configures the host for the server. Setting it to `true` allows access via the local network.
  - **strictPort**: Ensures that the server only runs on the specified port.

## Adding New Features

When adding new features to the project, ensure that your changes are compatible with the existing Vite configuration. Review the `vite.config.js` file to understand how your additions may affect the development server settings and plugin usage.

## Testing Changes

After making changes to the Vite configuration or adding new features, it's crucial to test your modifications. 

- Start the development server using the command:

```typescript
npm run dev
```

- Ensure that your local environment matches the Vite configuration in `vite.config.js`.

By following these guidelines, you can contribute effectively while maintaining consistency in our development practices.