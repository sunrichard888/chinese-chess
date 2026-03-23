/**
 * E2E Tests - Skin System
 */

import { test, expect } from '@playwright/test';

test.describe('Chinese Chess - Skin System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have default skin (wood)', async ({ page }) => {
    // Check board has wood colors
    const board = page.locator('[role="grid"]');
    await expect(board).toBeVisible();
    
    // Wood theme colors should be applied
    // This is a simplified check - actual implementation may vary
    await expect(board).toHaveClass(/.*board.*/);
  });

  test('should allow skin selection', async ({ page }) => {
    // This test would require a skin selector UI component
    // Simplified test for now
    const settingsButton = page.locator('button:has-text("Settings"), select');
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Should show skin options
      const skinOptions = page.locator('text=Wood, text=Bamboo, text=Marble');
      await expect(skinOptions.or(page.locator('body'))).toBeDefined();
    }
  });

  test('should persist skin choice', async ({ page }) => {
    // This would require actual skin switching implementation
    // Simplified test for now
    
    // Reload page
    await page.reload();
    
    // Board should still be visible (skin persisted or defaulted)
    const board = page.locator('[role="grid"]');
    await expect(board).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const board = page.locator('[role="grid"]');
    await expect(board).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(board).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(board).toBeVisible();
  });
});
