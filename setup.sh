#!/bin/bash

# Kanban Teams App Setup Script
# This script sets up the development environment for the custom Kanban board Teams app

echo "🚀 Setting up Kanban Teams App..."
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed!"
    exit 1
fi
echo "✅ Backend dependencies installed"
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed!"
    exit 1
fi
echo "✅ Frontend dependencies installed"
cd ..

# Create environment files if they don't exist
echo ""
echo "⚙️  Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Backend Configuration
PORT=3001

# Development
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Created backend/.env"
else
    echo "✅ Backend .env already exists"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << EOF
# Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo "✅ Created frontend/.env.local"
else
    echo "✅ Frontend .env.local already exists"
fi

# Check if ngrok is available
echo ""
echo "🌐 Checking ngrok availability..."
if [ -f "./ngrok" ]; then
    echo "✅ ngrok executable found"
elif command -v ngrok &> /dev/null; then
    echo "✅ ngrok is installed globally"
else
    echo "⚠️  ngrok not found. You'll need ngrok for Teams integration."
    echo "   Download from: https://ngrok.com/download"
    echo "   Or place the ngrok executable in the project root"
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo ""
    echo "📝 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the backend server:  cd backend && npm run dev"
echo "2. Start the frontend server: cd frontend && npm run dev"
echo "3. For Teams integration:"
echo "   - Start ngrok: ./ngrok http 3000 (or ngrok http 3000)"
echo "   - Update manifest/manifest.json with your ngrok URL"
echo "   - Zip and upload the manifest to Teams"
echo ""
echo "📚 See README.md for detailed instructions!"