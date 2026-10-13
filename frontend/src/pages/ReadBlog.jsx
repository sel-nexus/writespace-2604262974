import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Avatar from '../components/Avatar.jsx';
import { getPosts, getSession, savePosts } from '../utils/storage.js';

/** Format a post timestamp for the reader.
 * @param {string} value ISO date value.
 * @returns {string} Formatted date or fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : new Intl.DateTimeFormat('en', { month: 'long', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render a full post and enforce role-aware edit/delete controls.
 * @returns {JSX.Element} Post reader page.
 */
export default function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [storageError, setStorageError] = useState('');
  const post = getPosts().find((item) => item.id === id);
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar session={session} />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Post not found</h1>
          <p className="mt-3 text-slate-600">This post may have been removed or the link may be incorrect.</p>
          <Link className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-3 font-bold text-white" to="/blogs">Back to All Posts</Link>
        </main>
      </div>
    );
  }

  const canManage = session.role === 'admin' || post.authorId === session.userId;
  const removePost = () => {
    if (!canManage || !window.confirm('Are you sure you want to delete this post?')) return;
    const remaining = getPosts().filter((item) => item.id !== post.id);
    if (!savePosts(remaining)) {
      setStorageError('Your browser could not save this change. Check available storage and try again.');
      return;
    }
    navigate('/blogs', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />
      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-16">
        <Link className="inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900" to="/blogs"><span aria-hidden="true">←</span> Back to All Posts</Link>
        <article className="mt-7 rounded-3xl border border-slate-100 bg-white px-6 py-8 shadow-[0_16px_48px_rgba(30,41,59,0.07)] sm:px-10 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar label={`${post.authorName} avatar`} role={post.authorRole || 'user'} />
              <div>
                <p className="font-semibold text-slate-800">{post.authorName}</p>
                <time className="text-sm text-slate-500" dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </div>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Link className="rounded-full border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50" to={`/edit/${post.id}`}>Edit</Link>
                <button className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600" onClick={removePost} type="button">Delete</button>
              </div>
            )}
          </div>
          <h1 className="mt-9 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
          <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-slate-700 sm:text-lg">{post.content}</div>
          {storageError && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{storageError}</p>}
        </article>
      </main>
    </div>
  );
}
