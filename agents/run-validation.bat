@echo off
REM ============================================================
REM run-validation.bat — 07:00 validation (score finished matches)
REM Called by Windows Task Scheduler.
REM ============================================================
cd /d "C:\Users\Admin\aipickspro-\agents"
"C:\Program Files\nodejs\node.exe" validation-agent.js >> "logs\validation.log" 2>&1
exit /b %errorlevel%
