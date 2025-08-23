#!/bin/bash

# NRG DataSense Platform - Complete Startup Script
# This script starts all components of the platform

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

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed. Please install pip3 first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to install frontend dependencies
install_frontend() {
    print_status "Installing frontend dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Frontend dependencies installed"
    else
        print_status "Frontend dependencies already installed"
    fi
}

# Function to install backend dependencies
install_backend() {
    print_status "Installing backend dependencies..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    cd ..
    print_success "Backend dependencies installed"
}

# Function to install local client dependencies
install_local_client() {
    print_status "Installing local client dependencies..."
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "local_client_venv" ]; then
        print_status "Creating Python virtual environment for local client..."
        python3 -m venv local_client_venv
    fi
    
    # Activate virtual environment
    source local_client_venv/bin/activate
    
    # Install dependencies
    pip install -r local_client_requirements.txt
    
    print_success "Local client dependencies installed"
}

# Function to start backend
start_backend() {
    print_status "Starting FastAPI backend..."
    
    # Kill any existing process on backend port
    kill_port $BACKEND_PORT
    
    cd backend
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Start backend in background
    nohup python run.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
            print_success "Backend started successfully on port $BACKEND_PORT"
            return 0
        fi
        sleep 1
    done
    
    print_error "Backend failed to start"
    exit 1
}

# Function to start frontend
start_frontend() {
    print_status "Starting React frontend..."
    
    # Kill any existing process on frontend port
    kill_port $FRONTEND_PORT
    
    # Set environment variable for API URL
    export REACT_APP_API_URL=$API_URL
    
    # Start frontend in background
    nohup npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
            print_success "Frontend started successfully on port $FRONTEND_PORT"
            return 0
        fi
        sleep 1
    done
    
    print_error "Frontend failed to start"
    exit 1
}

# Function to start local client
start_local_client() {
    print_status "Starting local NRG client..."
    
    # Check if config exists
    if [ ! -f "nrg_client_config.json" ]; then
        print_warning "Local client config not found. Creating default config..."
        create_default_config
    fi
    
    # Activate virtual environment
    source local_client_venv/bin/activate
    
    # Start local client in background
    nohup python local_nrg_client.py > local_client.log 2>&1 &
    LOCAL_CLIENT_PID=$!
    
    print_success "Local client started successfully"
}

# Function to create default config
create_default_config() {
    cat > nrg_client_config.json << EOF
{
  "email": {
    "server": "your_email_server.com",
    "username": "your_email@domain.com",
    "password": "your_password",
    "search_text": "SymphoniePRO Logger data attached.",
    "mail_folder": "INBOX",
    "file_extension": ".rld",
    "download_folder": "./downloads",
    "delete_emails": false,
    "store_password": false
  },
  "nrg": {
    "output_folder": "./converted",
    "file_filter": "000110"
  },
  "api_url": "http://localhost:5000",
  "monitor_interval": 300,
  "max_files_per_batch": 10
}
EOF
    print_warning "Please edit nrg_client_config.json with your email settings before starting the local client"
}

# Function to show status
show_status() {
    echo ""
    echo "=========================================="
    echo "🚀 NRG DataSense Platform Status"
    echo "=========================================="
    echo ""
    
    # Backend status
    if check_port $BACKEND_PORT; then
        echo -e "${GREEN}✅ Backend${NC}: Running on http://localhost:$BACKEND_PORT"
        curl -s http://localhost:$BACKEND_PORT/health | python3 -m json.tool 2>/dev/null || echo "  Health check available"
    else
        echo -e "${RED}❌ Backend${NC}: Not running"
    fi
    
    # Frontend status
    if check_port $FRONTEND_PORT; then
        echo -e "${GREEN}✅ Frontend${NC}: Running on http://localhost:$FRONTEND_PORT"
    else
        echo -e "${RED}❌ Frontend${NC}: Not running"
    fi
    
    # Local client status
    if pgrep -f "local_nrg_client.py" > /dev/null; then
        echo -e "${GREEN}✅ Local Client${NC}: Running"
    else
        echo -e "${RED}❌ Local Client${NC}: Not running"
    fi
    
    echo ""
    echo "📁 Log Files:"
    echo "  - Backend: backend.log"
    echo "  - Frontend: frontend.log"
    echo "  - Local Client: local_client.log"
    echo ""
    echo "🔧 Configuration:"
    echo "  - Local Client: nrg_client_config.json"
    echo ""
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    
    # Kill processes
    pkill -f "python run.py" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "local_nrg_client.py" 2>/dev/null || true
    
    # Kill processes on specific ports
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    print_success "All services stopped"
}

# Function to show logs
show_logs() {
    local service=$1
    
    case $service in
        "backend")
            if [ -f "backend.log" ]; then
                tail -f backend.log
            else
                print_error "Backend log file not found"
            fi
            ;;
        "frontend")
            if [ -f "frontend.log" ]; then
                tail -f frontend.log
            else
                print_error "Frontend log file not found"
            fi
            ;;
        "local")
            if [ -f "local_client.log" ]; then
                tail -f local_client.log
            else
                print_error "Local client log file not found"
            fi
            ;;
        *)
            print_error "Invalid service. Use: backend, frontend, or local"
            ;;
    esac
}

# Function to deploy to Render
deploy_to_render() {
    print_status "Preparing for Render deployment..."
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        print_error "Git repository not found. Please initialize git first."
        exit 1
    fi
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Please commit them first."
        echo "Run: git add . && git commit -m 'Your commit message'"
        exit 1
    fi
    
    # Push to GitHub
    print_status "Pushing to GitHub..."
    git push origin main
    
    print_success "Code pushed to GitHub"
    echo ""
    echo "🎯 Next Steps for Render Deployment:"
    echo "1. Go to https://render.com"
    echo "2. Click 'New +' → 'Blueprint'"
    echo "3. Connect your GitHub repository"
    echo "4. Select branch: main"
    echo "5. Click 'Apply' to deploy"
    echo ""
    echo "🔧 Environment Variables to set in Render:"
    echo "  - REACT_APP_API_URL: https://your-backend-service.onrender.com"
    echo ""
    echo "📝 Update local client config with deployed backend URL:"
    echo "  - Edit nrg_client_config.json"
    echo "  - Set api_url to your deployed backend URL"
}

# Main function
main() {
    case "${1:-start}" in
        "start")
            echo "🚀 Starting NRG DataSense Platform..."
            echo ""
            
            check_dependencies
            install_frontend
            install_backend
            install_local_client
            start_backend
            start_frontend
            start_local_client
            
            echo ""
            print_success "All services started successfully!"
            show_status
            ;;
        "stop")
            stop_all
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs $2
            ;;
        "deploy")
            deploy_to_render
            ;;
        "install")
            check_dependencies
            install_frontend
            install_backend
            install_local_client
            print_success "All dependencies installed"
            ;;
        "config")
            create_default_config
            print_success "Default config created. Please edit nrg_client_config.json"
            ;;
        *)
            echo "Usage: $0 {start|stop|status|logs|deploy|install|config}"
            echo ""
            echo "Commands:"
            echo "  start   - Start all services"
            echo "  stop    - Stop all services"
            echo "  status  - Show service status"
            echo "  logs    - Show logs (backend|frontend|local)"
            echo "  deploy  - Prepare for Render deployment"
            echo "  install - Install all dependencies"
            echo "  config  - Create default local client config"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 logs backend"
            echo "  $0 deploy"
            ;;
    esac
}

# Run main function
main "$@"
