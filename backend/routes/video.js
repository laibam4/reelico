const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');

// ---------- auth (upload must be logged in) ----------
function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// ---------- ensure uploads dir ----------
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ---------- multer storage ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

// POST /api/videos/upload   (requires auth)
router.post('/upload', requireAuth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { title, publisher, producer, genre, ageRating } = req.body;
    if (!title || !publisher || !producer) {
      return res.status(400).json({ message: 'Title, publisher and producer are required' });
    }

    const doc = await Video.create({
      title,
      publisher,
      producer,
      genre,
      ageRating,
      videoUrl: `/uploads/${path.basename(req.file.path)}`,
      creator: req.userId,                 // tie to logged-in user
      size: req.file.size || undefined,    // may be undefined in your schema; harmless
    });

    return res.status(201).json({ message: 'Video uploaded successfully', video: doc });
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// GET /api/videos  (public; supports ?creator=<id> and ?search=)
router.get('/', async (req, res) => {
  try {
    const { search, creator } = req.query;

    const query = {};
    if (creator) query.creator = creator;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { genre: new RegExp(search, 'i') },
        { publisher: new RegExp(search, 'i') },
      ];
    }

    const items = await Video.find(query)
      .sort({ createdAt: -1 })
      .populate('creator', 'username email');

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', error: err.message });
  }
});

module.exports = router;
