import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, roleHome } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';

/** Render the local demo login form.
 * @returns {JSX.Element} Login page.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  if (session) return <Navigate replace to={roleHome(session)} />;

  const submit = (event) => {
    event.preventDefault();
    const result = login(username.trim(), password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(roleHome(result.session), { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-12">
      <section aria-labelledby="login-title" className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <Link className="font-display text-lg font-extrabold text-slate-900" to="/">Write<span className="text-indigo-600">Space</span></Link>
        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight text-slate-900" id="login-title">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to return to your writing space.</p>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="username">Username</label>
            <input aria-required="true" autoComplete="username" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="username" onChange={(event) => setUsername(event.target.value)} required value={username} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
            <input aria-required="true" autoComplete="current-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" id="login-error" role="alert">{error}</p>}
          <button aria-describedby={error ? 'login-error' : undefined} className="w-full rounded-full bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">Login</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">New to WriteSpace? <Link className="font-bold text-indigo-700 underline underline-offset-4" to="/register">Create an account</Link></p>
        <p className="mt-5 rounded-xl bg-indigo-50 px-4 py-3 text-xs leading-5 text-indigo-900">Demo administrator: <strong>admin</strong> / <strong>admin</strong>. This local demo stores passwords in your browser. Do not use a real password.</p>
      </section>
    </main>
  );
}
