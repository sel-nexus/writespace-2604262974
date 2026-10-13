import { Link, useNavigate } from 'react-router-dom';
import { getPosts, getSession } from '../utils/storage.js';
import PublicNavbar from '../components/PublicNavbar.jsx';

const features = [
  { title: 'Write Freely', text: 'A plain-text editor keeps your attention on the words, not the tools.', mark: 'Aa', tone: 'bg-indigo-50 text-indigo-700' },
  { title: 'Private & Local', text: 'Your writing stays in this browser, under your control.', mark: '⌂', tone: 'bg-violet-50 text-violet-700' },
  { title: 'Instant & Fast', text: 'Open your space and start writing without waiting on a server.', mark: '↗', tone: 'bg-pink-50 text-pink-700' },
];

/** Format a post date for the public preview.
 * @param {string} value ISO date value.
 * @returns {string} Human-readable date.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render the public introduction and recent local posts.
 * @returns {JSX.Element} Landing page.
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const session = getSession();
  const posts = getPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const startReading = () => navigate(session ? '/blogs' : '/login');

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <PublicNavbar session={session} />
      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-20">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-white/80">A quieter place to write</p>
              <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Your thoughts.<br />Your space.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">Your thoughts. Your space. Beautifully simple.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-6 py-3.5 font-bold text-indigo-700 shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={startReading} type="button">Start Reading</button>
                <Link className="rounded-full border border-white/60 px-6 py-3.5 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" to="/register">Get Started Free</Link>
              </div>
            </div>
            <div aria-hidden="true" className="relative mx-auto hidden h-[360px] w-full max-w-[420px] md:block">
              <div className="absolute right-4 top-8 h-64 w-72 rotate-[-7deg] rounded-3xl border border-white/30 bg-white/15 p-6 shadow-2xl backdrop-blur-sm animate-[float_6s_ease-in-out_infinite]">
                <div className="h-2 w-16 rounded-full bg-white/60" />
                <div className="mt-8 h-4 w-4/5 rounded-full bg-white/90" />
                <div className="mt-3 h-3 w-3/5 rounded-full bg-white/50" />
                <div className="mt-8 space-y-3"><div className="h-2 rounded-full bg-white/45" /><div className="h-2 w-5/6 rounded-full bg-white/45" /><div className="h-2 w-2/3 rounded-full bg-white/45" /></div>
              </div>
              <div className="absolute bottom-5 left-0 w-56 rotate-[5deg] rounded-2xl border border-white/40 bg-white p-5 text-slate-800 shadow-xl animate-[float_7s_ease-in-out_infinite]">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">A new page</p>
                <p className="mt-2 font-display text-lg font-extrabold">Make room for ideas.</p>
                <p className="mt-2 text-sm text-slate-500">Just you, a blank page, and a little time.</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="features-title" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">Made for the page</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl" id="features-title">A simple space for your next thought.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_12px_36px_rgba(30,41,59,0.06)] transition-transform hover:-translate-y-1" key={feature.title}>
                <span aria-hidden="true" className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl font-extrabold ${feature.tone}`}>{feature.mark}</span>
                <h3 className="mt-6 font-display text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="recent-title" className="bg-slate-50 px-5 py-20 md:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">From the community</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900" id="recent-title">Recent writing</h2>
              </div>
              <Link className="font-bold text-indigo-700 underline decoration-indigo-200 underline-offset-4 hover:text-indigo-900" to={session ? '/blogs' : '/login'}>Browse all posts</Link>
            </div>
            {posts.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {posts.map((post) => (
                  <Link className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg" key={post.id} to={session ? `/blog/${post.id}` : '/login'}>
                    <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
                    <h3 className="mt-3 font-display text-xl font-bold text-slate-900 group-hover:text-indigo-700">{post.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{post.content.slice(0, 140)}{post.content.length > 140 ? '…' : ''}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">No posts yet - check back soon!</p>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 px-5 py-10 text-slate-300 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="font-display text-lg font-extrabold text-white" to="/">WriteSpace</Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to={session ? '/blogs' : '/login'}>All Blogs</Link>
            <Link className="hover:text-white" to="/login">Login</Link>
            <Link className="hover:text-white" to="/register">Register</Link>
          </nav>
          <p className="text-sm">© {new Date().getFullYear()} WriteSpace</p>
        </div>
      </footer>
    </div>
  );
}
