import { expect, test } from '@playwright/test';

const browserErrors = [];

test.beforeEach(async ({ page }) => {
  browserErrors.length = 0;
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
});

test('guest is redirected to login when opening the blog list', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/');
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.goto('/blogs');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test('writer reads posts, sees ownership controls, and uses mobile navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started' }).click();
  await page.getByLabel('Display Name').fill('Mira Chen');
  await page.getByLabel('Username').fill('mira');
  await page.getByLabel('Password').fill('local-pass');
  await page.getByLabel('Confirm Password').fill('local-pass');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'mine', title: 'A note from Mira', content: 'A full post with a second line.\nStill part of the same thought.', createdAt: '2024-02-01T00:00:00.000Z', authorId: JSON.parse(localStorage.getItem('writespace_session')).userId, authorName: 'Mira Chen' },
    { id: 'theirs', title: 'A note from Noah', content: 'A different writer’s post.', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'another-writer', authorName: 'Noah Park' },
  ])));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A note from Mira' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit A note from Mira' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit A note from Noah' })).toHaveCount(0);
  await page.getByRole('link', { name: 'A note from Mira' }).click();
  await expect(page.getByText('A full post with a second line.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await page.screenshot({ path: 'test-results/blog-reader-mobile.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});

test('administrator can read any post and sees management controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/');
  await page.getByRole('link', { name: 'Go to Dashboard' }).click();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'writer-post', title: 'Community writing', content: 'A post written by a community member.', createdAt: '2024-03-01T00:00:00.000Z', authorId: 'writer-1', authorName: 'Noah Park' },
  ])));
  await page.goto('/blogs');
  await expect(page.getByRole('link', { name: 'Edit Community writing' })).toBeVisible();
  await page.getByRole('link', { name: 'Community writing' }).click();
  await expect(page.getByRole('heading', { name: 'Community writing' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});
