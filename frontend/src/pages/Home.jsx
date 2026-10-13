import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getPosts, getSession } from '../utils/storage.js';

/** Render the authenticated newest-first post collection.
 * @returns {JSX.Element} Blog list page.
 */
export default function Home() {
  const session = getSession();
  const posts = getPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">The community</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-900">All Blogs</h1>
            <p className="mt-2 text-slate-600">Read what the community has been thinking about.</p>
          </div>
          <Link className="rounded-full bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/write">Write a post</Link>
        </div>
        {posts.length ? (
          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => <BlogCard index={index} key={post.id} post={post} session={session} />)}
          </div>
        ) : (
          <section className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900">No blogs yet. Be the first to write one!</h2>
            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">Your first post can start a conversation. Open a blank page and share an idea.</p>
            <Link className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/write">Write your first post</Link>
          </section>
        )}
      </main>
    </div>
  );
}
