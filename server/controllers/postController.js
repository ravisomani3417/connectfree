const Post = require('../models/Post');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const extractHashtags = require('../utils/hashtags');
const { CATEGORIES } = require('../config/constants');

const AUTHOR_FIELDS = 'name username avatar headline';
const PAGE_SIZE = 10;

exports.createPost = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text && !req.file) return res.status(400).json({ message: 'Write something or attach media' });
  const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'social';

  const post = await Post.create({
    author: req.user._id,
    text,
    category,
    hashtags: extractHashtags(text),
    media: req.file ? `/uploads/${req.file.filename}` : '',
    mediaType: req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'image') : '',
  });
  await post.populate('author', AUTHOR_FIELDS);
  res.status(201).json(post);
});

// scope=following (default): me + people I follow/connect with. scope=explore: everyone.
exports.getFeed = asyncHandler(async (req, res) => {
  const { category, scope = 'following' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const query = {};
  if (scope !== 'explore') query.author = { $in: [req.user._id, ...req.user.following, ...req.user.connections] };
  if (category && category !== 'all') query.category = category;

  const posts = await Post.find(query)
    .sort('-createdAt')
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE + 1)
    .populate('author', AUTHOR_FIELDS);
  res.json({ posts: posts.slice(0, PAGE_SIZE), hasMore: posts.length > PAGE_SIZE });
});

exports.getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id }).sort('-createdAt').limit(50).populate('author', AUTHOR_FIELDS);
  res.json(posts);
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'Not your post' });

  if (req.body.text !== undefined) {
    post.text = req.body.text.trim();
    post.hashtags = extractHashtags(post.text);
  }
  if (CATEGORIES.includes(req.body.category)) post.category = req.body.category;
  await post.save();
  await post.populate('author', AUTHOR_FIELDS);
  res.json(post);
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'Not your post' });
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
});

exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const liked = post.likes.some((l) => String(l) === String(req.user._id));
  await Post.updateOne(
    { _id: post._id },
    liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
  );
  if (!liked) await notify(req, { user: post.author, actor: req.user._id, type: 'like', ref: post._id });
  res.json({ liked: !liked });
});

exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id }).sort('createdAt').populate('user', 'name username avatar');
  res.json(comments);
});

exports.addComment = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Comment cannot be empty' });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = await Comment.create({ post: post._id, user: req.user._id, text });
  await Post.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } });
  await notify(req, { user: post.author, actor: req.user._id, type: 'comment', ref: post._id });
  await comment.populate('user', 'name username avatar');
  res.status(201).json(comment);
});
