const User = require('../models/User');
const Post = require('../models/Post');
const Connection = require('../models/Connection');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');

exports.getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const me = req.user._id;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isSelf = String(me) === id;
  if (!isSelf) await User.updateOne({ _id: id }, { $inc: { profileViews: 1 } });

  let connectionStatus = 'none';
  let connectionId = null;
  if (isSelf) connectionStatus = 'self';
  else if (req.user.connections.some((c) => String(c) === id)) connectionStatus = 'connected';
  else {
    const c = await Connection.findOne({
      status: 'pending',
      $or: [{ requester: me, recipient: id }, { requester: id, recipient: me }],
    });
    if (c) {
      connectionStatus = String(c.requester) === String(me) ? 'sent' : 'received';
      connectionId = c._id;
    }
  }

  res.json({
    ...user.toJSON(),
    postsCount: await Post.countDocuments({ author: id }),
    isFollowing: req.user.following.some((f) => String(f) === id),
    connectionStatus,
    connectionId,
  });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, headline, bio, skills } = req.body;
  if (name) req.user.name = name;
  if (headline !== undefined) req.user.headline = headline;
  if (bio !== undefined) req.user.bio = bio;
  if (skills !== undefined) {
    req.user.skills = String(skills).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20);
  }
  if (req.file) req.user.avatar = `/uploads/${req.file.filename}`;
  await req.user.save();
  res.json(req.user);
});

exports.toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === String(req.user._id)) return res.status(400).json({ message: "You can't follow yourself" });
  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: 'User not found' });

  const already = req.user.following.some((f) => String(f) === targetId);
  if (already) {
    await User.updateOne({ _id: req.user._id }, { $pull: { following: targetId } });
    await User.updateOne({ _id: targetId }, { $pull: { followers: req.user._id } });
  } else {
    await User.updateOne({ _id: req.user._id }, { $addToSet: { following: targetId } });
    await User.updateOne({ _id: targetId }, { $addToSet: { followers: req.user._id } });
    await notify(req, { user: targetId, actor: req.user._id, type: 'follow' });
  }
  const fresh = await User.findById(targetId).select('followers');
  res.json({ isFollowing: !already, followersCount: fresh.followers.length });
});

// "People you may know": not followed yet, ranked by mutual connections
exports.suggestions = asyncHandler(async (req, res) => {
  const exclude = [req.user._id, ...req.user.following];
  const pool = await User.find({ _id: { $nin: exclude } }).limit(40).select('name username avatar headline connections');
  const mine = new Set(req.user.connections.map(String));
  const ranked = pool
    .map((u) => ({
      _id: u._id, name: u.name, username: u.username, avatar: u.avatar, headline: u.headline,
      mutual: u.connections.filter((c) => mine.has(String(c))).length,
      connected: mine.has(String(u._id)),
    }))
    .sort((a, b) => b.mutual - a.mutual)
    .slice(0, 8);
  res.json(ranked);
});
