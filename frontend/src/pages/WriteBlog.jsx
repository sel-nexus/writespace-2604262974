import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getPosts, getSession, savePosts } from '../utils/storage.js';

/** Render the authenticated post creation and editing form.
 * @returns {JSX.Element} Post authoring page.
 */
export default function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const editing = Boolean(id);
  const post = editing ? getPosts().find((item) => item.id === id) : null;
  const canEdit = post && (session?.role === 'admin' || post.authorId === session?.userId);
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [errors, setErrors] = useState({});
  const [storageError, setStorageError] = useState('');

  if (!session) return <Navigate replace to="/login" />;
  if (editing && !canEdit) return <Navigate replace to="/blogs" />;

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!content.trim()) nextErrors.content = 'Content is required.';
    setErrors(nextErrors);
    setStorageError('');
    if (Object.keys(nextErrors).length) return;

    const posts = getPosts();
    const savedPost = editing
      ? { ...post, title: title.trim(), content }
      : {
        id: crypto.randomUUID(),
        title: title.trim(),
        content,
        createdAt: new Date().toISOString(),
        authorId: session.userId,
        authorName: session.displayName,
      };
    const nextPosts = editing
      ? posts.map((item) => (item.id === id ? savedPost : item))
      : [savedPost, ...posts];
    if (!savePosts(nextPosts)) {
      setStorageError('Your browser could not save this post. Check available storage and try again.');
      return;
    }
    navigate(`/blog/${savedPost.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar session={session} />
      <main className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
        <Link className="inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900" to="/blogs"><span aria-hidden="true">←</span> Back to All Posts</Link>
        <section className="mt-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_16px_48px_rgba(30,41,59,0.07)] sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-indigo-600">Your writing space</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900">{editing ? 'Edit Post' : 'Write a Post'}</h1>
          <p className="mt-2 text-slate-600">A clear title and your own words are all you need.</p>
          <form className="mt-8 space-y-6" noValidate onSubmit={submit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="post-title">Title</label>
              <input aria-describedby={errors.title ? 'title-error' : undefined} aria-invalid={Boolean(errors.title)} aria-required="true" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-shadow focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="post-title" onChange={(event) => setTitle(event.target.value)} placeholder="Give your post a title" value={title} />
              {errors.title && <p className="mt-2 text-sm font-medium text-red-700" id="title-error" role="alert">{errors.title}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="post-content">Content</label>
              <textarea aria-describedby={errors.content ? 'content-error' : 'content-count'} aria-invalid={Boolean(errors.content)} aria-required="true" className="min-h-64 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 leading-7 text-slate-800 outline-none transition-shadow focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="post-content" onChange={(event) => setContent(event.target.value)} placeholder="Start writing here..." value={content} />
              {errors.content && <p className="mt-2 text-sm font-medium text-red-700" id="content-error" role="alert">{errors.content}</p>}
              <p className="mt-2 text-right text-sm text-slate-500" id="content-count" role="status">{content.length} characters</p>
            </div>
            {storageError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{storageError}</p>}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <Link className="inline-flex justify-center rounded-full px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600" to={editing ? `/blog/${id}` : '/blogs'}>Cancel</Link>
              <button className="rounded-full bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">{editing ? 'Save Changes' : 'Save Post'}</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
