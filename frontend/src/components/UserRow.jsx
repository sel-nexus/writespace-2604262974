import PropTypes from 'prop-types';
import Avatar from './Avatar.jsx';

/** Format an account creation date for the user list.
 * @param {string} value ISO date value.
 * @returns {string} Formatted date or fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render a responsive account row with protected deletion affordances.
 * @param {{user: object, currentUserId: string, onDelete: Function}} props Row properties.
 * @returns {JSX.Element} User row or mobile card.
 */
export default function UserRow({ user, currentUserId, onDelete }) {
  const isDefaultAdmin = user.id === 'writespace-default-admin';
  const isCurrentUser = user.id === currentUserId;
  const disabled = isDefaultAdmin || isCurrentUser;
  const reason = isDefaultAdmin ? 'Default admin cannot be deleted.' : 'You cannot delete your own account.';
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar label={`${user.displayName} avatar`} role={user.role} size="sm" />
          <span className="font-semibold text-slate-800">{user.displayName}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-slate-600">{user.username}</td>
      <td className="px-4 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${user.role === 'admin' ? 'bg-violet-100 text-violet-800 ring-violet-200' : 'bg-indigo-100 text-indigo-800 ring-indigo-200'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span>
      </td>
      <td className="px-4 py-4 text-slate-500">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-4 text-right">
        <button aria-label={disabled ? reason : `Delete ${user.displayName}`} className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled} onClick={() => onDelete(user)} title={disabled ? reason : undefined} type="button">Delete</button>
      </td>
    </tr>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({ id: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired, username: PropTypes.string.isRequired, role: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};
