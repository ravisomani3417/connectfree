const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.conversations = asyncHandler(async (req, res) => {
  const me = String(req.user._id);
  const msgs = await Message.find({ $or: [{ sender: me }, { receiver: me }] }).sort('-createdAt').limit(500);

  const map = new Map();
  for (const m of msgs) {
    const other = String(m.sender) === me ? String(m.receiver) : String(m.sender);
    if (!map.has(other)) map.set(other, { lastMessage: m, unread: 0 });
    if (String(m.receiver) === me && !m.readAt) map.get(other).unread += 1;
  }
  const users = await User.find({ _id: { $in: [...map.keys()] } }).select('name username avatar headline');
  const result = users
    .map((u) => ({ user: u, ...map.get(String(u._id)) }))
    .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
  res.json(result);
});

const markRead = async (req, otherId) => {
  const result = await Message.updateMany(
    { sender: otherId, receiver: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  if (result.modifiedCount > 0) {
    const io = req.app.get('io');
    if (io) io.to(`user:${otherId}`).emit('messagesRead', { by: String(req.user._id) });
  }
};

exports.getMessages = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const other = req.params.userId;
  const msgs = await Message.find({
    $or: [{ sender: me, receiver: other }, { sender: other, receiver: me }],
  }).sort('createdAt').limit(200);
  await markRead(req, other);
  res.json(msgs);
});

exports.send = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Message cannot be empty' });
  const receiver = await User.findById(req.params.userId);
  if (!receiver) return res.status(404).json({ message: 'User not found' });

  const message = await Message.create({ sender: req.user._id, receiver: receiver._id, text });
  const io = req.app.get('io');
  if (io) io.to(`user:${receiver._id}`).emit('message', message);
  res.status(201).json(message);
});

exports.read = asyncHandler(async (req, res) => {
  await markRead(req, req.params.userId);
  res.json({ ok: true });
});
