const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    media: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    caption: { type: String, default: '', maxlength: 150 },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

// TTL index: MongoDB deletes the story automatically once expiresAt has passed
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, createdAt: 1 });

module.exports = mongoose.model('Story', storySchema);
