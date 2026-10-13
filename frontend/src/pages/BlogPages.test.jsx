import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from './Home.jsx';
import ReadBlog from './ReadBlog.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { savePosts, saveSession } from '../utils/storage.js';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const writer = { userId: 'writer-1', username: 'mira', displayName: 'Mira Chen', role: 'user' };
const admin = { userId: 'writespace-default-admin', username: 'admin', displayName: 'WriteSpace Admin', role: 'admin' };
const posts = [
  { id: 'older', title: 'Older idea', content: 'An earlier thought.', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'writer-2', authorName: 'Noah Park' },
  { id: 'newer', title: 'Newer idea', content: 'A newer thought with\nline breaks.', createdAt: '2024-02-01T00:00:00.000Z', authorId: 'writer-1', authorName: 'Mira Chen' },
];

function renderApp(path, session = writer) {
  if (session) saveSession(session);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<h1>Public landing</h1>} path="/" />
        <Route element={<h1>Login page</h1>} path="/login" />
        <Route element={<ProtectedRoute />}>
          <Route element={<Home />} path="/blogs" />
          <Route element={<ReadBlog />} path="/blog/:id" />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<h1>Admin area</h1>} path="/admin" />
        </Route>
        <Route element={<h1>Write page</h1>} path="/write" />
        <Route element={<h1>Edit page</h1>} path="/edit/:id" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('authenticated blog reading', () => {
  it('redirects guests to login and ordinary users away from admin routes', () => {
    renderApp('/blogs', null);
    expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument();
    cleanup();
    renderApp('/admin', writer);
    expect(screen.getByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
  });

  it('shows the empty state and a write action for authenticated users', () => {
    renderApp('/blogs');
    expect(screen.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write your first post' })).toHaveAttribute('href', '/write');
  });

  it('sorts posts newest first and only shows edit for owned posts', () => {
    savePosts(posts);
    renderApp('/blogs');
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Newer idea');
    expect(headings[1]).toHaveTextContent('Older idea');
    expect(screen.getByRole('link', { name: 'Edit Newer idea' })).toHaveAttribute('href', '/edit/newer');
    expect(screen.queryByRole('link', { name: 'Edit Older idea' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Mira Chen avatar' })).toBeInTheDocument();
  });

  it('renders full post content and hides controls for another writer’s post', () => {
    savePosts(posts);
    renderApp('/blog/older');
    expect(screen.getByRole('heading', { name: 'Older idea' })).toBeInTheDocument();
    expect(screen.getByText('An earlier thought.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toHaveAttribute('href', '/blogs');
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('allows an administrator to manage any post and deletes only after confirmation', async () => {
    const user = userEvent.setup();
    savePosts(posts);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { rerender } = renderApp('/blog/older', admin);
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/edit/older');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(confirm).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('writespace_posts'))).toHaveLength(2);
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual([posts[1]]);
    expect(await screen.findByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
    rerender(<div />);
  });

  it('keeps the post and reports an error when deletion cannot be persisted', async () => {
    const user = userEvent.setup();
    savePosts([posts[1]]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp('/blog/newer', admin);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your browser could not save this change.');
    expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual([posts[1]]);
  });

  it('shows a missing-post state for an unknown ID', () => {
    renderApp('/blog/missing');
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toHaveAttribute('href', '/blogs');
  });

  it('opens the mobile menu and logout clears the session', async () => {
    const user = userEvent.setup();
    renderApp('/blogs');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getAllByRole('button', { name: 'Logout' }).at(-1));
    expect(localStorage.getItem('writespace_session')).toBeNull();
    expect(await screen.findByRole('heading', { name: 'Public landing' })).toBeInTheDocument();
  });
});
