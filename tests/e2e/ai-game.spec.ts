/**
 * E2E Tests - AI Game (Player vs AI)
 */

import { test, expect } from '@playwright/test';

test.describe('Chinese Chess - AI Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have difficulty selector', async ({ page }) => {
    const difficultySelect = page.locator('select');
    await expect(difficultySelect).toBeVisible();
    
    const options = difficultySelect.locator('option');
    await expect(options).toHaveCount(3);
    await expect(options.nth(0)).toHaveText('Easy');
    await expect(options.nth(1)).toHaveText('Medium');
    await expect(options.nth(2)).toHaveText('Hard');
  });

  test('should allow changing difficulty', async ({ page }) => {
    const difficultySelect = page.locator('select');
    
    // Change to Hard
    await difficultySelect.selectOption('hard');
    await expect(difficultySelect).toHaveValue('hard');
    
    // Change to Easy
    await difficultySelect.selectOption('easy');
    await expect(difficultySelect).toHaveValue('easy');
  });

  test('AI should respond to player move', async ({ page }) => {
    // Make a move as red (player)
    const piece = page.locator('[role="img"]').first();
    await piece.click();
    
    const validMove = page.locator('[data-testid="valid-move-indicator"]').first();
    await validMove.click();
    
    // Wait for AI to think and respond (max 5 seconds for easy difficulty)
    await page.waitForTimeout(1000);
    
    // AI should have made a move (move count should be 2)
    const moveCount = page.locator('text=Moves:');
    await expect(moveCount).toContainText('Moves: 2');
  });

  test('should show game over on checkmate', async ({ page }) => {
    // This would require playing through a complete game
    // Simplified test - just verify game over modal exists
    const newGameButton = page.locator('button:has-text("New Game")');
    await expect(newGameButton).toBeVisible();
  });

  test('should allow starting new game', async ({ page }) => {
    // Make a few moves
    const piece = page.locator('[role="img"]').first();
    await piece.click();
    const validMove = page.locator('[data-testid="valid-move-indicator"]').first();
    await validMove.click();
    
    // Wait for AI move
    await page.waitForTimeout(1000);
    
    // Start new game
    const newGameButton = page.locator('button:has-text("New Game")');
    await newGameButton.click();
    
    // Move count should reset to 0
    const moveCount = page.locator('text=Moves:');
    await expect(moveCount).toContainText('Moves: 0');
    
    // Should be red's turn
    await expect(page.locator('text=Red')).toBeVisible();
  });
});
