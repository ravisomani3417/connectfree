const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '', maxlength: 3000 },
    media: { type: String, default: '' },
    mediaType: { type: String, enum: ['image', 'video', ''], default: '' },
    category: { type: String, enum: CATEGORIES, default: 'social' },
    hashtags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema);
