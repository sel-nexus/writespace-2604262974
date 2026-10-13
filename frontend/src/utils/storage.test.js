import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSession, getPosts, getSession, getUsers, savePosts, saveSession, saveUsers } from './storage.js';

beforeEach(() => localStorage.clear());

describe('local storage helpers', () => {
  it('persists and reads posts and users as arrays', () => {
    const posts = [{ id: 'p1', title: 'A thought' }];
    const users = [{ id: 'u1', username: 'writer' }];
    expect(savePosts(posts)).toBe(true);
    expect(saveUsers(users)).toBe(true);
    expect(getPosts()).toEqual(posts);
    expect(getUsers()).toEqual(users);
  });

  it('returns empty arrays for malformed or non-array stored values', () => {
    localStorage.setItem('writespace_posts', '{broken');
    localStorage.setItem('writespace_users', JSON.stringify({ username: 'not-an-array' }));
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('returns safe defaults when storage access throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
  });

  it('round-trips a valid session and clears it', () => {
    const session = { userId: 'u1', username: 'writer', displayName: 'Writer', role: 'user' };
    expect(saveSession(session)).toBe(true);
    expect(getSession()).toEqual(session);
    expect(clearSession()).toBe(true);
    expect(getSession()).toBeNull();
  });

  it('rejects malformed session data and reports failed writes', () => {
    localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1' }));
    expect(getSession()).toBeNull();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(savePosts([{ id: 'p2' }])).toBe(false);
    expect(saveSession({ role: 'user' })).toBe(false);
  });
});
