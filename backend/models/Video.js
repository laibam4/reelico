const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  publisher: { type: String, required: true },
  producer: { type: String, required: true },
  genre: { type: String },
  ageRating: { type: String }, // e.g., PG, 18
  videoUrl: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
