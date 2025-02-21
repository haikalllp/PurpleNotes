import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = 5500;
const CUSTOM_BROWSERS_FILE = 'custom_browsers.txt';

// Initialize custom browsers file if it doesn't exist
if (!existsSync(CUSTOM_BROWSERS_FILE)) {
    writeFileSync(CUSTOM_BROWSERS_FILE, '');
}

// Helper function to run commands
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { stdio: 'inherit', shell: true });
        process.on('close', code => code === 0 ? resolve() : reject(`Command failed with code ${code}`));
    });
}

// Helper function to kill existing Node processes (Windows-compatible)
async function killExistingServers() {
    try {
        const currentPid = process.pid;

        // Use PowerShell to kill processes
        const command = `Get-Process node | Where-Object { $_.Id -ne ${currentPid} } | Stop-Process -Force`;
        const childProcess = spawn('powershell.exe', ['-Command', command], {
            stdio: 'pipe',
            shell: true
        });

        // Log PowerShell output
        childProcess.stdout.on('data', (data) => {
            console.log(`PowerShell stdout: ${data}`);
        });

        childProcess.stderr.on('data', (data) => {
            console.error(`PowerShell stderr: ${data}`);
        });

        await new Promise((resolve, reject) => {
            childProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(`PowerShell exited with code ${code}`);
                }
            });
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        console.warn('Warning: Failed to kill existing servers:', error);
    }
}

// Helper function to get custom browsers
function getCustomBrowsers() {
    if (!existsSync(CUSTOM_BROWSERS_FILE)) return [];
    const content = readFileSync(CUSTOM_BROWSERS_FILE, 'utf8');
    return content.split('\n')
        .filter(line => line.trim())
        .map(line => {
            const [path, name, process] = line.split('|');
            return { path: path.replace(/\"/g, ''), name, process };
        });
}

// Helper function to add new browser
function addNewBrowser(browserPath, browserName) {
    const processName = browserPath.split('\\').pop();
    const entry = `"${browserPath}"|${browserName}|${processName}`;
    writeFileSync(CUSTOM_BROWSERS_FILE, `${entry}\n`, { flag: 'a' });
    return { path: browserPath, name: browserName, process: processName };
}

// Helper function to launch browser
function launchBrowser(browserPath, appMode = false) {
    const url = `http://localhost:${PORT}`;
    const args = appMode ? ['--app=' + url] : [url];
    spawn(browserPath, args, { stdio: 'inherit', shell: true });
}

// Main function
async function main() {
    try {
        // Check dependencies
        if (!existsSync('node_modules')) {
            console.log('Installing dependencies...');
            await runCommand('npm.cmd', ['install']);
        }

        // Kill existing servers
        await killExistingServers();

        // Start development server
        console.log('Starting Purple Notes...');
        const server = spawn('npm.cmd', ['run', 'dev', '--', '--no-browser'], {
            stdio: 'pipe', // Prevents new terminal window
            shell: true,
            windowsHide: true,
            cwd: __dirname
        });

        // Log server output
        server.stdout.on('data', (data) => {
            console.log(`Server: ${data}`);
        });

        server.stderr.on('data', (data) => {
            console.error(`Server error: ${data}`);
        });

        server.on('error', (error) => {
            console.error('Failed to start server:', error);
            process.exit(1);
        });

        server.unref();

        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Prompt for app mode
        const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const appMode = await new Promise(resolve => {
            readline.question('Do you want to use app mode? (Y/N): ', answer => {
                resolve(answer.toLowerCase() === 'y');
            });
        });

        if (appMode) {
            const browsers = getCustomBrowsers();
            if (browsers.length > 0) {
                console.log('\nAvailable custom browsers:');
                browsers.forEach((browser, index) => {
                    console.log(`${index + 1}. ${browser.name}`);
                });
                console.log('N. Add new browser');

                const choice = await new Promise(resolve => {
                    readline.question('Enter the number of your browser or \'N\' for new: ', answer => {
                        resolve(answer);
                    });
                });

                if (choice.toLowerCase() === 'n') {
                    const browserPath = await new Promise(resolve => {
                        readline.question('Enter the full path to the browser executable: ', answer => {
                            resolve(answer);
                        });
                    });

                    const browserName = await new Promise(resolve => {
                        readline.question('Enter the browser\'s display name: ', answer => {
                            resolve(answer);
                        });
                    });

                    const browser = addNewBrowser(browserPath, browserName);
                    launchBrowser(browser.path, true);
                } else {
                    const index = parseInt(choice) - 1;
                    if (index >= 0 && index < browsers.length) {
                        launchBrowser(browsers[index].path, true);
                    } else {
                        console.log('Invalid browser selection. Opening in default browser...');
                        launchBrowser('start', false);
                    }
                }
            } else {
                const browserPath = await new Promise(resolve => {
                    readline.question('No browsers configured. Enter the full path to the browser executable: ', answer => {
                        resolve(answer);
                    });
                });

                const browserName = await new Promise(resolve => {
                    readline.question('Enter the browser\'s display name: ', answer => {
                        resolve(answer);
                    });
                });

                const browser = addNewBrowser(browserPath, browserName);
                launchBrowser(browser.path, true);
            }
        } else {
            launchBrowser('start', false);
        }

        readline.close();
        process.stdin.resume();
        console.log('\nPress Ctrl+C to exit...');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();