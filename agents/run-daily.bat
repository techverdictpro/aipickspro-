@echo off
REM ============================================================
REM run-daily.bat — 09:00 pipeline (stats + writing + publishing)
REM Called by Windows Task Scheduler.
REM ============================================================
cd /d "C:\Users\Admin\aipickspro-\agents"
"C:\Program Files\nodejs\node.exe" daily-run.js >> "logs\scheduler.log" 2>&1
exit /b %errorlevel%
