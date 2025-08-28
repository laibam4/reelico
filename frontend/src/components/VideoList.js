import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VideoList.css';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (query = '') => {
    try {
      const res = await axios.get(`http://localhost:5000/api/videos${query ? `?search=${query}` : ''}`);
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to fetch videos', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos(search);
  };

  return (
    <div className="video-list-container">
      <h2>Latest Videos</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by title, genre or publisher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video._id} className="video-card">
            <h4>{video.title}</h4>
            <p><strong>Genre:</strong> {video.genre}</p>
            <p><strong>Publisher:</strong> {video.publisher}</p>
            <p><strong>Producer:</strong> {video.producer}</p>
            <p><strong>Age Rating:</strong> {video.ageRating}</p>
            <p><strong>Creator:</strong> {video.creator?.username}</p>
            <video width="100%" controls src={`http://localhost:5000/${video.videoUrl}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
