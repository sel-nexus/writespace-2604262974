import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

const accents = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'];

/** Format a post timestamp for display.
 * @param {string} value ISO date value.
 * @returns {string} Formatted date or fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render a post preview with author identity and role-aware edit access.
 * @param {{post: object, index: number, session: object}} props Card properties.
 * @returns {JSX.Element} Blog preview card.
 */
export default function BlogCard({ post, index, session }) {
  const canEdit = session.role === 'admin' || post.authorId === session.userId;
  const excerpt = post.content.slice(0, 120);
  return (
    <article className={`flex min-h-64 flex-col rounded-2xl border border-slate-100 border-t-4 bg-white p-6 shadow-[0_12px_36px_rgba(30,41,59,0.06)] transition-transform hover:-translate-y-1 hover:shadow-lg ${accents[index % accents.length]}`}>
      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        {canEdit && <Link aria-label={`Edit ${post.title}`} className="rounded-full px-3 py-1.5 font-semibold text-indigo-700 hover:bg-indigo-50" to={`/edit/${post.id}`}>Edit</Link>}
      </div>
      <Link className="group mt-4 flex-1" to={`/blog/${post.id}`}>
        <h2 className="font-display text-xl font-extrabold leading-snug text-slate-900 group-hover:text-indigo-700">{post.title}</h2>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{excerpt}{post.content.length > 120 ? '…' : ''}</p>
      </Link>
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
        <Avatar role={post.authorRole || 'user'} size="sm" label={`${post.authorName} avatar`} />
        <span className="text-sm font-semibold text-slate-700">{post.authorName}</span>
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, content: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired, authorId: PropTypes.string.isRequired, authorName: PropTypes.string.isRequired, authorRole: PropTypes.string }),
  index: PropTypes.number.isRequired,
  session: PropTypes.object.isRequired,
};
