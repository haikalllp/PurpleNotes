@echo off
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)
cd "%~dp0"
python server.py
pause
