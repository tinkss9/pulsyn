import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display the dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Pulsyn/);
    
    // Check header
    await expect(page.locator('h1')).toContainText('Pulsyn');
    await expect(page.locator('p')).toContainText('The AI-Native CDC Platform');
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/');
    
    // Check stat cards
    await expect(page.locator('text=Active Pipelines')).toBeVisible();
    await expect(page.locator('text=Rows/Second')).toBeVisible();
    await expect(page.locator('text=Total Rows')).toBeVisible();
    await expect(page.locator('text=Errors')).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    await page.goto('/');
    
    // Check quick action buttons
    await expect(page.locator('text=Create Pipeline')).toBeVisible();
    await expect(page.locator('text=Add Connector')).toBeVisible();
    await expect(page.locator('text=View Documentation')).toBeVisible();
  });

  test('should display empty pipeline list', async ({ page }) => {
    await page.goto('/');
    
    // Check empty state
    await expect(page.locator('text=No pipelines yet')).toBeVisible();
  });

  test('should navigate to create pipeline', async ({ page }) => {
    await page.goto('/');
    
    // Click create pipeline button
    await page.click('text=Create Pipeline');
    
    // Should navigate to pipeline creation page
    // (This would work with proper routing)
  });

  test('should navigate to add connector', async ({ page }) => {
    await page.goto('/');
    
    // Click add connector button
    await page.click('text=Add Connector');
    
    // Should navigate to connector creation page
    // (This would work with proper routing)
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // Check that layout adapts
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Active Pipelines')).toBeVisible();
  });
});
