require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const registerSockets = require('./sockets');
const { notFound, errorHandler } = require('./middleware/error');

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('Missing JWT_SECRET or MONGO_URI. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, { cors: { origin: CLIENT_URL, credentials: true } });
app.set('io', io);
registerSockets(io);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/reels', require('./routes/reelRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
