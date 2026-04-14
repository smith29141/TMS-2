import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
});

test('LOGIN_01: Valid login', async ({ page }) => {
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('LOGIN_02: Invalid password', async ({ page }) => {
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');
  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username and password do not match any user in this service');
});

test('LOGIN_03: Invalid username', async ({ page }) => {
  await page.fill('#user-name', 'wrong_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username and password do not match any user in this service');
});

test('LOGIN_04: Empty username and password', async ({ page }) => {
  await page.fill('#user-name', '');
  await page.fill('#password', '');
  await page.click('#login-button');
  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required');
});

test('LOGIN_05: Locked user', async ({ page }) => {
  await page.fill('#user-name', 'locked_out_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Sorry, this user has been locked out.');
});