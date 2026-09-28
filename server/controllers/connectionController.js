const Connection = require('../models/Connection');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');

exports.sendRequest = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const me = req.user._id;
  if (targetId === String(me)) return res.status(400).json({ message: "You can't connect with yourself" });
  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (req.user.connections.some((c) => String(c) === targetId)) {
    return res.status(400).json({ message: 'Already connected' });
  }

  const existing = await Connection.findOne({
    $or: [{ requester: me, recipient: targetId }, { requester: targetId, recipient: me }],
  });
  if (existing && existing.status === 'pending') return res.status(400).json({ message: 'Request already pending' });
  if (existing) await existing.deleteOne(); // previously rejected -> allow a fresh request

  const connection = await Connection.create({ requester: me, recipient: targetId });
  await notify(req, { user: targetId, actor: me, type: 'connection_request', ref: connection._id });
  res.status(201).json(connection);
});

exports.accept = asyncHandler(async (req, res) => {
  const c = await Connection.findById(req.params.id);
  if (!c || c.status !== 'pending') return res.status(404).json({ message: 'Request not found' });
  if (String(c.recipient) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });

  c.status = 'accepted';
  await c.save();
  await User.updateOne({ _id: c.requester }, { $addToSet: { connections: c.recipient } });
  await User.updateOne({ _id: c.recipient }, { $addToSet: { connections: c.requester } });
  await notify(req, { user: c.requester, actor: req.user._id, type: 'connection_accepted', ref: c._id });
  res.json(c);
});

exports.reject = asyncHandler(async (req, res) => {
  const c = await Connection.findById(req.params.id);
  if (!c || c.status !== 'pending') return res.status(404).json({ message: 'Request not found' });
  if (String(c.recipient) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  c.status = 'rejected';
  await c.save();
  res.json(c);
});

exports.pending = asyncHandler(async (req, res) => {
  const requests = await Connection.find({ recipient: req.user._id, status: 'pending' })
    .sort('-createdAt')
    .populate('requester', 'name username avatar headline');
  res.json(requests);
});

exports.list = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('connections', 'name username avatar headline');
  res.json(user.connections);
});

exports.remove = asyncHandler(async (req, res) => {
  const other = req.params.id;
  await User.updateOne({ _id: req.user._id }, { $pull: { connections: other } });
  await User.updateOne({ _id: other }, { $pull: { connections: req.user._id } });
  await Connection.deleteMany({
    $or: [{ requester: req.user._id, recipient: other }, { requester: other, recipient: req.user._id }],
  });
  res.json({ message: 'Connection removed' });
});
