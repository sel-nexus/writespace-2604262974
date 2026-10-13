import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';
import UserManagement from './UserManagement.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { savePosts, saveSession, saveUsers } from '../utils/storage.js';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const admin = { userId: 'writespace-default-admin', username: 'admin', displayName: 'WriteSpace Admin', role: 'admin' };
const writer = { userId: 'writer-1', username: 'mira', displayName: 'Mira Chen', role: 'user' };
const users = [
  { id: 'writer-1', displayName: 'Mira Chen', username: 'mira', password: 'local-pass', role: 'user', createdAt: '2024-02-01T00:00:00.000Z' },
  { id: 'admin-2', displayName: 'Noah Park', username: 'noah-admin', password: 'local-pass', role: 'admin', createdAt: '2024-02-02T00:00:00.000Z' },
];
const posts = Array.from({ length: 6 }, (_, index) => ({
  id: `post-${index + 1}`,
  title: `Post ${index + 1}`,
  content: `Content ${index + 1}`,
  createdAt: new Date(Date.UTC(2024, 0, index + 1)).toISOString(),
  authorId: 'writer-1',
  authorName: 'Mira Chen',
}));

function renderAdmin(path, session = admin) {
  if (session) saveSession(session);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<h1>Public landing</h1>} path="/" />
        <Route element={<h1>Login page</h1>} path="/login" />
        <Route element={<ProtectedRoute />}>
          <Route element={<h1>All Blogs</h1>} path="/blogs" />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminDashboard />} path="/admin" />
          <Route element={<UserManagement />} path="/users" />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('administrator dashboard and account management', () => {
  it('redirects guests to login and ordinary users away from administrator pages', () => {
    renderAdmin('/admin', null);
    expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument();
    cleanup();
    renderAdmin('/users', writer);
    expect(screen.getByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
  });

  it('shows the four specified counts, quick actions, and only five newest posts', () => {
    saveUsers(users);
    savePosts(posts);
    renderAdmin('/admin');
    expect(screen.getByRole('heading', { name: 'A clear view of your community.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write New Post' })).toHaveAttribute('href', '/write');
    expect(screen.getByRole('link', { name: 'Manage Users' })).toHaveAttribute('href', '/users');
    expect(screen.getByText('Total Posts')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Admins')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
    const statValues = screen.getAllByRole('status').map((element) => element.textContent);
    expect(statValues).toEqual(['6', '2', '2', '1']);
    expect(screen.getByText('Post 6')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
    expect(screen.queryByText('Post 1')).not.toBeInTheDocument();
  });

  it('shows a useful empty state when there are no posts', () => {
    renderAdmin('/admin');
    expect(screen.getByText('No posts yet. Write the first one to get started.')).toBeInTheDocument();
  });

  it('validates required fields and duplicate usernames before creating an account', async () => {
    const user = userEvent.setup();
    saveUsers(users);
    renderAdmin('/users');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Display Name'), 'Another Mira');
    await user.type(screen.getByLabelText('Username'), 'MIRA');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('writespace_users'))).toEqual(users);
  });

  it('creates an account with the selected role and persists it', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('crypto', { randomUUID: () => 'created-admin-id' });
    renderAdmin('/users');
    await user.type(screen.getByLabelText('Display Name'), 'Ari Kim');
    await user.type(screen.getByLabelText('Username'), 'ari');
    await user.type(screen.getByLabelText('Password'), 'local-pass');
    await user.selectOptions(screen.getByLabelText('Role'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(JSON.parse(localStorage.getItem('writespace_users'))).toEqual([
      { id: 'created-admin-id', displayName: 'Ari Kim', username: 'ari', password: 'local-pass', role: 'admin', createdAt: expect.any(String) },
    ]);
    expect(screen.getByText('Ari Kim')).toBeInTheDocument();
    expect(screen.getAllByText('Admin', { selector: 'span' })).toHaveLength(2);
  });

  it('disables default-admin and current-account deletion and confirms other deletions', async () => {
    const user = userEvent.setup();
    saveUsers(users);
    const registeredAdmin = { userId: 'admin-2', username: 'noah-admin', displayName: 'Noah Park', role: 'admin' };
    const removableUser = { id: 'writer-3', displayName: 'Ari Kim', username: 'ari', password: 'local-pass', role: 'user', createdAt: '2024-02-03T00:00:00.000Z' };
    saveUsers([...users, removableUser]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderAdmin('/users', registeredAdmin);
    expect(screen.getByRole('button', { name: 'Default admin cannot be deleted.' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'You cannot delete your own account.' })).toBeDisabled();
    const ariRow = screen.getByRole('row', { name: /Ari Kim ari User/ });
    await user.click(within(ariRow).getByRole('button', { name: 'Delete Ari Kim' }));
    expect(confirm).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('writespace_users'))).toEqual([...users, removableUser]);
    confirm.mockReturnValue(true);
    await user.click(within(ariRow).getByRole('button', { name: 'Delete Ari Kim' }));
    expect(JSON.parse(localStorage.getItem('writespace_users'))).toEqual(users);
    expect(screen.queryByText('Ari Kim')).not.toBeInTheDocument();
  });

  it('reports storage failures when creating accounts', async () => {
    const user = userEvent.setup();
    renderAdmin('/users');
    await user.type(screen.getByLabelText('Display Name'), 'Ari Kim');
    await user.type(screen.getByLabelText('Username'), 'ari');
    await user.type(screen.getByLabelText('Password'), 'local-pass');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your browser could not save this account.');
  });
});
