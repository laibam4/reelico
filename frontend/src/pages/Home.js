import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Heart, Share2, Film, Calendar, Tag, Shield, Upload } from 'lucide-react';

const prettyBytes = (n = 0) => {
  if (!Number.isFinite(n)) return '0 B';
  const u = ['B','KB','MB','GB','TB']; let i = 0, v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
};

const Home = () => {
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // liked set persisted in localStorage
  const [liked, setLiked] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('likedVideos') || '[]'));
    } catch { return new Set(); }
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await api.get('/api/videos', {
          params: debouncedQ ? { search: debouncedQ } : {},
        });
        if (!on) return;
        setVideos(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!on) return;
        setErr(e?.response?.data?.message || 'Failed to load videos');
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [debouncedQ]);

  const toggleLike = (id) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('likedVideos', JSON.stringify([...next]));
      return next;
    });
  };

  const handleShare = async (video) => {
    const url = video.videoUrl || window.location.href;
    const shareData = {
      title: video.title || 'Reelico video',
      text: 'Check out this video on Reelico!',
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch {
      // ignore cancel
    }
  };

  const content = useMemo(() => {
    if (loading) return <div className="text-gray-500">Loading videos…</div>;
    if (err) return <div className="text-red-600">{err}</div>;
    if (videos.length === 0) {
      return (
        <div className="text-gray-600">
          No videos yet.
          <Link to="/upload" className="text-green-600 hover:text-green-700 font-medium ml-1">
            Upload one
          </Link>
          {' '}to get started.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => {
          const id = String(v._id || v.blobName || v.videoUrl || Math.random());
          const likedNow = liked.has(id);
          return (
            <motion.div
              key={id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
            >
              <div className="aspect-video bg-black">
                {v.videoUrl ? (
                  <video
                    src={v.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Film className="w-6 h-6 mr-2" /> No preview
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {v.title || v.originalName || 'Untitled'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-sm transition ${
                        likedNow
                          ? 'border-red-200 text-red-600 bg-red-50'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                      aria-pressed={likedNow}
                      title={likedNow ? 'Unlike' : 'Like'}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{likedNow ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => handleShare(v)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  {v.publisher ? `Publisher: ${v.publisher}` : ''}
                  {v.publisher && v.producer ? ' • ' : ''}
                  {v.producer ? `Producer: ${v.producer}` : ''}
                </div>

                <div className="mt-2 text-xs text-gray-500 flex items-center flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(v.createdAt || Date.now()).toLocaleString()}
                  </span>
                  {v.genre && (
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {v.genre}
                    </span>
                  )}
                  {v.ageRating && (
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {v.ageRating}
                    </span>
                  )}
                  {typeof v.size === 'number' && (
                    <span>{prettyBytes(v.size)}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [videos, loading, err, liked]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Explore Videos</h1>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, genre, or publisher…"
              className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Feed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          {content}
        </motion.div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-10">
          © {new Date().getFullYear()} Reelico. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Home;
