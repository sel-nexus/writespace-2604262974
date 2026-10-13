import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { clearSession } from '../utils/storage.js';

/** Render authenticated navigation with role-aware links and a mobile menu.
 * @param {{session: object}} props Navigation properties.
 * @returns {JSX.Element} Authenticated navigation bar.
 */
export default function Navbar({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    { label: 'All Blogs', to: '/blogs' },
    { label: 'Write', to: '/write' },
    ...(session.role === 'admin' ? [{ label: 'Users', to: '/users' }] : []),
  ];
  const logout = () => {
    clearSession();
    navigate('/', { replace: true });
  };
  const linkClass = ({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'}`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link aria-label="WriteSpace home" className="shrink-0 font-display text-xl font-extrabold tracking-tight text-slate-900" to="/">Write<span className="text-indigo-600">Space</span></Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => <NavLink className={linkClass} key={link.to} to={link.to}>{link.label}</NavLink>)}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Avatar role={session.role} size="sm" />
          <span className="max-w-36 truncate text-sm font-semibold text-slate-700">{session.displayName}</span>
          <button className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600" onClick={logout} type="button">Logout</button>
        </div>
        <button aria-controls="mobile-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden" onClick={() => setMenuOpen((open) => !open)} type="button">
          <span aria-hidden="true" className="text-2xl leading-none">{menuOpen ? '×' : '☰'}</span>
        </button>
      </nav>
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden" id="mobile-navigation">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {links.map((link) => <NavLink className={linkClass} key={link.to} onClick={() => setMenuOpen(false)} to={link.to}>{link.label}</NavLink>)}
            <div className="mt-2 flex items-center gap-3 border-t border-slate-100 pt-4">
              <Avatar role={session.role} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{session.displayName}</span>
              <button className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100" onClick={logout} type="button">Logout</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

Navbar.propTypes = { session: PropTypes.object.isRequired };
