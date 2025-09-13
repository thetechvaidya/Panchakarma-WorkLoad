#!/bin/bash
# Cache-clearing development script

echo "🧹 Clearing all caches..."

# Remove Vite cache
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

echo "📦 Rebuilding application..."
npm run build

echo "🚀 Starting development server with cache disabled..."
npm run dev -- --port 5004 --force --no-cache

echo "✅ Server started! Open http://localhost:5004/"
echo "💡 For complete cache clearing, also:"
echo "   1. Open DevTools (F12)"
echo "   2. Right-click refresh button"
echo "   3. Select 'Empty Cache and Hard Reload'"