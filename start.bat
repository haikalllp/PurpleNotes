@echo off
echo Installing dependencies...
npm install

echo Starting Purple Notes...
start http://localhost:5500
npm run dev