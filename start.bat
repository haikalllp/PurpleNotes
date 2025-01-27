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

where msedge.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo Opening in Edge app mode...
    start "" msedge.exe --app=http://localhost:5500
    exit /b
)

echo Opening in default browser...
start "" http://localhost:5500