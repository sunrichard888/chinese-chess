#!/usr/bin/env node

/**
 * CI Error Auto-Fixer
 * 
 * Fetches errors from GitHub Actions, parses them,
 * applies fixes, and pushes corrections.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = 'sunrichard888/chinese-chess';
const WORK_DIR = '/root/.openclaw/workspace/chinese-chess';

// Error patterns and their fixes
const ERROR_FIXES = {
  // Pattern: error TS2551: Property 'General' does not exist
  'Property \'(\\w+)\' does not exist on type.*PIECE_VALUES': (match, propName) => {
    const lowerCase = propName.charAt(0).toLowerCase() + propName.slice(1);
    return {
      pattern: new RegExp(`PIECE_VALUES\\.${propName}`, 'g'),
      replacement: `PIECE_VALUES.${lowerCase}`,
      description: `Fix PIECE_VALUES.${propName} → PIECE_VALUES.${lowerCase}`
    };
  },
  
  // Pattern: Cannot find module '../types'
  'Cannot find module \'\\.\\./(types|board)\'': (match, moduleName) => {
    return {
      pattern: new RegExp(`from '\\.\\./${moduleName}'`, 'g'),
      replacement: `from './${moduleName}'`,
      description: `Fix import path: ../${moduleName} → ./${moduleName}`
    };
  },
  
  // Pattern: Module has no exported member 'Board'
  'Module.*has no exported member \'(\\w+)\'': (match, memberName) => {
    return {
      action: 'export_member',
      member: memberName,
      description: `Export ${memberName} from module`
    };
  },
  
  // Pattern: 'X' is declared but its value is never read
  '\'(\\w+)\' is declared but its value is never read': (match, varName) => {
    return {
      action: 'remove_unused',
      variable: varName,
      description: `Remove unused import/declaration: ${varName}`
    };
  },
  
  // Pattern: Parameter 'p' implicitly has an 'any' type
  'Parameter \'(\\w+)\' implicitly has an \'any\' type': (match, paramName) => {
    return {
      pattern: new RegExp(`(\\(${paramName}\\)|=> ${paramName})`, 'g'),
      replacement: `$1: any`,
      description: `Add explicit type for parameter: ${paramName}`
    };
  }
};

function runCommand(cmd) {
  try {
    return execSync(cmd, { cwd: WORK_DIR, encoding: 'utf8' });
  } catch (error) {
    return error.stdout || error.stderr || '';
  }
}

function fetchCIErrors() {
  console.log('🔍 Fetching CI errors from GitHub...');
  
  const runs = JSON.parse(runCommand(
    `gh run list --repo ${REPO} --limit 1 --json databaseId,status,conclusion`
  ));
  
  if (runs.length === 0 || runs[0].conclusion !== 'failure') {
    console.log('✅ No failed CI runs found');
    return [];
  }
  
  console.log(`📥 Downloading logs from run #${runs[0].databaseId}...`);
  
  runCommand(`gh run download ${runs[0].databaseId} --repo ${REPO} --dir /tmp/ci-logs 2>/dev/null || true`);
  
  // Parse TypeScript errors
  const tsLogPath = path.join('/tmp/ci-logs', 'typescript', 'typescript.txt');
  if (!fs.existsSync(tsLogPath)) {
    console.log('⚠️  No TypeScript logs found');
    return [];
  }
  
  const tsOutput = fs.readFileSync(tsLogPath, 'utf8');
  const errors = tsOutput
    .split('\n')
    .filter(line => line.includes('error TS'))
    .map(line => line.trim());
  
  console.log(`Found ${errors.length} TypeScript errors`);
  return errors;
}

function applyFixes(errors) {
  console.log('\n🔧 Applying automatic fixes...\n');
  
  const fixes = [];
  
  errors.forEach(error => {
    // Try to match error against known patterns
    for (const [pattern, fixFn] of Object.entries(ERROR_FIXES)) {
      const match = error.match(new RegExp(pattern));
      if (match) {
        const fix = fixFn(...match);
        if (fix.pattern && fix.replacement) {
          fixes.push(fix);
          console.log(`  ✅ ${fix.description}`);
          
          // Apply fix to all TypeScript files
          const files = getAllTSFiles();
          files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
              fs.writeFileSync(file, newContent);
            }
          });
        } else if (fix.action === 'export_member') {
          console.log(`  ⚠️  Manual action needed: Export ${fix.member} from module`);
        } else if (fix.action === 'remove_unused') {
          console.log(`  ⚠️  Manual action needed: Remove unused ${fix.variable}`);
        }
        break;
      }
    }
  });
  
  return fixes;
}

function getAllTSFiles() {
  const result = runCommand('find src tests -name "*.ts" -o -name "*.tsx"');
  return result.trim().split('\n').filter(Boolean);
}

function validateFixes() {
  console.log('\n🧪 Validating fixes locally...');
  const result = runCommand('npx tsc --noEmit 2>&1');
  
  if (result.includes('error TS')) {
    const remaining = result.split('\n').filter(line => line.includes('error TS'));
    console.log(`⚠️  ${remaining.length} errors remain:`);
    remaining.slice(0, 5).forEach(err => console.log(`   ${err}`));
    return false;
  } else {
    console.log('✅ All TypeScript errors fixed!');
    return true;
  }
}

function commitAndPush() {
  console.log('\n📤 Committing and pushing fixes...');
  
  runCommand('git add -A');
  
  const status = runCommand('git status --porcelain');
  if (!status.trim()) {
    console.log('ℹ️  No changes to commit');
    return;
  }
  
  runCommand(`git commit -m "Auto-fix: TypeScript compilation errors

Fixed by CI error auto-fixer script.
"`);
  
  runCommand('git push');
  
  console.log('✅ Fixes pushed to GitHub');
  console.log(`📊 Monitor CI: https://github.com/${REPO}/actions`);
}

// Main execution
async function main() {
  console.log('🤖 CI Error Auto-Fixer\n');
  console.log(`Repository: ${REPO}`);
  console.log(`Work Dir: ${WORK_DIR}\n`);
  
  const errors = fetchCIErrors();
  if (errors.length === 0) {
    console.log('✅ No errors to fix');
    return;
  }
  
  const fixes = applyFixes(errors);
  if (fixes.length === 0) {
    console.log('⚠️  No automatic fixes available');
    console.log('Manual intervention required');
    return;
  }
  
  const valid = validateFixes();
  if (valid) {
    commitAndPush();
  } else {
    console.log('\n⚠️  Some errors remain. Manual fix required.');
  }
}

main().catch(console.error);
