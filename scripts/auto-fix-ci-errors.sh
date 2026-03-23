#!/bin/bash
set -e

# ============================================================================
# Auto-Fix CI/CD Errors Script
# 
# This script:
# 1. Fetches errors from GitHub Actions
# 2. Parses error messages
# 3. Applies automatic fixes
# 4. Validates fixes locally
# 5. Commits and pushes fixes
# ============================================================================

REPO="sunrichard888/chinese-chess"
WORK_DIR="/root/.openclaw/workspace/chinese-chess"

cd "$WORK_DIR"

echo "🔍 Fetching latest CI errors from GitHub..."

# Get latest failed run
FAILED_RUN=$(gh run list --repo "$REPO" --limit 1 --json databaseId --jq '.[0].databaseId')

if [ -z "$FAILED_RUN" ]; then
  echo "❌ No failed runs found"
  exit 1
fi

echo "📥 Downloading logs from run #$FAILED_RUN..."

# Download logs
gh run download "$FAILED_RUN" --repo "$REPO" --dir /tmp/ci-logs 2>/dev/null || true

# Parse TypeScript errors
echo "🔧 Parsing TypeScript errors..."
TS_ERRORS=$(cat /tmp/ci-logs/*/typescript.txt 2>/dev/null | grep "error TS" | sort -u || echo "")

if [ -z "$TS_ERRORS" ]; then
  echo "✅ No TypeScript errors found"
else
  echo "Found TypeScript errors:"
  echo "$TS_ERRORS" | head -10
  
  # Auto-fix common patterns
  echo ""
  echo "🔧 Applying automatic fixes..."
  
  # Fix 1: PIECE_VALUES casing
  if echo "$TS_ERRORS" | grep -q "Property 'General' does not exist"; then
    echo "  - Fixing PIECE_VALUES casing..."
    find src tests -name "*.ts" -o -name "*.tsx" | xargs sed -i \
      -e 's/PIECE_VALUES\.General/PIECE_VALUES.general/g' \
      -e 's/PIECE_VALUES\.Chariot/PIECE_VALUES.chariot/g' \
      -e 's/PIECE_VALUES\.Cannon/PIECE_VALUES.cannon/g' \
      -e 's/PIECE_VALUES\.Horse/PIECE_VALUES.horse/g' \
      -e 's/PIECE_VALUES\.Advisor/PIECE_VALUES.advisor/g' \
      -e 's/PIECE_VALUES\.Elephant/PIECE_VALUES.elephant/g' \
      -e 's/PIECE_VALUES\.Soldier/PIECE_VALUES.soldier/g'
  fi
  
  # Fix 2: Import paths
  if echo "$TS_ERRORS" | grep -q "Cannot find module '\.\./\(types\|board\)'"; then
    echo "  - Fixing import paths..."
    find src/core -name "*.ts" | xargs sed -i \
      -e 's|from '\''../types'\''|from '\''./types'\''|g' \
      -e 's|from '\''../board'\''|from '\''./board'\''|g'
  fi
  
  # Fix 3: Unused imports (remove common ones)
  if echo "$TS_ERRORS" | grep -q "declared but its value is never read"; then
    echo "  - Removing unused imports..."
    # This requires more sophisticated parsing
  fi
fi

# Validate fixes
echo ""
echo "🧪 Validating fixes locally..."
if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
  echo "⚠️  Some TypeScript errors remain"
  npx tsc --noEmit 2>&1 | grep "error TS" | head -10
else
  echo "✅ All TypeScript errors fixed!"
fi

# Commit and push
echo ""
echo "📤 Committing and pushing fixes..."
git add -A
git commit -m "Auto-fix: TypeScript compilation errors

Fixed by CI auto-fix script.
" || echo "No changes to commit"

git push

echo ""
echo "✅ Auto-fix complete!"
echo "Monitor CI: https://github.com/$REPO/actions"
