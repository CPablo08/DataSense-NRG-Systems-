#!/bin/bash

# NRG DataSense Platform - Complete Startup Script
# This script starts all components: Backend, Frontend, and Local Client

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=3000
API_URL="http://localhost:${BACKEND_PORT}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

echo -e "${BLUE}🚀 NRG DataSense Platform - Complete Startup${NC}"
echo "=================================================="

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Function to install dependencies
install_dependencies() {
    local component=$1
    local requirements_file=$2
    
    echo -e "${BLUE}📦 Installing dependencies for $component...${NC}"
    
    if [ "$component" = "frontend" ]; then
        if [ ! -d "node_modules" ]; then
            npm install
            echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
        else
            echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
        fi
    elif [ "$component" = "backend" ]; then
        cd backend
        if [ ! -d "venv" ]; then
            python3 -m venv venv
            echo -e "${GREEN}✅ Virtual environment created${NC}"
        fi
        
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    elif [ "$component" = "local_client" ]; then
        if [ ! -d "local_client_venv" ]; then
            python3 -m venv local_client_venv
            echo -e "${GREEN}✅ Local client virtual environment created${NC}"
        fi
        
        source local_client_venv/bin/activate
        pip install -r local_client_requirements.txt
        deactivate
        echo -e "${GREEN}✅ Local client dependencies installed${NC}"
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🐍 Starting FastAPI Backend...${NC}"
    
    if ! check_port $BACKEND_PORT; then
        echo -e "${RED}❌ Backend port $BACKEND_PORT is already in use${NC}"
        echo -e "${YELLOW}💡 Try: lsof -ti:$BACKEND_PORT | xargs kill -9${NC}"
        return 1
    fi
    
    cd backend
    source venv/bin/activate
    
    # Start backend in background
    nohup python run.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service "$API_URL/health" "Backend"; then
        echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}⚛️  Starting React Frontend...${NC}"
    
    if ! check_port $FRONTEND_PORT; then
        echo -e "${RED}❌ Frontend port $FRONTEND_PORT is already in use${NC}"
        echo -e "${YELLOW}💡 Try: lsof -ti:$FRONTEND_PORT | xargs kill -9${NC}"
        return 1
    fi
    
    # Set environment variable for API URL
    export REACT_APP_API_URL=$API_URL
    
    # Start frontend in background
    nohup npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    
    # Wait for frontend to be ready
    if wait_for_service "$FRONTEND_URL" "Frontend"; then
        echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
        return 1
    fi
}

# Function to start local client
start_local_client() {
    echo -e "${BLUE}📧 Starting Local NRG Client...${NC}"
    
    # Check if config exists
    if [ ! -f "nrg_client_config.json" ]; then
        echo -e "${YELLOW}⚠️  No configuration file found. Creating default config...${NC}"
        python3 local_nrg_client.py &
        sleep 3
        pkill -f "local_nrg_client.py"
        echo -e "${GREEN}✅ Default configuration created. Please edit nrg_client_config.json${NC}"
        echo -e "${YELLOW}💡 Edit the configuration and run this script again${NC}"
        return 1
    fi
    
    # Start local client in background
    source local_client_venv/bin/activate
    nohup python local_nrg_client.py > local_client.log 2>&1 &
    LOCAL_CLIENT_PID=$!
    echo $LOCAL_CLIENT_PID > local_client.pid
    deactivate
    
    echo -e "${GREEN}✅ Local client started successfully (PID: $LOCAL_CLIENT_PID)${NC}"
    return 0
}

