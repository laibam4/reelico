import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  // Keep header in sync if token changes (e.g., after login/logout)
  useEffect(() => {
    const onStorage = () => setIsAuthed(!!localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Also re-check on route changes (same-tab updates)
  useEffect(() => {
    setIsAuthed(!!localStorage.getItem('token'));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // if you store user too
    setIsAuthed(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4">
      {/* Header */}
      <header className="flex items-center justify-between py-4 border-b">
        <Link to="/" className="text-2xl font-bold text-blue-700">
          Reelico
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>

          {/* Show Upload only if logged in */}
          {isAuthed && (
            <Link
              to="/upload"
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Upload
            </Link>
          )}

          {!isAuthed ? (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      {/* Page body */}
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
