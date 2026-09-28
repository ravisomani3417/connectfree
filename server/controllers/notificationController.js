const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(50)
    .populate('actor', 'name username avatar');
  res.json(items);
});

exports.unreadCount = asyncHandler(async (req, res) => {
  res.json({ count: await Notification.countDocuments({ user: req.user._id, read: false }) });
});

exports.readAll = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});
