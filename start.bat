@echo off
echo Installing dependencies...
call npm install

echo Starting Purple Notes...
start "" http://localhost:5500
npm run dev