import { test, expect } from '@playwright/test';

test('Visual validation - Board orientation', async ({ page }) => {
  await page.goto('http://localhost:4173');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of initial state
  await page.screenshot({ path: 'tests/e2e/screenshots/initial-board.png', fullPage: true });
  
  // Check if board is visible
  const board = page.locator('[role="grid"]');
  await expect(board).toBeVisible();
  
  // Check for Flip button
  const flipButton = page.locator('button:has-text("Flip"), button:has-text("🔄")');
  const hasFlipButton = await flipButton.count() > 0;
  console.log('Flip button exists:', hasFlipButton);
  
  // Check for Undo button
  const undoButton = page.locator('button:has-text("Undo"), button:has-text("↶")');
  const hasUndoButton = await undoButton.count() > 0;
  console.log('Undo button exists:', hasUndoButton);
  
  // Take screenshot after checking
  await page.screenshot({ path: 'tests/e2e/screenshots/board-with-ui.png', fullPage: true });
});
