#!/bin/bash

# Deploy to Render Script
# This script helps deploy the NRG DataSense platform to Render

echo "🚀 Deploying NRG DataSense Platform to Render..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not found. Please initialize git first."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "   Please commit your changes before deploying."
    echo "   Run: git add . && git commit -m 'Your commit message'"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Go to https://render.com"
    echo "2. Click 'New +' → 'Blueprint'"
    echo "3. Connect your GitHub repository: CPablo08/DataSense-NRG-Systems-"
    echo "4. Select branch: $CURRENT_BRANCH"
    echo "5. Click 'Apply' to deploy"
    echo ""
    echo "🔧 Environment Variables to set in Render:"
    echo "   - NRG_CLIENT_ID: Your NRG API Client ID"
    echo "   - NRG_CLIENT_SECRET: Your NRG API Client Secret"
    echo ""
    echo "🌐 After deployment, your app will be available at:"
    echo "   Frontend: https://nrg-datasense-frontend.onrender.com"
    echo "   Backend: https://nrg-datasense-backend.onrender.com"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi
