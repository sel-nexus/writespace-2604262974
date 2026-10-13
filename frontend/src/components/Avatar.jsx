import PropTypes from 'prop-types';

/** Render the role-specific WriteSpace identity mark.
 * @param {{role: string, label?: string, size?: string}} props Avatar properties.
 * @returns {JSX.Element} Accessible role avatar.
 */
export default function Avatar({ role, label, size = 'md' }) {
  const isAdmin = role === 'admin';
  const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-14 w-14 text-xl' };
  return (
    <span
      aria-label={label || (isAdmin ? 'Administrator' : 'Writer')}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${isAdmin ? 'bg-violet-600' : 'bg-indigo-500'} ${sizes[size] || sizes.md}`}
      role="img"
    >
      {isAdmin ? '♛' : '▤'}
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.string.isRequired,
  label: PropTypes.string,
  size: PropTypes.string,
};
