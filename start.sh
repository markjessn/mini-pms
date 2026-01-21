#!/bin/bash

# Mini PMS - Start Script (Unix/Mac/Git Bash)
# This script starts both the backend and frontend servers

echo "Starting Mini PMS..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start backend
echo -e "${GREEN}Starting Backend...${NC}"
cd "$SCRIPT_DIR/mini-pms-backend"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    venv/Scripts/python.exe manage.py runserver 8000 &
else
    venv/bin/python manage.py runserver 8000 &
fi
BACKEND_PID=$!

# Start frontend
echo -e "${GREEN}Starting Frontend...${NC}"
cd "$SCRIPT_DIR/mini-pms-frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Mini PMS is running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Trap to kill both processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait
