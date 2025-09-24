#!/bin/bash

echo ""
echo "========================================"
echo "   DataSense Desktop Application"
echo "========================================"
echo ""
echo "🚀 Starting DataSense..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed!"
    echo ""
    echo "Installing Node.js automatically..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_status "Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        if [ $? -ne 0 ]; then
            print_error "Failed to install Homebrew"
            echo "Please install Node.js manually from: https://nodejs.org/"
            read -p "Press Enter to exit..."
            exit 1
        fi
        print_success "Homebrew installed successfully"
    fi
    
    # Install Node.js via Homebrew
    print_status "Installing Node.js via Homebrew..."
    brew install node
    if [ $? -ne 0 ]; then
        print_error "Failed to install Node.js via Homebrew"
        echo "Please install Node.js manually from: https://nodejs.org/"
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    # Reload shell environment
    export PATH="/opt/homebrew/bin:$PATH"
    print_success "Node.js installed successfully"
else
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    echo "Please install npm (usually comes with Node.js)"
    read -p "Press Enter to exit..."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm found: $NPM_VERSION"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    echo "Please run this script from the DataSense project directory"
    read -p "Press Enter to exit..."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install Node.js dependencies"
        read -p "Press Enter to exit..."
        exit 1
    fi
    print_success "Node.js dependencies installed"
else
    print_success "Node.js dependencies already installed"
fi

# Check and install Python dependencies
if [ ! -d "backend/venv" ]; then
    print_status "Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Failed to create Python virtual environment"
        read -p "Press Enter to exit..."
        exit 1
    fi
    cd ..
    print_success "Python virtual environment created"
fi

# Activate virtual environment and install Python dependencies
print_status "Installing Python dependencies..."
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    print_error "Failed to install Python dependencies"
    read -p "Press Enter to exit..."
    exit 1
fi
deactivate
cd ..
print_success "Python dependencies installed"

# Start the application
print_status "Starting DataSense Desktop Application..."
echo ""
print_success "🎉 DataSense is starting up!"
echo ""
echo "The application will open in a new window."
echo "You can close this terminal window once the app is running."
echo ""

# Start the development version
npm run start:dev

# Keep terminal open if there's an error
if [ $? -ne 0 ]; then
    print_error "DataSense failed to start"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Make sure all dependencies are installed"
    echo "2. Check if ports 3000 and 5000 are available"
    echo "3. Try running: npm install"
    echo ""
    read -p "Press Enter to exit..."
fi
