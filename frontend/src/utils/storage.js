const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

/** Read and parse a localStorage array, returning an empty array on invalid data or storage errors.
 * @param {string} key Storage key.
 * @returns {Array} Parsed array or an empty array.
 */
function readArray(key) {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Read posts saved in this browser.
 * @returns {Array<object>} Stored posts.
 */
export function getPosts() {
  return readArray(POSTS_KEY);
}

/** Persist posts in this browser.
 * @param {Array<object>} posts Posts to save.
 * @returns {boolean} Whether the write succeeded.
 */
export function savePosts(posts) {
  return writeJson(POSTS_KEY, Array.isArray(posts) ? posts : []);
}

/** Read registered accounts saved in this browser.
 * @returns {Array<object>} Stored users.
 */
export function getUsers() {
  return readArray(USERS_KEY);
}

/** Persist registered accounts in this browser.
 * @param {Array<object>} users Accounts to save.
 * @returns {boolean} Whether the write succeeded.
 */
export function saveUsers(users) {
  return writeJson(USERS_KEY, Array.isArray(users) ? users : []);
}

/** Read the active browser-local session.
 * @returns {object|null} Session data or null when absent, malformed, or unavailable.
 */
export function getSession() {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const session = JSON.parse(value);
    return session && typeof session === 'object' && typeof session.role === 'string' ? session : null;
  } catch {
    return null;
  }
}

/** Save the active browser-local session.
 * @param {object} session Session data.
 * @returns {boolean} Whether the write succeeded.
 */
export function saveSession(session) {
  return writeJson(SESSION_KEY, session);
}

/** Remove the active browser-local session.
 * @returns {boolean} Whether the removal succeeded.
 */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Serialize a value into localStorage without allowing storage failures to crash the app.
 * @param {string} key Storage key.
 * @param {unknown} value Value to serialize.
 * @returns {boolean} Whether the write succeeded.
 */
function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
