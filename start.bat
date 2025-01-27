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

:: Check and install dependencies
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
timeout /t 2 >nul

:: Start the development server
echo Starting Purple Notes...
start "Purple Notes Server" /B npm run dev
timeout /t 3 >nul

:: Prompt for app mode
choice /c yn /n /m "Do you want to use app mode? (Y/N): "
if !errorlevel! equ 1 (
    :: App Mode Selection
    echo.
    echo Available browsers for app mode:
    echo 1. Brave
    echo 2. Chrome
    echo 3. Edge
    echo 4. Opera GX
    echo 5. Custom browser
    echo.
    set /p "BROWSER_CHOICE=Enter the number of your preferred browser: "

    :: Set browser configuration
    if "!BROWSER_CHOICE!"=="1" (
        set "BROWSER_PATH=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
        set "BROWSER_NAME=brave.exe"
    ) else if "!BROWSER_CHOICE!"=="2" (
        set "BROWSER_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
        set "BROWSER_NAME=chrome.exe"
    ) else if "!BROWSER_CHOICE!"=="3" (
        set "BROWSER_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        set "BROWSER_NAME=msedge.exe"
    ) else if "!BROWSER_CHOICE!"=="4" (
        set "BROWSER_PATH=C:\Users\Haikal\AppData\Local\Programs\Opera GX\launcher.exe"
        set "BROWSER_NAME=opera.exe"
    ) else if "!BROWSER_CHOICE!"=="5" (
        set /p "BROWSER_PATH=Enter the full path to the browser executable: "
        set /p "BROWSER_NAME=Enter the browser's process name (e.g., chrome.exe): "
    ) else (
        echo Invalid choice. Opening in default browser instead.
        goto DEFAULT_BROWSER
    )

    :: Verify browser exists
    if not exist "!BROWSER_PATH!" (
        echo Browser not found at: !BROWSER_PATH!
        echo Opening in default browser instead.
        goto DEFAULT_BROWSER
    )

    :: Count initial browser processes
    for /f "tokens=* usebackq" %%a in (`tasklist /FI "IMAGENAME eq !BROWSER_NAME!" /NH ^| find /c /v ""`) do set INITIAL_COUNT=%%a

    :: Launch browser in app mode
    echo Opening in app mode...
    start "" "!BROWSER_PATH!" --app=http://localhost:5500

    :: Monitor browser process
    :WAIT_APP_CLOSE
    timeout /t 2 >nul
    for /f "tokens=* usebackq" %%a in (`tasklist /FI "IMAGENAME eq !BROWSER_NAME!" /NH ^| find /c /v ""`) do set CURRENT_COUNT=%%a
    if !CURRENT_COUNT! gtr !INITIAL_COUNT! goto WAIT_APP_CLOSE

    :: Cleanup
    goto CLEANUP
)

:DEFAULT_BROWSER
:: Launch default browser
echo Opening in default browser...
start "" http://localhost:5500

:: Wait for browser to start
timeout /t 2 >nul

:: Monitor browser using optimized detection
:WAIT_DEFAULT_CLOSE
:: Quick check for window title (most reliable)
tasklist /v /fi "windowtitle eq localhost:5500*" 2>nul | find "localhost:5500" >nul
if !errorlevel! equ 0 (
    timeout /t 1 >nul
    goto WAIT_DEFAULT_CLOSE
)

:: Quick TCP connection check
netstat -ano | find ":5500" | find "ESTABLISHED" >nul
if !errorlevel! equ 0 (
    timeout /t 1 >nul
    goto WAIT_DEFAULT_CLOSE
)

:: Final verification (faster cleanup)
timeout /t 1 >nul
tasklist /v | find "localhost:5500" >nul
if !errorlevel! equ 0 goto WAIT_DEFAULT_CLOSE

:CLEANUP
:: Final cleanup and exit
echo Cleaning up server...
taskkill /F /IM node.exe >nul 2>&1
echo Server closed. Type 'exit' to close this window...

