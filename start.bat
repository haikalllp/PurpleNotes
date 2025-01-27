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
timeout /t 3 >nul

echo Attempting app mode launch...
where chrome.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Chrome app mode...
    start "" chrome.exe --app=http://localhost:5500
    exit /b
)

where brave.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Brave app mode...
    start "" brave.exe --app=http://localhost:5500
    exit /b
)

where msedge.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Edge app mode...
    start "" msedge.exe --app=http://localhost:5500
    exit /b
)

where opera_gx.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Opera GX app mode...
    start "" opera_gx.exe --app=http://localhost:5500
    exit /b
)

echo No supported browsers found for app mode.
echo Opening in default browser...
start "" -app=http://localhost:5500