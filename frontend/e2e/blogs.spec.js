import { expect, test } from '@playwright/test';

const browserErrors = [];

test.beforeEach(async ({ page }) => {
  browserErrors.length = 0;
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
});

test('guest sees three recent-post previews with dates and is redirected when opening a post', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'oldest', title: 'Oldest community note', content: 'An older thought from the community.', createdAt: '2023-12-01T00:00:00.000Z', authorId: 'writer-1', authorName: 'Noah Park' },
    { id: 'older', title: 'Older community note', content: 'An earlier thought from the community.', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'writer-1', authorName: 'Noah Park' },
    { id: 'recent', title: 'A recent community note', content: 'A fresh thought worth sharing.', createdAt: '2024-03-01T00:00:00.000Z', authorId: 'writer-2', authorName: 'Ari Kim' },
    { id: 'newest', title: 'Newest community note', content: 'The newest thought worth sharing.', createdAt: '2024-04-01T00:00:00.000Z', authorId: 'writer-3', authorName: 'Sam Lee' },
  ])));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Recent writing' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Newest community note' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A recent community note' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Older community note' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Oldest community note' })).toHaveCount(0);
  await expect(page.getByText('Apr 01, 2024')).toBeVisible();
  await expect(page.getByText('Mar 01, 2024')).toBeVisible();
  await expect(page.getByText('Jan 01, 2024')).toBeVisible();
  await page.getByRole('link', { name: 'A recent community note' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test('guest is redirected to login when opening the blog list', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('link', { name: 'WriteSpace home' }).click();
  await page.getByRole('link', { name: 'Go to Dashboard' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'All Blogs' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test('writer reads posts, sees ownership controls, and uses mobile navigation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Get Started' }).click();
  await page.getByLabel('Display Name').fill('Mira Chen');
  await page.getByLabel('Username').fill('mira');
  await page.getByLabel('Password', { exact: true }).fill('local-pass');
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
  await page.locator('a[href="/blog/mine"]').click();
  await expect(page.getByText('A full post with a second line.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  await page.getByRole('link', { name: 'WriteSpace home' }).click();
  await page.getByRole('link', { name: 'Go to Dashboard' }).click();
  await page.getByRole('link', { name: 'All Blogs' }).click();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([])));
  await page.reload();
  await page.getByRole('link', { name: 'Write your first post' }).click();
  await page.getByRole('link', { name: 'Back to All Posts' }).click();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'mine', title: 'A note from Mira', content: 'A full post with a second line.\nStill part of the same thought.', createdAt: '2024-02-01T00:00:00.000Z', authorId: JSON.parse(localStorage.getItem('writespace_session')).userId, authorName: 'Mira Chen' },
  ])));
  await page.reload();
  await page.locator('a[href="/blog/mine"]').click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'All Blogs' })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'mine', title: 'A note from Mira', content: 'A full post with a second line.\nStill part of the same thought.', createdAt: '2024-02-01T00:00:00.000Z', authorId: JSON.parse(localStorage.getItem('writespace_session')).userId, authorName: 'Mira Chen' },
  ])));
  await page.reload();
  await page.locator('a[href="/blog/mine"]').click();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([])));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Post not found' })).toBeVisible();
  await expect(page.getByText('This post may have been removed or the link may be incorrect.')).toBeVisible();
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
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('link', { name: 'WriteSpace home' }).click();
  await page.getByRole('link', { name: 'Go to Dashboard' }).click();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'writer-post', title: 'Community writing', content: 'A post written by a community member.', createdAt: '2024-03-01T00:00:00.000Z', authorId: 'writer-1', authorName: 'Noah Park' },
  ])));
  await page.getByRole('link', { name: 'All Blogs' }).click();
  await expect(page.getByRole('link', { name: 'Edit Community writing' })).toBeVisible();
  await page.locator('a[href="/blog/writer-post"]').click();
  await expect(page.getByRole('heading', { name: 'Community writing' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});