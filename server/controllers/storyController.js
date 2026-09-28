const Story = require('../models/Story');
const asyncHandler = require('../utils/asyncHandler');

exports.createStory = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Story media is required' });
  const story = await Story.create({
    author: req.user._id,
    media: `/uploads/${req.file.filename}`,
    mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
    caption: req.body.caption || '',
  });
  res.status(201).json(story);
});

// Active (non-expired) stories from me + people I follow, grouped by author, mine first
exports.getStories = asyncHandler(async (req, res) => {
  const me = String(req.user._id);
  const stories = await Story.find({
    author: { $in: [req.user._id, ...req.user.following] },
    expiresAt: { $gt: new Date() },
  })
    .sort('createdAt')
    .populate('author', 'name username avatar');

  const groups = new Map();
  for (const s of stories) {
    const key = String(s.author._id);
    if (!groups.has(key)) groups.set(key, { author: s.author, stories: [] });
    groups.get(key).stories.push(s);
  }
  const result = [...groups.values()].sort(
    (a, b) => (String(b.author._id) === me) - (String(a.author._id) === me)
  );
  res.json(result);
});

exports.viewStory = asyncHandler(async (req, res) => {
  await Story.updateOne({ _id: req.params.id }, { $addToSet: { viewers: req.user._id } });
  res.json({ ok: true });
});

exports.deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json({ message: 'Story not found' });
  if (String(story.author) !== String(req.user._id)) return res.status(403).json({ message: 'Not your story' });
  await story.deleteOne();
  res.json({ message: 'Story deleted' });
});
