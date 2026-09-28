const jwt = require('jsonwebtoken');

// Real-time layer: presence, typing indicators. Chat messages and notifications are
// saved through the REST API and pushed to the recipient's private room "user:<id>".
module.exports = (io) => {
  const online = new Map(); // userId -> number of open tabs

  io.use((socket, next) => {
    try {
      const { id } = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      socket.userId = id;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.userId;
    socket.join(`user:${uid}`);
    online.set(uid, (online.get(uid) || 0) + 1);
    io.emit('presence', [...online.keys()]);

    socket.on('typing', ({ to, isTyping }) => {
      io.to(`user:${to}`).emit('typing', { from: uid, isTyping: !!isTyping });
    });

    socket.on('disconnect', () => {
      const left = (online.get(uid) || 1) - 1;
      if (left <= 0) online.delete(uid);
      else online.set(uid, left);
      io.emit('presence', [...online.keys()]);
    });
  });
};
