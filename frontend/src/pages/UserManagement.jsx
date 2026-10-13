import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';
import Avatar from '../components/Avatar.jsx';
import { getSession, getUsers, saveUsers } from '../utils/storage.js';

/** Render administrator account creation and deletion controls.
 * @returns {JSX.Element} User management page.
 */
export default function UserManagement() {
  const session = getSession();
  const [users, setUsers] = useState(() => getUsers());
  const [fields, setFields] = useState({ displayName: '', username: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [storageError, setStorageError] = useState('');
  if (session?.role !== 'admin') return <Navigate replace to={session ? '/blogs' : '/login'} />;

  const update = (event) => setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  const createUser = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!fields.displayName.trim()) nextErrors.displayName = 'Display name is required.';
    if (!fields.username.trim()) nextErrors.username = 'Username is required.';
    if (!fields.password.trim()) nextErrors.password = 'Password is required.';
    if (fields.username.trim().toLowerCase() === 'admin' || users.some((user) => user.username.toLowerCase() === fields.username.trim().toLowerCase())) {
      nextErrors.username = 'That username is already taken.';
    }
    setErrors(nextErrors);
    setStorageError('');
    if (Object.keys(nextErrors).length) return;

    const user = {
      id: crypto.randomUUID(),
      displayName: fields.displayName.trim(),
      username: fields.username.trim(),
      password: fields.password,
      role: fields.role,
      createdAt: new Date().toISOString(),
    };
    const nextUsers = [...users, user];
    if (!saveUsers(nextUsers)) {
      setStorageError('Your browser could not save this account. Check available storage and try again.');
      return;
    }
    setUsers(nextUsers);
    setFields({ displayName: '', username: '', password: '', role: 'user' });
  };

  const deleteUser = (user) => {
    if (user.id === 'writespace-default-admin' || user.id === session.userId) return;
    if (!window.confirm(`Delete ${user.displayName}’s account? This cannot be undone.`)) return;
    const nextUsers = users.filter((item) => item.id !== user.id);
    if (!saveUsers(nextUsers)) {
      setStorageError('Your browser could not save this change. Check available storage and try again.');
      return;
    }
    setStorageError('');
    setUsers(nextUsers);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <Link className="inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900" to="/admin"><span aria-hidden="true">←</span> Back to Dashboard</Link>
        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-700">Administrator tools</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900">User Management</h1>
          <p className="mt-2 text-slate-600">Create accounts and keep the community list up to date.</p>
        </div>

        <section aria-labelledby="create-user-title" className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-extrabold text-slate-900" id="create-user-title">Create User</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-2" noValidate onSubmit={createUser}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-display-name">Display Name</label>
              <input aria-describedby={errors.displayName ? 'display-name-error' : undefined} aria-invalid={Boolean(errors.displayName)} aria-required="true" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-display-name" name="displayName" onChange={update} value={fields.displayName} />
              {errors.displayName && <p className="mt-1 text-sm text-red-700" id="display-name-error" role="alert">{errors.displayName}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-username">Username</label>
              <input aria-describedby={errors.username ? 'username-error' : undefined} aria-invalid={Boolean(errors.username)} aria-required="true" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-username" name="username" onChange={update} value={fields.username} />
              {errors.username && <p className="mt-1 text-sm text-red-700" id="username-error" role="alert">{errors.username}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-password">Password</label>
              <input aria-describedby={errors.password ? 'password-error' : undefined} aria-invalid={Boolean(errors.password)} aria-required="true" autoComplete="new-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-password" name="password" onChange={update} type="password" value={fields.password} />
              {errors.password && <p className="mt-1 text-sm text-red-700" id="password-error" role="alert">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="user-role">Role</label>
              <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="user-role" name="role" onChange={update} value={fields.role}>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            {storageError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2" role="alert">{storageError}</p>}
            <div className="md:col-span-2">
              <button className="rounded-full bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">Create Account</button>
            </div>
          </form>
        </section>

        <section aria-labelledby="user-list-title" className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-900" id="user-list-title">Accounts</h2>
              <p className="mt-1 text-sm text-slate-500">{users.length} registered account{users.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          {users.length ? (
            <>
              <div className="mt-5 space-y-3 md:hidden">
                {[{ id: 'writespace-default-admin', displayName: 'WriteSpace Admin', username: 'admin', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' }, ...users].map((user) => (
                  <article className="rounded-2xl border border-slate-100 bg-white p-4" key={`mobile-${user.id}`}>
                    <div className="flex items-center gap-3">
                      <Avatar label={`${user.displayName} avatar`} role={user.role} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">{user.displayName}</p>
                        <p className="truncate text-sm text-slate-500">{user.username}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.role === 'admin' ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm text-slate-500">{new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(user.createdAt))}</span>
                      <button aria-label={user.id === 'writespace-default-admin' ? 'Default admin cannot be deleted.' : user.id === session.userId ? 'You cannot delete your own account.' : `Delete ${user.displayName}`} className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={user.id === 'writespace-default-admin' || user.id === session.userId} onClick={() => deleteUser(user)} title={user.id === 'writespace-default-admin' ? 'Default admin cannot be deleted.' : user.id === session.userId ? 'You cannot delete your own account.' : undefined} type="button">Delete</button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-bold" scope="col">Account</th>
                    <th className="px-4 py-3 font-bold" scope="col">Username</th>
                    <th className="px-4 py-3 font-bold" scope="col">Role</th>
                    <th className="px-4 py-3 font-bold" scope="col">Created</th>
                    <th className="px-4 py-3 text-right font-bold" scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <UserRow currentUserId={session.userId} key="writespace-default-admin" onDelete={deleteUser} user={{ id: 'writespace-default-admin', displayName: 'WriteSpace Admin', username: 'admin', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' }} />
                  {users.map((user) => <UserRow currentUserId={session.userId} key={user.id} onDelete={deleteUser} user={user} />)}
                </tbody>
              </table>
              </div>
            </>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center text-slate-600">No registered accounts yet. Create the first account above.</p>
          )}
        </section>
      </main>
    </div>
  );
}
