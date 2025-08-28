import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Login from './components/Login';
import Register from './components/Register';
import Upload from './components/Upload'; // ✅ added

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wrapper (header lives here) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          {/* Moved into layout so header appears on these too */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="upload" element={<Upload />} /> {/* ✅ added */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
