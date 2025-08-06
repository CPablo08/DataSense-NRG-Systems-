#!/bin/bash

# 🚀 DataSense Auto-Deployment Script
# Handles the entire deployment process automatically

echo "🚀 DataSense Auto-Deployment"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in the DataSense project directory!"
    exit 1
fi

print_status "Starting DataSense deployment..."

# Step 1: Build the application
print_info "Step 1: Building DataSense..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Please check for errors."
    exit 1
fi

print_status "Build completed successfully!"

# Step 2: Check if git is configured
print_info "Step 2: Checking Git configuration..."
if ! git config --get user.name > /dev/null 2>&1; then
    print_warning "Git user.name not configured. Setting up..."
    git config --global user.name "DataSense Deployer"
    git config --global user.email "deploy@datasense.com"
fi

# Step 3: Commit and push changes
print_info "Step 3: Committing and pushing changes..."
git add .
git commit -m "Auto-deploy: DataSense ready for Render deployment" --allow-empty
git push origin main

if [ $? -eq 0 ]; then
    print_status "Code pushed to GitHub successfully!"
else
    print_error "Failed to push to GitHub. Please check your git configuration."
    exit 1
fi

# Step 4: Provide deployment instructions
echo ""
echo "🎉 DEPLOYMENT READY!"
echo "===================="
echo ""
print_status "Your code is now on GitHub: https://github.com/CPablo08/DataSense"
echo ""
print_info "Next steps to deploy to Render:"
echo ""
echo "1. 🌐 Go to: https://render.com"
echo "2. 🔐 Sign up with your GitHub account"
echo "3. ➕ Click 'New +' → 'Static Site'"
echo "4. 🔗 Connect your GitHub account"
echo "5. 📁 Select: CPablo08/DataSense repository"
echo "6. ⚙️  Configure:"
echo "   - Name: datasense"
echo "   - Build Command: npm install && npm run build"
echo "   - Publish Directory: build"
echo "7. 🚀 Click 'Create Static Site'"
echo ""
print_status "Your DataSense will be live in 2-3 minutes!"
echo ""
print_info "You'll get a URL like: https://datasense.onrender.com"
echo ""
print_info "Features you'll get:"
echo "✅ 24/7 availability"
echo "✅ Mobile access"
echo "✅ HTTPS security"
echo "✅ Automatic updates"
echo "✅ Professional URL"
echo ""
print_status "Deployment process complete! Follow the steps above to go live!"
echo ""
print_info "Need help? Check DEPLOY_NOW.md for detailed instructions." 