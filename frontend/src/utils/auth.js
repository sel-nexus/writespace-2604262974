import { getUsers, saveSession, saveUsers } from './storage.js';

const ADMIN = {
  id: 'writespace-default-admin',
  username: 'admin',
  displayName: 'WriteSpace Admin',
  password: 'admin',
  role: 'admin',
};

/** Return the home route for a recognized session role.
 * @param {object|null} session Session to inspect.
 * @returns {string} Role home route, or the public landing route.
 */
export function roleHome(session) {
  if (!session || typeof session !== 'object') return '/';
  if (session.role === 'admin') return '/admin';
  if (session.role === 'user') return '/blogs';
  return '/';
}

/** Authenticate the demo administrator or a locally registered account.
 * @param {string} username Account username.
 * @param {string} password Plaintext demo password.
 * @returns {{ok: boolean, session?: object, error?: string}} Authentication result.
 */
export function login(username, password) {
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return { ok: false, error: 'Invalid username or password.' };
  }
  const account = username === ADMIN.username && password === ADMIN.password
    ? ADMIN
    : getUsers().find((user) => user && typeof user.id === 'string' && typeof user.username === 'string' && typeof user.password === 'string' && typeof user.displayName === 'string' && (user.role === 'user' || user.role === 'admin') && user.username === username && user.password === password);
  if (!account) return { ok: false, error: 'Invalid username or password.' };

  const session = {
    userId: account.id,
    username: account.username,
    displayName: account.displayName,
    role: account.role,
  };
  if (!saveSession(session)) return { ok: false, error: 'Browser storage is unavailable. Please enable local storage and try again.' };
  return { ok: true, session };
}

/** Register a local user after validating required fields and username uniqueness.
 * @param {{displayName: string, username: string, password: string, confirmPassword: string}} input Registration fields.
 * @returns {{ok: boolean, session?: object, error?: string}} Registration result.
 */
export function register(input) {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Complete all fields.' };
  const { displayName, username, password, confirmPassword } = input;
  if (![displayName, username, password, confirmPassword].every((value) => typeof value === 'string' && value.trim())) {
    return { ok: false, error: 'Complete all fields.' };
  }
  if (password !== confirmPassword) return { ok: false, error: 'Passwords do not match.' };
  const normalizedUsername = username.trim();
  if (normalizedUsername.toLowerCase() === ADMIN.username || getUsers().some((user) => user && typeof user.username === 'string' && user.username.toLowerCase() === normalizedUsername.toLowerCase())) {
    return { ok: false, error: 'That username is already taken.' };
  }

  const user = {
    id: crypto.randomUUID(),
    displayName: displayName.trim(),
    username: normalizedUsername,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  const users = getUsers();
  if (!saveUsers([...users, user])) return { ok: false, error: 'Browser storage is unavailable. Please enable local storage and try again.' };
  const session = { userId: user.id, username: user.username, displayName: user.displayName, role: user.role };
  if (!saveSession(session)) {
    saveUsers(users);
    return { ok: false, error: 'Browser storage is unavailable. Please enable local storage and try again.' };
  }
  return { ok: true, session };
}

/** Check whether a session has a recognized application role.
 * @param {object|null} session Session to validate.
 * @returns {boolean} True for user or administrator sessions.
 */
export function isAuthenticated(session) {
  return Boolean(session && (session.role === 'user' || session.role === 'admin') && session.userId);
}

/** Check whether a session belongs to the administrator role.
 * @param {object|null} session Session to inspect.
 * @returns {boolean} True for an administrator session.
 */
export function isAdmin(session) {
  return Boolean(session && session.role === 'admin');
}
