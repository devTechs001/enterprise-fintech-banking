#!/bin/bash

echo "🚀 Enterprise Fintech Banking - Setup & Run Script"
echo "=================================================="

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Function to install and run
setup_and_run() {
    local dir=$1
    local name=$2
    
    echo ""
    echo "📦 Installing $name dependencies..."
    cd "$dir"
    
    if npm install --prefer-offline --no-audit 2>&1 | tail -5; then
        echo "✅ $name dependencies installed"
    else
        echo "⚠️  Some dependencies may have failed to install"
    fi
    
    cd ..
}

# Setup client
setup_and_run "client" "Client"

# Setup server  
setup_and_run "server" "Server"

echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "To start the application:"
echo ""
echo "📱 Client (Terminal 1):"
echo "   cd client && npm run dev"
echo ""
echo "🖥️  Server (Terminal 2):"
echo "   cd server && npm run dev"
echo ""
echo "📋 Or use:"
echo "   npm run dev:all"
echo ""
