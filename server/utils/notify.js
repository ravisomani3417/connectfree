const Notification = require('../models/Notification');

// Saves a notification and pushes it live over Socket.IO
module.exports = async (req, { user, actor, type, ref }) => {
  if (String(user) === String(actor)) return;
  const n = await Notification.create({ user, actor, type, ref });
  await n.populate('actor', 'name username avatar');
  const io = req.app.get('io');
  if (io) io.to(`user:${user}`).emit('notification', n);
};
