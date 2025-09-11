#!/bin/bash

echo "🛩️ Sky Warriors - 3D Flight Combat Game"
echo "========================================"
echo ""
echo "Starting development server..."
echo ""

# Check if node_modules exists, if not, install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the development server
echo "🚀 Starting Vite development server..."
echo "Game will be available at: http://localhost:5173/"
echo ""
echo "Controls:"
echo "🖱️  Mouse: Pitch & Yaw"
echo "🎯 Left Click: Shoot"
echo "📏 Scroll: Speed"
echo "📱 Touch: Drag to steer, tap to shoot"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
