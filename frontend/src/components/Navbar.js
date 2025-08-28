import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const linkClass =
    'px-4 py-2 rounded-md font-medium transition hover:bg-gray-200';
  const activeClass = 'bg-blue-600 text-white shadow';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">🎬 Reelico</h1>
        <div className="space-x-3">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}
          >
            Home
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}
          >
            Profile
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}
          >
            Register
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
 
