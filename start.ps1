# Mini PMS - Start Script (PowerShell)
# This script starts both the backend and frontend servers

Write-Host "Starting Mini PMS..." -ForegroundColor Cyan
Write-Host ""

# Get the directory where the script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend setup
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Set-Location "$ScriptDir\mini-pms-backend"

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
pip install -r requirements.txt -q

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
python manage.py migrate --run-syncdb

# Start backend in a new window
Write-Host "Starting Backend on http://localhost:8000" -ForegroundColor Green
$backendJob = Start-Process -FilePath "python" -ArgumentList "manage.py runserver 8000" -PassThru -NoNewWindow

# Frontend setup
Write-Host ""
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
Set-Location "$ScriptDir\mini-pms-frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

# Start frontend in a new window
Write-Host "Starting Frontend on http://localhost:5173" -ForegroundColor Green
$frontendJob = Start-Process -FilePath "npm" -ArgumentList "run dev" -PassThru -NoNewWindow

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "Mini PMS is running!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Green
Write-Host "GraphQL:  " -NoNewline; Write-Host "http://localhost:8000/graphql/" -ForegroundColor Green
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
