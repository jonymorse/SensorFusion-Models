@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

where forgecad.cmd >nul 2>nul
if errorlevel 1 (
  echo forgecad.cmd was not found on PATH.
  echo Make sure ForgeCAD is installed and available from the terminal.
  exit /b 1
)

echo Starting ForgeCAD Studio from:
echo   %ROOT%

start "ForgeCAD Studio" cmd /k "cd /d ""%ROOT%"" && forgecad.cmd studio ."

echo Waiting for the local ForgeCAD server...
timeout /t 3 >nul

start "" "http://127.0.0.1:5173/"

echo ForgeCAD should be opening in your browser now.
echo If it does not, open: http://127.0.0.1:5173/

endlocal
