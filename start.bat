@echo off
setlocal enabledelayedexpansion

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

:: Ask user if they want to use app mode
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
    
    :: Trim leading/trailing spaces from input
    for /f "tokens=*" %%a in ("!BROWSER_CHOICE!") do set BROWSER_CHOICE=%%a
    
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
    
    :: Verify browser path exists
    if not exist "!BROWSER_PATH!" (
        echo Browser not found at: !BROWSER_PATH!
        echo Opening in default browser instead.
        goto DEFAULT_BROWSER
    )
    
    echo Opening in !BROWSER_NAME! app mode...
    start "" "!BROWSER_PATH!" --app="http://localhost:5500"
    timeout /t 2 >nul
    exit /b
)

:DEFAULT_BROWSER
echo Opening in default browser...
start "" "http://localhost:5500"