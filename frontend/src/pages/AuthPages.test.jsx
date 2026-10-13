import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

function renderRoutes(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<h1>Writer dashboard</h1>} path="/blogs" />
        <Route element={<h1>Admin dashboard</h1>} path="/admin" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('public and guest authentication pages', () => {
  it('shows public entry points and the recent-post empty state', () => {
    renderRoutes('/');
    expect(screen.getByRole('heading', { name: /your thoughts/i })).toBeInTheDocument();
    expect(screen.getByText('No posts yet - check back soon!')).toBeInTheDocument();
    const mainNavigation = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(mainNavigation.querySelector('a[href="/login"]')).toHaveTextContent('Login');
    expect(mainNavigation.querySelector('a[href="/register"]')).toHaveTextContent('Get Started');
  });

  it('shows an inline error for invalid login and routes the demo admin', async () => {
    const user = userEvent.setup();
    const { unmount } = renderRoutes('/login');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'bad');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
    unmount();
    renderRoutes('/login');
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument();
  });

  it('validates registration and routes a newly registered user', async () => {
    const user = userEvent.setup();
    renderRoutes('/register');
    await user.type(screen.getByLabelText('Display Name'), 'Mira Chen');
    await user.type(screen.getByLabelText('Username'), 'mira');
    await user.type(screen.getByLabelText('Password'), 'local-pass');
    await user.type(screen.getByLabelText('Confirm Password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.');
    await user.clear(screen.getByLabelText('Confirm Password'));
    await user.type(screen.getByLabelText('Confirm Password'), 'local-pass');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(await screen.findByRole('heading', { name: 'Writer dashboard' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('writespace_users'))[0].username).toBe('mira');
  });
});
