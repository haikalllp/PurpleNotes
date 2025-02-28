---

title: "Recent Updates to Project Configuration"

---

## Introduction to Vite

As part of our ongoing efforts to enhance the development experience and improve build performance, we have migrated our project to use Vite as the build system. Vite offers a fast and optimized development environment, leveraging native ES modules and providing features such as hot module replacement out of the box.

## New Vite Configuration File

We have added a new Vite configuration file, `vite.config.js`, which is crucial for setting up the development server and configuring plugins. Below is the content of the newly added configuration file:

```javascript
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

### Configuration Details

- **Plugins**: The configuration includes the React plugin to enable JSX support.
- **Server Settings**: 
  - `allowedHosts`: Configured to allow connections from specific ngrok subdomains.
  - `cors`: CORS is enabled to facilitate cross-origin requests.
  - `port`: The development server runs on port 3500.
  - `host`: Set to 'localhost' for local development, with an option to use the network IP.
  - `strictPort`: Ensures the server does not start if the specified port is already in use.

## Impact on Development Workflow

The addition of the Vite configuration file significantly enhances our development workflow by:

- Providing a faster development server with hot module replacement, allowing for real-time updates without full page reloads.
- Simplifying the configuration of server settings, including CORS and allowed hosts, which is particularly useful for testing with services like ngrok.
- Streamlining the build process, resulting in improved performance and reduced build times.

With these changes, developers can expect a more efficient and enjoyable coding experience as we continue to build and expand our application.

For more detailed architecture information, see [docs/architecture.md](docs/architecture.md).