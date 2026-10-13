import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { getPosts, getSession, getUsers, savePosts } from '../utils/storage.js';

/** Format a post date for the administrator's recent activity list.
 * @param {string} value ISO date value.
 * @returns {string} Formatted date or fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render the administrator overview and recent post controls.
 * @returns {JSX.Element} Administrator dashboard.
 */
export default function AdminDashboard() {
  const session = getSession();
  if (session?.role !== 'admin') return <Navigate replace to={session ? '/blogs' : '/login'} />;
  const posts = getPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const users = getUsers();
  const stats = [
    { label: 'Total Posts', value: posts.length, tone: 'indigo' },
    { label: 'Total Users', value: users.length, tone: 'violet' },
    { label: 'Total Admins', value: users.filter((user) => user.role === 'admin').length + 1, tone: 'pink' },
    { label: 'Total users', value: users.filter((user) => user.role === 'user').length, tone: 'teal' },
  ];
  const deletePost = (post) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    savePosts(posts.filter((item) => item.id !== post.id));
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-9 text-white shadow-lg sm:px-10 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/80">WriteSpace administration</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">A clear view of your community.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-white/90">Review recent writing, keep accounts in order, and make space for the next idea.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="rounded-full bg-white px-5 py-3 font-bold text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" to="/write">Write New Post</Link>
            <Link className="rounded-full border border-white/70 px-5 py-3 font-bold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" to="/users">Manage Users</Link>
          </div>
        </section>

        <section aria-label="Community statistics" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => <StatCard key={stat.label} label={stat.label} tone={stat.tone} value={stat.value} />)}
        </section>

        <section aria-labelledby="recent-posts-title" className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">Community activity</p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900" id="recent-posts-title">Recent posts</h2>
            </div>
            <Link className="font-semibold text-indigo-700 underline decoration-indigo-200 underline-offset-4" to="/blogs">View all posts</Link>
          </div>
          {posts.length ? (
            <div className="mt-6 divide-y divide-slate-100">
              {posts.slice(0, 5).map((post) => (
                <article className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0" key={post.id}>
                  <div className="min-w-0 flex-1">
                    <Link className="font-bold text-slate-900 hover:text-indigo-700" to={`/blog/${post.id}`}>{post.title}</Link>
                    <p className="mt-1 text-sm text-slate-500">{post.authorName} · {formatDate(post.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link className="rounded-full px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50" to={`/edit/${post.id}`}>Edit</Link>
                    <button className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100" onClick={() => deletePost(post)} type="button">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center text-slate-600">No posts yet. Write the first one to get started.</p>
          )}
        </section>
      </main>
    </div>
  );
}
