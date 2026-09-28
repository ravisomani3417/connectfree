const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const reelSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video: { type: String, required: true },
    caption: { type: String, default: '', maxlength: 300 },
    category: { type: String, enum: CATEGORIES, default: 'social' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reelSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reel', reelSchema);
