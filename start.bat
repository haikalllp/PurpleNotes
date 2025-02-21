@echo off
setlocal enabledelayedexpansion

:: ----------------------------------------------------------------------------
:: Purple Notes Startup Script
::
:: This script handles:
:: 1. Dependency installation (if needed)
:: 2. Starting the development server
:: 3. Custom browser configuration and app mode
:: 4. Automatic server cleanup when browser closes
::
:: Usage:
:: - Run this script to start the Purple Notes application
:: - Follow prompts to select mode and configure browser
:: ----------------------------------------------------------------------------

:: Initialize custom browsers file if it doesn't exist
if not exist "custom_browsers.txt" (
    type nul > custom_browsers.txt
)

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
setlocal enabledelayedexpansion
choice /c yn /n /m "Do you want to use app mode? (Y/N): "
set choice=!errorlevel!
if !choice! equ 1 (
    echo Configuring app mode...
    goto :APP_MODE
) else (
    echo Opening in default browser mode...
    goto :DEFAULT_BROWSER
)

:APP_MODE
:: App Mode - Custom Browser Configuration
echo.
echo Custom Browser Configuration:
echo.

:: Display existing custom browsers if any
set "BROWSER_COUNT=0"
echo Available custom browsers:
for /f "usebackq tokens=1,2,3 delims=|" %%a in ("custom_browsers.txt") do (
    set /a BROWSER_COUNT+=1
    echo !BROWSER_COUNT!. %%~b
)

if !BROWSER_COUNT! gtr 0 (
    echo.
    echo N. Add new browser
    set /p "BROWSER_CHOICE=Enter the number of your browser or 'N' for new: "
    
    if /i "!BROWSER_CHOICE!"=="N" goto ADD_NEW_BROWSER
    
    :: Validate numeric input
    set "IS_VALID=0"
    for /f "tokens=*" %%a in ('echo !BROWSER_CHOICE!^| findstr /r "^[1-9][0-9]*$"') do set IS_VALID=1
    if !IS_VALID! equ 0 (
        echo Invalid input. Please enter a number or 'N'.
        goto APP_MODE
    )
    
    :: Use existing browser
    set "CURRENT_COUNT=0"
    for /f "usebackq tokens=1,2,3 delims=|" %%a in ("custom_browsers.txt") do (
        set /a CURRENT_COUNT+=1
        if !CURRENT_COUNT! equ !BROWSER_CHOICE! (
            set "BROWSER_PATH=%%~a"
            set "BROWSER_NAME=%%~c"
            goto LAUNCH_APP
        )
    )
    
    echo Invalid browser number. Please try again.
    goto APP_MODE
)

:ADD_NEW_BROWSER
:: Add new browser
echo.
set /p "BROWSER_PATH=Enter the full path to the browser executable: "
set /p "BROWSER_NAME=Enter the browser's display name: "

:: Handle quotes in browser path
set "BROWSER_PATH=!BROWSER_PATH:"=!"

:: Automatically extract process name from path
for %%i in ("!BROWSER_PATH!") do set "BROWSER_PROCESS=%%~nxi"
echo Browser process detected as: !BROWSER_PROCESS!

:: Save to custom browsers file with proper path handling
>> custom_browsers.txt echo !BROWSER_PATH!^|!BROWSER_NAME!^|!BROWSER_PROCESS!

:: Use the newly added browser
set "BROWSER_NAME=!BROWSER_PROCESS!"

:LAUNCH_APP
:: Verify browser exists
if not exist "!BROWSER_PATH!" (
    echo Browser not found at: !BROWSER_PATH!
    echo Opening in default browser instead.
    goto DEFAULT_BROWSER
)

:: Count initial browser processes
for /f "tokens=* usebackq" %%a in (`tasklist /fi "imagename eq !BROWSER_PROCESS!" /nh ^| find /c /v ""`^) do set INITIAL_COUNT=%%a

:: Launch browser in app mode
echo Opening in app mode...
start "" "!BROWSER_PATH!" --app=http://localhost:5500

:: Monitor browser process
:WAIT_APP_CLOSE
timeout /t 2 >nul
for /f "tokens=* usebackq" %%a in (`tasklist /fi "imagename eq !BROWSER_PROCESS!" /nh ^| find /c /v ""`^) do set CURRENT_COUNT=%%a
if !CURRENT_COUNT! gtr !INITIAL_COUNT! goto WAIT_APP_CLOSE

:: Cleanup
goto CLEANUP

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

