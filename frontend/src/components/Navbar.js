import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const linkClass = 'px-4 py-2 rounded-md font-medium transition hover:bg-gray-200';
  const activeClass = 'bg-blue-600 text-white shadow';

  useEffect(() => {
    // Read auth saved by Login component
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">🎬 Reelico</h1>

        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
          >
            Home
          </NavLink>

          {/* Always show Profile link (optional), or only when logged in */}
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
          >
            Profile
          </NavLink>

          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <span className="px-3 py-2 text-sm text-gray-600">
                Signed in as <span className="font-semibold">{user.username || user.email}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md font-medium transition bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
