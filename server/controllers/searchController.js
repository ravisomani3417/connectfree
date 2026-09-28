const User = require('../models/User');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [], posts: [] });

  const term = q.replace(/^#/, '');
  const rx = new RegExp(escapeRegex(term), 'i');

  const [users, posts] = await Promise.all([
    User.find({ $or: [{ name: rx }, { username: rx }, { headline: rx }] })
      .limit(15)
      .select('name username avatar headline'),
    Post.find({ $or: [{ text: rx }, { hashtags: term.toLowerCase() }] })
      .sort('-createdAt')
      .limit(20)
      .populate('author', 'name username avatar headline'),
  ]);
  res.json({ users, posts });
});
