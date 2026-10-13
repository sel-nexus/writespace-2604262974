import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { register, roleHome } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';

/** Render the local account registration form.
 * @returns {JSX.Element} Registration page.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [fields, setFields] = useState({ displayName: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  if (session) return <Navigate replace to={roleHome(session)} />;

  const update = (event) => setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const result = register(fields);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(roleHome(result.session), { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-12">
      <section aria-labelledby="register-title" className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
        <Link className="font-display text-lg font-extrabold text-slate-900" to="/">Write<span className="text-indigo-600">Space</span></Link>
        <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight text-slate-900" id="register-title">Make space to write</h1>
        <p className="mt-2 text-slate-600">Create your local writer account.</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="displayName">Display Name</label>
            <input aria-required="true" autoComplete="name" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="displayName" name="displayName" onChange={update} required value={fields.displayName} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="username">Username</label>
            <input aria-required="true" autoComplete="username" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="username" name="username" onChange={update} required value={fields.username} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
            <input aria-required="true" autoComplete="new-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="password" name="password" onChange={update} required type="password" value={fields.password} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="confirmPassword">Confirm Password</label>
            <input aria-required="true" autoComplete="new-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="confirmPassword" name="confirmPassword" onChange={update} required type="password" value={fields.confirmPassword} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" id="register-error" role="alert">{error}</p>}
          <button aria-describedby={error ? 'register-error' : undefined} className="w-full rounded-full bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">Create Account</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link className="font-bold text-indigo-700 underline underline-offset-4" to="/login">Login</Link></p>
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">This demonstration stores account details in this browser only. Do not use real credentials.</p>
      </section>
    </main>
  );
}
