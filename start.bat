@echo off
echo Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo Starting Purple Notes...
start "Server" /B npm run dev
timeout /t 5 >nul

echo Attempting app mode launch...

:: Try Chromium-based browsers first
where brave.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Brave app mode...
    start "" "brave.exe" --app="http://localhost:5500"
    exit /b
)

where chrome.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Chrome app mode...
    start "" "chrome.exe" --app="http://localhost:5500"
    exit /b
)

where msedge.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Edge app mode...
    start "" "msedge.exe" --app="http://localhost:5500"
    exit /b
)

where opera_gx.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Opera GX app mode...
    start "" "opera_gx.exe" --app="http://localhost:5500"
    exit /b
)

:: Attempt app mode with default browser (may not work)
echo Attempting app mode with default browser...
start "" "http://localhost:5500" --app
timeout /t 2 >nul

:: Fallback to normal mode if app mode fails
tasklist /FI "WINDOWTITLE eq localhost:5500" 2>nul | find /I "localhost:5500" >nul
if %errorlevel% neq 0 (
    echo App mode not supported. Opening in normal mode...
    start "" "http://localhost:5500"
)