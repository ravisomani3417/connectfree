const Reel = require('../models/Reel');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const { CATEGORIES } = require('../config/constants');

const PAGE_SIZE = 8;

exports.createReel = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.mimetype.startsWith('video')) {
    return res.status(400).json({ message: 'A video file is required' });
  }
  const reel = await Reel.create({
    author: req.user._id,
    video: `/uploads/${req.file.filename}`,
    caption: req.body.caption || '',
    category: CATEGORIES.includes(req.body.category) ? req.body.category : 'social',
  });
  await reel.populate('author', 'name username avatar');
  res.status(201).json(reel);
});

exports.getReels = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const query = {};
  if (req.query.category && req.query.category !== 'all') query.category = req.query.category;
  const reels = await Reel.find(query)
    .sort('-createdAt')
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE + 1)
    .populate('author', 'name username avatar');
  res.json({ reels: reels.slice(0, PAGE_SIZE), hasMore: reels.length > PAGE_SIZE });
});

exports.toggleLike = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return res.status(404).json({ message: 'Reel not found' });
  const liked = reel.likes.some((l) => String(l) === String(req.user._id));
  await Reel.updateOne(
    { _id: reel._id },
    liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
  );
  if (!liked) await notify(req, { user: reel.author, actor: req.user._id, type: 'like', ref: reel._id });
  res.json({ liked: !liked });
});

exports.addView = asyncHandler(async (req, res) => {
  await Reel.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });
  res.json({ ok: true });
});

exports.deleteReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) return res.status(404).json({ message: 'Reel not found' });
  if (String(reel.author) !== String(req.user._id)) return res.status(403).json({ message: 'Not your reel' });
  await reel.deleteOne();
  res.json({ message: 'Reel deleted' });
});