# Function to show status
show_status() {
    echo -e "\n${BLUE}📊 Platform Status:${NC}"
    echo "=================="
    
    # Check backend
    if [ -f "backend.pid" ] && kill -0 $(cat backend.pid) 2>/dev/null; then
        echo -e "${GREEN}✅ Backend: Running (PID: $(cat backend.pid))${NC}"
    else
        echo -e "${RED}❌ Backend: Not running${NC}"
    fi
    
    # Check frontend
    if [ -f "frontend.pid" ] && kill -0 $(cat frontend.pid) 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend: Running (PID: $(cat frontend.pid))${NC}"
    else
        echo -e "${RED}❌ Frontend: Not running${NC}"
    fi
    
    # Check local client
    if [ -f "local_client.pid" ] && kill -0 $(cat local_client.pid) 2>/dev/null; then
        echo -e "${GREEN}✅ Local Client: Running (PID: $(cat local_client.pid))${NC}"
    else
        echo -e "${RED}❌ Local Client: Not running${NC}"
    fi
    
    echo -e "\n${BLUE}🌐 Access URLs:${NC}"
    echo "==============="
    echo -e "${GREEN}Frontend:${NC} $FRONTEND_URL"
    echo -e "${GREEN}Backend API:${NC} $API_URL"
    echo -e "${GREEN}Health Check:${NC} $API_URL/health"
    
    echo -e "\n${BLUE}📋 Log Files:${NC}"
    echo "============="
    echo -e "${GREEN}Backend:${NC} backend.log"
    echo -e "${GREEN}Frontend:${NC} frontend.log"
    echo -e "${GREEN}Local Client:${NC} local_client.log"
}

# Function to stop all services
stop_all() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    # Stop backend
    if [ -f "backend.pid" ]; then
        kill $(cat backend.pid) 2>/dev/null || true
        rm -f backend.pid
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    # Stop frontend
    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null || true
        rm -f frontend.pid
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    
    # Stop local client
    if [ -f "local_client.pid" ]; then
        kill $(cat local_client.pid) 2>/dev/null || true
        rm -f local_client.pid
        echo -e "${GREEN}✅ Local client stopped${NC}"
    fi
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Function to show logs
show_logs() {
    local service=$1
    
    case $service in
        "backend")
            if [ -f "backend.log" ]; then
                tail -f backend.log
            else
                echo -e "${RED}❌ Backend log file not found${NC}"
            fi
            ;;
        "frontend")
            if [ -f "frontend.log" ]; then
                tail -f frontend.log
            else
                echo -e "${RED}❌ Frontend log file not found${NC}"
            fi
            ;;
        "local_client")
            if [ -f "local_client.log" ]; then
                tail -f local_client.log
            else
                echo -e "${RED}❌ Local client log file not found${NC}"
            fi
            ;;
        *)
            echo -e "${RED}❌ Unknown service: $service${NC}"
            echo "Usage: $0 logs [backend|frontend|local_client]"
            ;;
    esac
}

# Main script logic
case "${1:-start}" in
    "start")
        echo -e "${BLUE}🔧 Installing dependencies...${NC}"
        install_dependencies "frontend" "package.json"
        install_dependencies "backend" "backend/requirements.txt"
        install_dependencies "local_client" "local_client_requirements.txt"
        
        echo -e "\n${BLUE}🚀 Starting services...${NC}"
        
        # Start backend first
        if start_backend; then
            # Start frontend
            if start_frontend; then
                # Start local client
                if start_local_client; then
                    echo -e "\n${GREEN}🎉 All services started successfully!${NC}"
                    show_status
                else
                    echo -e "\n${YELLOW}⚠️  Local client failed to start${NC}"
                    show_status
                fi
            else
                echo -e "\n${RED}❌ Frontend failed to start${NC}"
                stop_all
                exit 1
            fi
        else
            echo -e "\n${RED}❌ Backend failed to start${NC}"
            exit 1
        fi
        ;;
    
    "stop")
        stop_all
        ;;
    
    "restart")
        stop_all
        sleep 2
        $0 start
        ;;
    
    "status")
        show_status
        ;;
    
    "logs")
        show_logs $2
        ;;
    
    "deploy")
        echo -e "${BLUE}🚀 Deploying to Render...${NC}"
        echo "1. Push changes to GitHub"
        echo "2. Go to https://render.com"
        echo "3. Create new Blueprint"
        echo "4. Connect your repository"
        echo "5. Deploy!"
        echo ""
        echo -e "${GREEN}✅ Deployment instructions sent to console${NC}"
        ;;
    
    *)
        echo -e "${BLUE}NRG DataSense Platform - Startup Script${NC}"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start     - Start all services (default)"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  status    - Show service status"
        echo "  logs      - Show logs (backend|frontend|local_client)"
        echo "  deploy    - Show deployment instructions"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs backend"
        echo "  $0 status"
        ;;
esac
