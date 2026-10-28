@echo off
echo Starting Trading Bot Fee Management System...
cd /d "%~dp0"

echo Building frontend if needed...
if not exist "dist\index.html" (
    call npm run build
)

echo Opening browser...
start http://localhost:5000

echo Starting Server on port 5000...
node server.js
pause
