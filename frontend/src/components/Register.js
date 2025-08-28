import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserCheck } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'consumer',
  });

  const navigate = useNavigate();

  // ✅ Use Azure backend URL set in env (fallback to localhost for dev)
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, form);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center"
            >
              <UserCheck className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">Register</h2>
            <p className="text-gray-600 text-sm">Create your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  placeholder="Enter your username"
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="Enter your email"
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-white"
              >
                <option value="consumer">Consumer</option>
                <option value="creator">Creator</option>
              </select>
            </div>

            {/* Register Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-medium transition-colors duration-200 focus:ring-4 focus:ring-green-200 mt-6"
            >
              Register
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={handleLogin}
              className="text-green-600 hover:text-green-700 font-medium transition-colors bg-transparent border-none cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
