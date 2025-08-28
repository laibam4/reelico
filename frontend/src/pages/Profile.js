import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api'; // ✅ central API client
import { User, Upload, Film, Calendar, Tag, Shield } from 'lucide-react';

const prettyBytes = (n = 0) => {
  if (!Number.isFinite(n)) return '0 B';
  const u = ['B','KB','MB','GB','TB']; let i = 0, v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
};

const Profile = () => {
  // Parse the saved user ONCE to avoid changing reference every render
  const user = useMemo(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Stable string id for effect dependency
  const userId = useMemo(() => {
    if (!user) return '';
    return String(user.id || user._id || '');
  }, [user]);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    // If not logged in, stop early
    if (!userId) {
      setVideos([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const token = localStorage.getItem('token');
        const res = await api.get(`/api/videos?creator=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setVideos(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || 'Failed to load your videos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [userId]);

  const stats = useMemo(() => {
    const totalSize = videos.reduce((s, v) => s + (v.size || 0), 0);
    const recent = [...videos].slice(0, 5);
    return { count: videos.length, recent };
  }, [videos]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center"
              >
                <User className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Profile</h2>
              <p className="text-gray-600 text-sm mb-6">Please log in to see your dashboard and uploads.</p>
              <Link
                to="/login"
                className="inline-block w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-medium transition-colors duration-200"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl font-semibold">
                  {(user.username || user.email || 'U').slice(0,1).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Your Profile</h2>
                  <p className="text-gray-600">Welcome back, {user.username || user.email}.</p>
                  <div className="text-sm text-gray-500 mt-1">
                    {user.role ? `Role: ${user.role}` : ''} {user.role && user.email ? ' • ' : ''} {user.email || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Film className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stats.count}</div>
                    <div className="text-sm text-gray-600">Total Uploads</div>
                    <div className="text-xs text-gray-400">Only your uploads are counted</div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    New Upload
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent uploads */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Uploads</h3>

              {loading ? (
                <div className="text-gray-500">Loading your uploads…</div>
              ) : err ? (
                <div className="text-red-600">{err}</div>
              ) : stats.recent.length === 0 ? (
                <div className="text-gray-500">
                  You haven't uploaded anything yet. <Link className="text-green-600 hover:text-green-700 font-medium" to="/upload">Upload a video</Link>.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {stats.recent.map(v => (
                    <li key={v._id || v.filename} className="py-4 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 truncate">{v.title || v.originalName || 'Untitled'}</div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(v.createdAt || Date.now()).toLocaleString()}
                          {v.genre && (
                            <>
                              <span>•</span>
                              <Tag className="w-3 h-3" />
                              {v.genre}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 ml-4">{prettyBytes(v.size)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* All videos grid */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Videos</h3>

            {loading ? (
              <div className="text-gray-500">Loading…</div>
            ) : videos.length === 0 ? (
              <div className="text-gray-500">
                No videos yet. <Link className="text-green-600 hover:text-green-700 font-medium" to="/upload">Upload one</Link> to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(v => (
                  <motion.div
                    key={v._id || v.filename}
                    className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {v.videoUrl ? (
                        <video
                          src={v.videoUrl}
                          controls
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : (
                        <div className="p-6 text-gray-500 text-sm flex items-center gap-2">
                          <Film className="w-4 h-4" />
                          No preview available
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-gray-800 truncate">{v.title || v.originalName || 'Untitled'}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {v.publisher ? `Publisher: ${v.publisher}` : ''}
                        {v.publisher && v.producer ? ' • ' : ''}
                        {v.producer ? `Producer: ${v.producer}` : ''}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                        {v.genre && (
                          <>
                            <Tag className="w-3 h-3" />
                            {v.genre}
                          </>
                        )}
                        {v.genre && v.ageRating && <span>•</span>}
                        {v.ageRating && (
                          <>
                            <Shield className="w-3 h-3" />
                            {v.ageRating}
                          </>
                        )}
                        {(v.genre || v.ageRating) && <span>•</span>}
                        {prettyBytes(v.size)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
