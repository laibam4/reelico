const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');
const { BlobServiceClient } = require('@azure/storage-blob'); // ✅ Azure Blob

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

// ---------- Azure Blob config ----------
const AZURE_CONN = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'videos';

let containerClient = null;
try {
  if (!AZURE_CONN) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING is missing');
  } else {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONN);
    containerClient = blobServiceClient.getContainerClient(CONTAINER);
  }
} catch (e) {
  console.error('❌ Failed to init Azure Blob:', e?.message || e);
}

// ---------- multer storage (use memory for Blob uploads) ----------
const storage = multer.memoryStorage(); // <-- changed from disk to memory for Blob upload
const upload = multer({ storage });

// Utility to create unique blob name
function makeBlobName(original) {
  const ext = path.extname(original || '.mp4') || '.mp4';
  const base = path.basename(original || 'video', ext).replace(/\s+/g, '-');
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`;
}

// POST /api/videos/upload   (requires auth)
router.post('/upload', requireAuth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { title, publisher, producer, genre, ageRating } = req.body;
    if (!title || !publisher || !producer) {
      return res.status(400).json({ message: 'Title, publisher and producer are required' });
    }

    if (!containerClient) {
      return res.status(500).json({ message: 'Storage not configured' });
    }

    // Upload buffer to Azure Blob
    const blobName = makeBlobName(req.file.originalname);
    const blockBlob = containerClient.getBlockBlobClient(blobName);

    await blockBlob.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype || 'video/mp4' },
    });

    // Build a backend stream URL so the container can remain PRIVATE
    const streamUrl = `${req.protocol}://${req.get('host')}/api/videos/stream/${encodeURIComponent(blobName)}`;

    const doc = await Video.create({
      title,
      publisher,
      producer,
      genre,
      ageRating,
      videoUrl: streamUrl,                 // <-- now served via backend stream route
      blobName,                            // store blob name for reference
      creator: req.userId,                 // tie to logged-in user
      size: req.file.size || undefined,
      mimeType: req.file.mimetype || undefined,
    });

    return res.status(201).json({ message: 'Video uploaded successfully', video: doc });
  } catch (err) {
    console.error('Upload failed:', err);
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

// GET /api/videos/stream/:blobName  (supports Range for video playback)
router.get('/stream/:blobName', async (req, res) => {
  try {
    if (!containerClient) {
      return res.status(500).json({ message: 'Storage not configured' });
    }

    const blobName = req.params.blobName;
    const blockBlob = containerClient.getBlockBlobClient(blobName);

    const props = await blockBlob.getProperties();
    const fileSize = Number(props.contentLength || 0);
    const contentType = props.contentType || 'video/mp4';

    const range = req.headers.range;
    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      const download = await blockBlob.download(start, chunkSize);
      download.readableStreamBody.pipe(res);
    } else {
      res.set({
        'Content-Length': fileSize,
        'Content-Type': contentType,
      });
      const download = await blockBlob.download(0);
      download.readableStreamBody.pipe(res);
    }
  } catch (err) {
    console.error('Stream error:', err);
    res.status(404).json({ message: 'Blob not found' });
  }
});

module.exports = router;
