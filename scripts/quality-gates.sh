#!/bin/bash
set -e

echo "🏭 Factory Mode - Quality Gates Check"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Step 1: TypeScript Check
echo "📝 Step 1: TypeScript Check..."
if npm run typecheck; then
  echo -e "${GREEN}✅ TypeScript Check Passed${NC}"
else
  echo -e "${RED}❌ TypeScript Check Failed${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Step 2: ESLint Check
echo "🔍 Step 2: ESLint Check..."
if npm run lint; then
  echo -e "${GREEN}✅ ESLint Check Passed${NC}"
else
  echo -e "${RED}❌ ESLint Check Failed${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Step 3: Prettier Check
echo "✨ Step 3: Prettier Check..."
if npm run format:check; then
  echo -e "${GREEN}✅ Prettier Check Passed${NC}"
else
  echo -e "${RED}❌ Prettier Check Failed${NC}"
  echo -e "${YELLOW}💡 Run 'npm run format' to fix formatting issues${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Step 4: Unit Tests
echo "🧪 Step 4: Unit Tests..."
if npm test -- --run; then
  echo -e "${GREEN}✅ Unit Tests Passed${NC}"
else
  echo -e "${RED}❌ Unit Tests Failed${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Step 5: Coverage Check
echo "📊 Step 5: Coverage Check..."
if npm run test:coverage; then
  echo -e "${GREEN}✅ Coverage Check Passed${NC}"
  
  # Check coverage threshold
  if [ -f "coverage/coverage-summary.json" ]; then
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    echo "📈 Line Coverage: ${COVERAGE}%"
    
    if (( $(echo "$COVERAGE >= 70" | bc -l) )); then
      echo -e "${GREEN}✅ Coverage meets 70% threshold${NC}"
    else
      echo -e "${RED}❌ Coverage below 70% threshold${NC}"
      FAILURES=$((FAILURES + 1))
    fi
  fi
else
  echo -e "${RED}❌ Coverage Check Failed${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Step 6: Build
echo "🏗️ Step 6: Build..."
if npm run build; then
  echo -e "${GREEN}✅ Build Passed${NC}"
  
  # Check bundle size
  if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "📦 Dist Size: ${DIST_SIZE}"
    
    # Warn if dist is too large (>500KB)
    DIST_SIZE_KB=$(du -sk dist | cut -f1)
    if [ "$DIST_SIZE_KB" -gt 500 ]; then
      echo -e "${YELLOW}⚠️  Dist size is larger than 500KB${NC}"
    else
      echo -e "${GREEN}✅ Dist size is under 500KB${NC}"
    fi
  fi
else
  echo -e "${RED}❌ Build Failed${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Summary
echo "======================================"
echo "📊 Quality Gates Summary"
echo "======================================"

if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}✅ All Quality Gates Passed!${NC}"
  echo ""
  echo "🎉 Factory Mode execution complete!"
  exit 0
else
  echo -e "${RED}❌ $FAILURES Quality Gate(s) Failed${NC}"
  echo ""
  echo "💡 Fix the issues above and re-run:"
  echo "   ./scripts/quality-gates.sh"
  exit 1
fi
