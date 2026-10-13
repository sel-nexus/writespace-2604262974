import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { saveSession } from './utils/storage.js';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const writer = { userId: 'writer-1', username: 'mira', displayName: 'Mira Chen', role: 'user' };
const admin = { userId: 'admin-1', username: 'admin-user', displayName: 'Ari Admin', role: 'admin' };

function renderApp(path, session = null) {
  if (session) saveSession(session);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App route access', () => {
  it('redirects guests from protected writer and admin routes to login', () => {
    renderApp('/blogs');
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    cleanup();

    renderApp('/admin');
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('allows writers into blog routes and redirects them away from admin routes', () => {
    renderApp('/blogs', writer);
    expect(screen.getByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
    cleanup();

    renderApp('/admin', writer);
    expect(screen.getByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'A clear view of your community.' })).not.toBeInTheDocument();
  });

  it('allows admins into admin routes and protected writer routes', () => {
    renderApp('/admin', admin);
    expect(screen.getByRole('heading', { name: 'A clear view of your community.' })).toBeInTheDocument();
    cleanup();

    renderApp('/write', admin);
    expect(screen.getByRole('heading', { name: 'Write a Post' })).toBeInTheDocument();
  });

  it('redirects unknown paths to the public landing route', () => {
    renderApp('/not-a-route');
    expect(screen.getByRole('heading', { name: /Your thoughts\./ })).toBeInTheDocument();
  });
});
