#!/bin/bash

# 🚀 NRG DataSense Deployment Script
# This script prepares and deploys your application to Render

echo "🚀 Starting NRG DataSense deployment to Render..."

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

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please initialize git first."
    exit 1
fi

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Auto-commit before deployment $(date)"
fi

# Check if we have a remote repository
if ! git remote get-url origin &> /dev/null; then
    print_error "No remote repository found. Please add a remote origin."
    print_status "Example: git remote add origin https://github.com/yourusername/yourrepo.git"
    exit 1
fi

# Push to remote repository
print_status "Pushing code to remote repository..."
if git push origin main; then
    print_success "Code pushed successfully!"
else
    print_error "Failed to push code. Please check your git configuration."
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please ensure it exists in the root directory."
    exit 1
fi

print_success "Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://render.com and sign up/login"
echo "2. Click 'New +' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will automatically deploy using render.yaml"
echo ""
echo "🌐 Your application will be available at:"
echo "   Frontend: https://nrg-datasense-frontend.onrender.com"
echo "   Backend:  https://nrg-datasense-backend.onrender.com"
echo ""
echo "📊 Monitor deployment at: https://dashboard.render.com"
echo ""
print_success "Deployment script completed successfully!"
