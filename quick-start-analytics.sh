#!/bin/bash

# Quick Start Guide - Analytics Visualization
# Run this script to test the complete implementation

echo "🚀 Analytics Visualization - Quick Start Guide"
echo "================================================"
echo ""

# Step 1: Check Python dependencies
echo "📦 Step 1: Checking Python dependencies..."
cd "$(dirname "$0")/analytics-service"

if python3 -c "import matplotlib, seaborn, wordcloud" 2>/dev/null; then
    echo "✅ All Python packages installed"
else
    echo "❌ Missing packages. Installing..."
    pip3 install matplotlib seaborn wordcloud
fi

echo ""

# Step 2: Test chart generation
echo "🧪 Step 2: Testing chart generation..."
python3 test_chart_generation.py

if [ $? -eq 0 ]; then
    echo "✅ Chart generation test passed!"
else
    echo "❌ Chart generation test failed!"
    exit 1
fi

echo ""

# Step 3: Check output directory
echo "📁 Step 3: Checking output files..."
OUTPUT_DIR="output/daily/2026-01-08"
if [ -d "$OUTPUT_DIR" ]; then
    echo "✅ Output directory exists: $OUTPUT_DIR"
    echo "📊 Generated charts:"
    ls -lh "$OUTPUT_DIR"/*.png 2>/dev/null || echo "   (no charts found)"
else
    echo "⚠️  Output directory not found"
fi

echo ""
echo "================================================"
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start backend:  cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Navigate to: http://localhost:5173/admin/dashboard/daily"
echo "4. Select a date and view the charts!"
echo ""
echo "📚 Documentation:"
echo "   - IMPLEMENTATION_SUMMARY.md - Complete overview"
echo "   - analytics-service/CHARTS_README.md - Detailed docs"
echo ""

