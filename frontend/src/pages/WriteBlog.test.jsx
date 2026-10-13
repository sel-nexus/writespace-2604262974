import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WriteBlog from './WriteBlog.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { savePosts, saveSession } from '../utils/storage.js';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const writer = { userId: 'writer-1', username: 'mira', displayName: 'Mira Chen', role: 'user' };
const otherWriter = { userId: 'writer-2', username: 'noah', displayName: 'Noah Park', role: 'user' };
const admin = { userId: 'writespace-default-admin', username: 'admin', displayName: 'WriteSpace Admin', role: 'admin' };
const ownPost = { id: 'own-post', title: 'First draft', content: 'Original words', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'writer-1', authorName: 'Mira Chen' };
const otherPost = { id: 'other-post', title: 'Another draft', content: 'Someone else wrote this', createdAt: '2024-01-02T00:00:00.000Z', authorId: 'writer-2', authorName: 'Noah Park' };

function renderAuthoring(path, session = writer) {
  if (session) saveSession(session);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<h1>Public landing</h1>} path="/" />
        <Route element={<h1>Login page</h1>} path="/login" />
        <Route element={<ProtectedRoute />}>
          <Route element={<WriteBlog />} path="/write" />
          <Route element={<WriteBlog />} path="/edit/:id" />
          <Route element={<h1>All Blogs</h1>} path="/blogs" />
          <Route element={<h1>Post reader</h1>} path="/blog/:id" />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('post authoring', () => {
  it('redirects guests to login when opening the create route', () => {
    renderAuthoring('/write', null);
    expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument();
  });

  it('shows field-level errors and does not save an empty post', async () => {
    const user = userEvent.setup();
    renderAuthoring('/write');
    await user.click(screen.getByRole('button', { name: 'Save Post' }));
    expect(screen.getByText('Title is required.')).toHaveAttribute('role', 'alert');
    expect(screen.getByText('Content is required.')).toHaveAttribute('role', 'alert');
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true');
    expect(localStorage.getItem('writespace_posts')).toBeNull();
  });

  it('rejects whitespace-only title and content', async () => {
    const user = userEvent.setup();
    renderAuthoring('/write');
    await user.type(screen.getByLabelText('Title'), '   ');
    await user.type(screen.getByLabelText('Content'), '   ');
    await user.click(screen.getByRole('button', { name: 'Save Post' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Content is required.')).toBeInTheDocument();
    expect(localStorage.getItem('writespace_posts')).toBeNull();
  });

  it('preserves large content and markup-like text as literal post content', async () => {
    const user = userEvent.setup();
    const longContent = `<script>alert(1)</script>${'A'.repeat(12000)}`;
    renderAuthoring('/write');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Long note' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: longContent } });
    await user.click(screen.getByRole('button', { name: 'Save Post' }));
    expect(await screen.findByRole('heading', { name: 'Post reader' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('writespace_posts'))[0].content).toBe(longContent);
    expect(document.querySelector('script')).toBeNull();
  });

  it('creates a post with generated identity, timestamp, and session author', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-post-id' });
    vi.setSystemTime(new Date('2025-03-04T12:30:00.000Z'));
    renderAuthoring('/write');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  A small idea  ' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'A thought worth sharing.' } });
    expect(screen.getByRole('status')).toHaveTextContent('24 characters');
    await user.click(screen.getByRole('button', { name: 'Save Post' }));
    expect(await screen.findByRole('heading', { name: 'Post reader' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual([
      { id: 'generated-post-id', title: 'A small idea', content: 'A thought worth sharing.', createdAt: '2025-03-04T12:30:00.000Z', authorId: 'writer-1', authorName: 'Mira Chen' },
    ]);
  });

  it('prefills and updates an owned post without changing its identity or author', async () => {
    const user = userEvent.setup();
    savePosts([ownPost]);
    renderAuthoring('/edit/own-post');
    expect(screen.getByLabelText('Title')).toHaveValue('First draft');
    expect(screen.getByLabelText('Content')).toHaveValue('Original words');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Revised draft' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Updated words' } });
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual([{ ...ownPost, title: 'Revised draft', content: 'Updated words' }]);
  });

  it('redirects a writer away from another author’s edit route without changing the post', () => {
    savePosts([otherPost]);
    renderAuthoring('/edit/other-post');
    expect(screen.getByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual([otherPost]);
  });

  it('allows an administrator to edit another author’s post', async () => {
    const user = userEvent.setup();
    savePosts([otherPost]);
    renderAuthoring('/edit/other-post', admin);
    expect(screen.getByLabelText('Title')).toHaveValue('Another draft');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Admin revision' } });
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(JSON.parse(localStorage.getItem('writespace_posts'))[0]).toMatchObject({ id: 'other-post', title: 'Admin revision', authorId: 'writer-2' });
  });

  it('cancels without saving and returns to the post reader when editing', async () => {
    const user = userEvent.setup();
    savePosts([ownPost]);
    renderAuthoring('/edit/own-post');
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Unsaved change');
    await user.click(screen.getByRole('link', { name: 'Cancel' }));
    expect(await screen.findByRole('heading', { name: 'Post reader' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual([ownPost]);
  });

  it('shows a storage error and keeps the form when saving fails', async () => {
    const user = userEvent.setup();
    renderAuthoring('/write');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A title' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Some content' } });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    await user.click(screen.getByRole('button', { name: 'Save Post' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your browser could not save this post.');
    expect(screen.getByLabelText('Title')).toHaveValue('A title');
  });
});
