import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { getSession } from '../utils/storage.js';
import { isAdmin, isAuthenticated } from '../utils/auth.js';

/** Enforce client-side authentication and optional administrator access.
 * @param {{adminOnly?: boolean, children?: import('react').ReactNode}} props Guard properties.
 * @returns {JSX.Element} Protected content or a role-appropriate redirect.
 */
export default function ProtectedRoute({ adminOnly = false, children }) {
  const session = getSession();
  if (!isAuthenticated(session)) return <Navigate replace to="/login" />;
  if (adminOnly && !isAdmin(session)) return <Navigate replace to="/blogs" />;
  return children || <Outlet />;
}

ProtectedRoute.propTypes = {
  adminOnly: PropTypes.bool,
  children: PropTypes.node,
};
