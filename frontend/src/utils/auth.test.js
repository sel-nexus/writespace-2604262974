import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isAdmin, isAuthenticated, login, register, roleHome } from './auth.js';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('crypto', { randomUUID: () => 'generated-user-id' });
});

describe('local demo authentication', () => {
  it('authenticates the built-in administrator and routes by role', () => {
    const result = login('admin', 'admin');
    expect(result.ok).toBe(true);
    expect(result.session).toMatchObject({ userId: 'writespace-default-admin', role: 'admin' });
    expect(JSON.parse(localStorage.getItem('writespace_session'))).toEqual(result.session);
    expect(roleHome(result.session)).toBe('/admin');
    expect(isAdmin(result.session)).toBe(true);
    expect(isAuthenticated(result.session)).toBe(true);
  });

  it('rejects invalid credentials and missing values', () => {
    expect(login('admin', 'wrong')).toEqual({ ok: false, error: 'Invalid username or password.' });
    expect(login('', 'admin').ok).toBe(false);
    expect(isAuthenticated({ role: 'owner', userId: 'x' })).toBe(false);
    expect(roleHome(null)).toBe('/');
  });

  it('registers a user, persists the account and session, and assigns the user role', () => {
    const result = register({ displayName: 'A Writer', username: 'writer', password: 'secret', confirmPassword: 'secret' });
    expect(result.ok).toBe(true);
    expect(result.session).toMatchObject({ userId: 'generated-user-id', username: 'writer', role: 'user' });
    expect(JSON.parse(localStorage.getItem('writespace_users'))).toMatchObject([{ id: 'generated-user-id', displayName: 'A Writer', role: 'user' }]);
    expect(JSON.parse(localStorage.getItem('writespace_session'))).toEqual(result.session);
    expect(roleHome(result.session)).toBe('/blogs');
  });

  it('rejects missing fields, mismatched passwords, and duplicate usernames', () => {
    expect(register(null).error).toBe('Complete all fields.');
    expect(register({ displayName: '', username: 'x', password: 'x', confirmPassword: 'x' }).error).toBe('Complete all fields.');
    expect(register({ displayName: 'Writer', username: 'x', password: 'one', confirmPassword: 'two' }).error).toBe('Passwords do not match.');
    expect(register({ displayName: 'Admin', username: 'ADMIN', password: 'x', confirmPassword: 'x' }).error).toBe('That username is already taken.');
    register({ displayName: 'Writer', username: 'writer', password: 'x', confirmPassword: 'x' });
    expect(register({ displayName: 'Other', username: 'WRITER', password: 'x', confirmPassword: 'x' }).error).toBe('That username is already taken.');
  });

  it('does not leave a registered account behind when session persistence fails', () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === 'writespace_session') throw new Error('blocked');
      return originalSetItem.call(this, key, value);
    });
    const result = register({ displayName: 'Writer', username: 'writer', password: 'x', confirmPassword: 'x' });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Browser storage is unavailable');
  });
});
