#!/bin/bash

# Quick Start Script for @johnjenkins/stencil-vitest Testing
# This script sets up and runs the complete test suite

set -e  # Exit on error

echo "🚀 @johnjenkins/stencil-vitest - Test Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install root dependencies
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Build the package
echo -e "${BLUE}Step 2: Building package...${NC}"
pnpm build
echo -e "${GREEN}✓ Package built${NC}"
echo ""

# Step 3: Build test fixture
echo -e "${BLUE}Step 3: Building test fixture...${NC}"
cd test-project
pnpm install
pnpm build
cd ../..
echo -e "${GREEN}✓ Test fixture built${NC}"
echo ""

# Step 4: Run unit tests
echo -e "${BLUE}Step 4: Running unit tests...${NC}"
pnpm test:unit
echo -e "${GREEN}✓ Unit tests passed${NC}"
echo ""

# Step 5: Run integration tests
echo -e "${BLUE}Step 5: Running integration tests...${NC}"
pnpm test:integration:run
echo -e "${GREEN}✓ Integration tests passed${NC}"
echo ""

# Success!
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✨ All tests passed successfully! ✨${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Next steps:"
echo "  • View test coverage: pnpm test:coverage"
echo "  • Run fixture tests: cd test-project && pnpm test"
echo "  • Watch mode: pnpm test --watch"
echo "  • See TESTING_GUIDE.md for more options"
echo ""
