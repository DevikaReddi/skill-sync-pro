#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🧪 Running Backend Tests..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt
pip install -q -r requirements-dev.txt

# Run tests
echo "🚀 Running pytest..."
pytest -v --cov=app --cov-report=term-missing

# Capture exit code
TEST_EXIT_CODE=$?

# Deactivate virtual environment
deactivate

# Exit with the same code as pytest
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed!${NC}"
fi

exit $TEST_EXIT_CODE
