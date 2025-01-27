@echo off
setlocal enabledelayedexpansion

:: ----------------------------------------------------------------------------
:: Purple Notes Startup Script
:: 
:: This script handles:
:: 1. Dependency installation (if needed)
:: 2. Starting the development server
:: 3. Browser selection and app mode configuration
:: 4. Automatic server cleanup when browser closes
::
:: Usage:
:: - Run this script to start the Purple Notes application
:: - Follow prompts to select browser and mode
:: ----------------------------------------------------------------------------

:: Check and install dependencies if needed
echo Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

:: Kill any existing node processes
echo Closing any existing servers...
taskkill /F /IM node.exe >nul 2>&1

:: Start the development server in background
echo Starting Purple Notes...
start "Server" /B npm run dev
timeout /t 5 >nul

:: ----------------------------------------------------------------------------
:: App Mode Configuration
::
:: Users can choose to run in app mode (browser without UI) or default mode
:: Supported browsers: Brave, Chrome, Edge, Opera GX, or custom browser
:: ----------------------------------------------------------------------------
echo Default behavior is to open in your default browser.
set /p "USE_APP_MODE=Do you want to use app mode? (y/n): "

if /i "!USE_APP_MODE!"=="y" (
    echo Available browsers for app mode:
    echo 1. Brave
    echo 2. Chrome
    echo 3. Edge
    echo 4. Opera GX
    echo 5. Custom browser
    set /p "BROWSER_CHOICE=Enter the number of your preferred browser: "
    
    :: Clean up user input by trimming spaces
    for /f "tokens=*" %%a in ("!BROWSER_CHOICE!") do set BROWSER_CHOICE=%%a
    
    :: Set browser paths based on user selection
    if !BROWSER_CHOICE! equ 1 (
        set "BROWSER_PATH=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
        set "BROWSER_NAME=Brave"
    ) else if !BROWSER_CHOICE! equ 2 (
        set "BROWSER_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
        set "BROWSER_NAME=Chrome"
    ) else if !BROWSER_CHOICE! equ 3 (
        set "BROWSER_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        set "BROWSER_NAME=Edge"
    ) else if !BROWSER_CHOICE! equ 4 (
        set "BROWSER_PATH=C:\Users\Haikal\AppData\Local\Programs\Opera GX\launcher.exe"
        set "BROWSER_NAME=Opera GX"
    ) else if !BROWSER_CHOICE! equ 5 (
        set /p "BROWSER_PATH=Enter the full path to the browser executable: "
        set /p "BROWSER_NAME=Enter the browser name: "
    ) else (
        echo Invalid choice. Opening in default browser.
        goto DEFAULT_BROWSER
    )
    
    :: Verify selected browser exists
    if not exist "!BROWSER_PATH!" (
        echo Browser not found at: !BROWSER_PATH!
        echo Opening in default browser instead.
        goto DEFAULT_BROWSER
    )
    
    :: Launch browser in app mode
    echo Opening in !BROWSER_NAME! app mode...
    start "" "!BROWSER_PATH!" --app="http://localhost:5500"
    timeout /t 2 >nul
    
    :: Hide the terminal window
    powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::EnableVisualStyles(); $window = (Get-Process -Id $PID).MainWindowHandle; [System.Windows.Forms.NativeWindow]::FromHandle($window).Hide()"

    :: Get browser process ID for cleanup
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq brave.exe" /FO LIST ^| find "PID:"') do set BROWSER_PID=%%a
    if not defined BROWSER_PID (
        echo Could not detect browser process ID.
        goto DEFAULT_BROWSER
    )
    
    :: Wait for browser to close
    echo Waiting for !BROWSER_NAME! to close...
    :WAIT_LOOP
    timeout /t 1 >nul
    tasklist /FI "PID eq !BROWSER_PID!" 2>nul | find "!BROWSER_PID!" >nul
    if !errorlevel! equ 0 goto WAIT_LOOP
    
    :: Cleanup server process
    echo Closing server...
    taskkill /F /IM node.exe >nul 2>&1
    exit /b
)

:: ----------------------------------------------------------------------------
:: Default Browser Mode
::
:: Opens application in user's default browser and handles cleanup
:: ----------------------------------------------------------------------------
:DEFAULT_BROWSER
echo Opening in default browser...
start "" "http://localhost:5500"

:: Hide the terminal window
powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::EnableVisualStyles(); $window = (Get-Process -Id $PID).MainWindowHandle; [System.Windows.Forms.NativeWindow]::FromHandle($window).Hide()"

:: Wait for default browser to close
echo Waiting for browser to close...
:WAIT_LOOP_DEFAULT
timeout /t 1 >nul
tasklist /FI "WINDOWTITLE eq localhost:5500" 2>nul | find "localhost:5500" >nul
if !errorlevel! equ 0 goto WAIT_LOOP_DEFAULT

:: Cleanup server process
echo Closing server...
taskkill /F /IM node.exe >nul 2>&1