import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

/** Render public navigation with role-aware actions for signed-in visitors.
 * @param {{session: object|null}} props Navigation properties.
 * @returns {JSX.Element} Public site navigation.
 */
export default function PublicNavbar({ session }) {
  const home = session?.role === 'admin' ? '/admin' : '/blogs';
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link aria-label="WriteSpace home" className="font-display text-xl font-extrabold tracking-tight text-slate-900" to="/">
          Write<span className="text-indigo-600">Space</span>
        </Link>
        {session ? (
          <div className="flex items-center gap-3">
            <Avatar role={session.role} size="sm" />
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">{session.displayName}</span>
            <Link className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to={home}>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link className="rounded-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600" to="/login">
              Login
            </Link>
            <Link className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/register">
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

PublicNavbar.propTypes = { session: PropTypes.object };
