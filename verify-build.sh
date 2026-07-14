#!/bin/bash
# ==============================================================================
# verify-build.sh
# Local verification script to check frontend & backend build integrity.
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status.

echo "========================================="
echo "🔍 Starting Local Build Verification..."
echo "========================================="

# 1. Verify Backend Setup
echo "📁 Checking Backend Dependencies..."
cd backend
npm install
cd ..

# 2. Verify Frontend Setup
echo "📁 Checking Frontend Build & Lint..."
cd frontend
npm install
npm run lint
npm run build
cd ..

echo "========================================="
echo "✅ Build Verification Successful!"
echo "========================================="
