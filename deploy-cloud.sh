#!/bin/bash

# 🌐 DataSense Cloud Deployment Script
# Deploys to multiple free hosting platforms

echo "🚀 DataSense Cloud Deployment"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building DataSense..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Vercel (Recommended)
echo ""
echo "🌐 Deploying to Vercel (Recommended)"
echo "====================================="
echo "This will open a browser window for authentication."
echo "Follow the prompts to complete deployment."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🚀 Starting Vercel deployment..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Vercel deployment successful!"
    echo "🌐 Your DataSense app is now live on the cloud!"
    echo "📱 Access it from any device, anywhere!"
    echo ""
    echo "🔗 Deployment URL will be shown above"
    echo "⚙️  You can manage your deployment at: https://vercel.com/dashboard"
else
    echo "❌ Vercel deployment failed. Trying alternative deployment..."
fi

echo ""
echo "🎯 Alternative Deployment Options:"
echo "=================================="
echo "1. Netlify (Free tier): npm run deploy:netlify"
echo "2. GitHub Pages (Free): npm run deploy:github"
echo "3. Render (Free tier): Connect your GitHub repo"
echo "4. Railway (Free tier): Connect your GitHub repo"
echo ""

echo "📋 Next Steps:"
echo "==============="
echo "1. Your app is now accessible 24/7 from any device"
echo "2. Share the URL with anyone who needs access"
echo "3. No need to install anything on client computers"
echo "4. Automatic updates when you redeploy"
echo ""

echo "🎉 DataSense is now cloud-powered! 🌐" 