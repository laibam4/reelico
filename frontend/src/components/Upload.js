import React, { useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { CloudUpload, Film, User, Building, Tag, Shield, FileVideo } from 'lucide-react';

const Upload = () => {
  const [form, setForm] = useState({
    title: '',
    publisher: '',
    producer: '',
    genre: '',
    ageRating: '',
  });
  const [video, setVideo] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video) { alert('Please choose a video file'); return; }
    if (!form.title || !form.publisher || !form.producer) {
      alert('Title, Publisher and Producer are required');
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== undefined && data.append(k, v));
    data.append('video', video);

    try {
      setBusy(true);
      const token = localStorage.getItem('token');
      const res = await api.post('/api/videos/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      alert(res.data.message || 'Uploaded!');
      // reset
      setForm({ title: '', publisher: '', producer: '', genre: '', ageRating: '' });
      setVideo(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center"
            >
              <CloudUpload className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">Upload Video</h2>
            <p className="text-gray-600 text-sm">Share your content</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Film className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  placeholder="Enter video title"
                  onChange={onChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Publisher Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="publisher"
                  value={form.publisher}
                  placeholder="Enter publisher name"
                  onChange={onChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Producer Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producer *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="producer"
                  value={form.producer}
                  placeholder="Enter producer name"
                  onChange={onChange}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Genre Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="genre"
                  value={form.genre}
                  placeholder="Enter genre (optional)"
                  onChange={onChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Age Rating Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Rating</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="ageRating"
                  value={form.ageRating}
                  placeholder="e.g., PG, 18+ (optional)"
                  onChange={onChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Video File Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video File *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files?.[0] || null)}
                  required
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-50 file:text-green-700 file:text-sm file:font-medium hover:file:bg-green-100"
                />
              </div>
              {video && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <FileVideo className="w-4 h-4 mr-1" />
                  {video.name}
                </div>
              )}
            </div>

            {/* Upload Button */}
            <motion.button
              type="submit"
              disabled={busy}
              whileHover={!busy ? { scale: 1.01 } : {}}
              whileTap={!busy ? { scale: 0.99 } : {}}
              className={`w-full py-2.5 rounded-md font-medium transition-colors duration-200 focus:ring-4 focus:ring-green-200 mt-6 ${
                busy 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              onClick={handleSubmit}
            >
              {busy ? 'Uploading...' : 'Upload'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;
