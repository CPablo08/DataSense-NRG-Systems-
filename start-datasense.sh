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
    
    # Detect Linux distribution
    if [ -f /etc/debian_version ]; then
        # Ubuntu/Debian
        print_status "Detected Ubuntu/Debian - installing Node.js via apt..."
        sudo apt update
        sudo apt install -y nodejs npm
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL/Fedora
        print_status "Detected Red Hat family - installing Node.js via yum/dnf..."
        if command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs npm
        else
            sudo yum install -y nodejs npm
        fi
    elif [ -f /etc/arch-release ]; then
        # Arch Linux
        print_status "Detected Arch Linux - installing Node.js via pacman..."
        sudo pacman -S --noconfirm nodejs npm
    else
        print_error "Unsupported Linux distribution"
        echo "Please install Node.js manually from: https://nodejs.org/"
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install Node.js"
        echo "Please install Node.js manually from: https://nodejs.org/"
        read -p "Press Enter to exit..."
        exit 1
    fi
    
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

# Check if Python is installed
print_status "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 is not installed!"
    echo ""
    echo "Installing Python 3 automatically..."
    
    # Detect Linux distribution and install Python
    if [ -f /etc/debian_version ]; then
        # Ubuntu/Debian
        print_status "Installing Python 3 via apt..."
        sudo apt update
        sudo apt install -y python3 python3-pip python3-venv
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL/Fedora
        print_status "Installing Python 3 via yum/dnf..."
        if command -v dnf &> /dev/null; then
            sudo dnf install -y python3 python3-pip
        else
            sudo yum install -y python3 python3-pip
        fi
    elif [ -f /etc/arch-release ]; then
        # Arch Linux
        print_status "Installing Python 3 via pacman..."
        sudo pacman -S --noconfirm python python-pip
    else
        print_error "Unsupported Linux distribution"
        echo "Please install Python 3 manually from: https://python.org/"
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install Python 3"
        echo "Please install Python 3 manually from: https://python.org/"
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    print_success "Python 3 installed successfully"
else
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
fi

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
