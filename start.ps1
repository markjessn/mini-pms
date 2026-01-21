# Mini PMS - Start Script (PowerShell)
# This script starts both the backend and frontend servers

Write-Host "Starting Mini PMS..." -ForegroundColor Cyan
Write-Host ""

# Get the directory where the script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = "$ScriptDir\mini-pms-backend"
$FrontendDir = "$ScriptDir\mini-pms-frontend"

# Start backend
Write-Host "Starting Backend..." -ForegroundColor Green
$backendJob = Start-Process -FilePath "$BackendDir\venv\Scripts\python.exe" -ArgumentList "manage.py runserver 8000" -WorkingDirectory $BackendDir -PassThru -NoNewWindow

# Start frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
$frontendJob = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $FrontendDir -PassThru -NoNewWindow

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Mini PMS is running!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1

        # Check if processes are still running
        if ($backendJob.HasExited -and $frontendJob.HasExited) {
            Write-Host "Both servers have stopped." -ForegroundColor Red
            break
        }
    }
}
finally {
    # Cleanup on exit
    Write-Host "`nStopping servers..." -ForegroundColor Yellow

    if (-not $backendJob.HasExited) {
        Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    }
    if (-not $frontendJob.HasExited) {
        Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Servers stopped." -ForegroundColor Green
}
