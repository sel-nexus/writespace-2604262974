import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ReadBlog from './pages/ReadBlog.jsx';
import WriteBlog from './pages/WriteBlog.jsx';

/** Render the public and guest-entry routes for WriteSpace.
 * @returns {JSX.Element} Application route tree.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route element={<ProtectedRoute />}>
        <Route element={<Home />} path="/blogs" />
        <Route element={<ReadBlog />} path="/blog/:id" />
        <Route element={<WriteBlog />} path="/write" />
        <Route element={<WriteBlog />} path="/edit/:id" />
      </Route>
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<Navigate replace to="/admin" />} path="/admin" />
        <Route element={<Navigate replace to="/users" />} path="/users" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
