#!/bin/bash

echo "🚀 Setting up Analytics Service..."
echo ""

# Navigate to analytics-service directory
cd "$(dirname "$0")"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    
    # Test chart generation
    echo "🧪 Testing chart generation..."
    python3 test_chart_generation.py
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Analytics service setup complete!"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Ensure MongoDB is running"
        echo "   2. Start backend: cd ../backend && npm start"
        echo "   3. Start frontend: cd ../frontend && npm run dev"
        echo ""
    else
        echo ""
        echo "⚠️  Chart generation test failed. Please check the error above."
    fi
else
    echo ""
    echo "❌ Failed to install dependencies. Please check the error above."
    exit 1
fi
