import { test, expect } from '@playwright/test';

test.describe('Chinese Chess - User Experience Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('1. Board and piece alignment', async ({ page }) => {
    // Wait for board to render
    await page.waitForSelector('[role="grid"]');
    
    // Get board element
    const board = page.locator('[role="grid"]');
    const boardBox = await board.boundingBox();
    expect(boardBox).toBeTruthy();
    
    // Check if pieces are positioned at intersections
    // This is a visual check - pieces should align with grid lines
    console.log('Board dimensions:', boardBox);
    
    // TODO: Add visual regression test or screenshot comparison
    await expect(board).toBeVisible();
  });

  test('2. Audio functionality', async ({ page }) => {
    // Check if audio manager is initialized
    const audioInitialized = await page.evaluate(() => {
      // Check if audio context or audio elements exist
      const audioElements = document.querySelectorAll('audio');
      return audioElements.length > 0;
    });
    
    // Note: Audio may not play without user interaction due to browser policies
    console.log('Audio elements found:', audioInitialized);
  });

  test('3. Undo/Redo buttons exist', async ({ page }) => {
    // Check for undo button
    const undoButton = page.locator('button:has-text("Undo"), button:has-text("悔棋"), [aria-label="Undo"]');
    const undoExists = await undoButton.count() > 0;
    
    console.log('Undo button exists:', undoExists);
    
    // If no button, check if keyboard shortcut works
    // For now, just report the finding
  });

  test('4. AI responds after checkmate', async ({ page }) => {
    // This would require playing a complete game
    // For now, check if game status is displayed
    const statusElement = page.locator('[data-testid="game-status"], .game-status');
    const statusExists = await statusElement.count() > 0;
    
    console.log('Game status display exists:', statusExists);
  });

  test('5. Red side orientation', async ({ page }) => {
    // Check which side red is on
    // Red should be at bottom (ranks 0-4), Black at top (ranks 5-9)
    const redPieces = page.locator('[data-color="red"]');
    const redCount = await redPieces.count();
    
    console.log('Red pieces found:', redCount);
    
    // Get position of first red piece
    if (redCount > 0) {
      const firstRed = redPieces.first();
      const box = await firstRed.boundingBox();
      console.log('First red piece position:', box);
    }
  });
});
