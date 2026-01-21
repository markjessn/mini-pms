#!/bin/bash

# Mini PMS - Start Script (Unix/Mac/Git Bash)
# This script starts both the backend and frontend servers

echo "Starting Mini PMS..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Backend setup
echo -e "${YELLOW}Setting up Backend...${NC}"
cd "$SCRIPT_DIR/mini-pms-backend"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python -m venv venv
fi

# Activate venv and install dependencies
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Check if requirements are installed
pip install -r requirements.txt -q

# Run migrations
echo -e "${YELLOW}Running migrations...${NC}"
python manage.py migrate --run-syncdb

# Start backend in background
echo -e "${GREEN}Starting Backend on http://localhost:8000${NC}"
python manage.py runserver 8000 &
BACKEND_PID=$!

# Frontend setup
echo ""
echo -e "${YELLOW}Setting up Frontend...${NC}"
cd "$SCRIPT_DIR/mini-pms-frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
fi

# Start frontend
echo -e "${GREEN}Starting Frontend on http://localhost:5173${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Mini PMS is running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "GraphQL:  ${GREEN}http://localhost:8000/graphql/${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Trap to kill both processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait
