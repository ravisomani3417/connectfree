# ConnectFree

**A LinkedIn + Instagram style social platform.** Follow creators, watch stories and reels, and build a professional network — all in one app. Built with the MERN stack and Socket.IO.

> Tech and social content in one feed: share a dev update, post a reel, connect with a recruiter, chat in real time.

## Features

**Social (Instagram-style)**
- Follow / unfollow users
- Stories: image or video, auto-expire after 24 hours (MongoDB TTL index), viewer tracking
- Reels: vertical video feed with autoplay, likes and view counts
- Posts with photo/video, likes, comments, hashtags; edit and delete your own posts

**Professional (LinkedIn-style)**
- Connection requests: send, accept, ignore, remove
- Profiles with headline, bio, skills, avatar and profile-view analytics
- Content categories: Tech, Career, Social, Lifestyle (filter posts and reels)
- "People you may know", ranked by mutual connections

**Real time (Socket.IO)**
- One-to-one chat with typing indicator, online presence and read receipts
- Live notifications for likes, comments, follows and connection requests

**Platform**
- JWT authentication with protected routes
- Global search (people, posts, #hashtags)
- Paginated feeds, optimistic like updates, centralized error handling
- Responsive dark UI

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Context API |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Real time | Socket.IO |
| Auth & security | JWT, bcryptjs, helmet, CORS, rate limiting |
| Uploads | Multer (local disk) |

## Architecture

```
React (Vite)  ──Axios (REST)──▶  Express API  ──Mongoose──▶  MongoDB
      └─────── Socket.IO (WebSocket) ───────┘
```

```
connectfree/
├── client/                React app
│   └── src/  api.js · context/ · components/ · pages/
├── server/
│   ├── config/  middleware/  models/  controllers/  routes/  sockets/  utils/
│   ├── seed.js            demo data
│   └── server.js
└── docs/INTERVIEW_PREP.md
```

## Getting Started

**Prerequisites:** Node.js 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
git clone https://github.com/<your-username>/connectfree.git
cd connectfree

# 1. Install everything
npm run install:all

# 2. Configure environment
cp server/.env.example server/.env      # then edit MONGO_URI and JWT_SECRET
cp client/.env.example client/.env

# 3. (Optional) load demo users and posts
npm run seed        # login: aarav@demo.com / password123

# 4. Run client and server together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000/api/health

To try real-time features, log in as two different users in two browsers (or one normal and one incognito window).

### Environment variables

`server/.env`
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/connectfree
JWT_SECRET=a_long_random_string
CLIENT_URL=http://localhost:5173
```

`client/.env`
```
VITE_API_URL=http://localhost:5000
```

## API Overview

All routes except `/auth/register` and `/auth/login` need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Create account / sign in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users/:id` | Profile (with follow and connection status) |
| PUT | `/api/users/me` | Update profile and avatar |
| PUT | `/api/users/:id/follow` | Follow / unfollow |
| GET | `/api/users/suggestions` | People you may know |
| POST | `/api/connections/request/:id` | Send connection request |
| PUT | `/api/connections/:id/accept` · `/reject` | Respond to a request |
| GET | `/api/connections` · `/pending` | My connections / incoming requests |
| GET | `/api/posts/feed?scope=&category=&page=` | Paginated feed |
| POST | `/api/posts` | Create post (multipart, optional media) |
| PUT / DELETE | `/api/posts/:id` | Edit / delete own post |
| PUT | `/api/posts/:id/like` | Like / unlike |
| GET / POST | `/api/posts/:id/comments` | List / add comments |
| GET / POST | `/api/reels` | Reels feed / upload |
| PUT | `/api/reels/:id/like` · `/view` | Like / count a view |
| GET / POST | `/api/stories` | Active stories / upload |
| GET | `/api/messages/conversations` | Conversation list |
| GET / POST | `/api/messages/:userId` | Thread / send message |
| GET | `/api/notifications` | Notifications |
| GET | `/api/search?q=` | Search people and posts |

## Socket events

| Event | Direction | Purpose |
|---|---|---|
| `presence` | server → all | List of online user ids |
| `typing` | both | Typing indicator |
| `message` | server → user | New chat message |
| `messagesRead` | server → user | Read receipt |
| `notification` | server → user | Live notification |

## Data Model

- **User**: profile fields, `followers[]`, `following[]`, `connections[]`, `profileViews`
- **Connection**: `requester`, `recipient`, `status` (pending / accepted / rejected), unique per pair
- **Post / Reel**: `author`, media, `category`, `likes[]`, hashtags or views
- **Story**: `author`, media, `viewers[]`, `expiresAt` with a TTL index
- **Comment**, **Message** (`readAt` for receipts), **Notification**

## Roadmap
- Cloud media storage (Cloudinary/S3) and video compression
- Group chats and communities
- Job posts and endorsements
- Automated tests (Jest + Supertest) and Docker + CI

## Author
**Somani Ravi**

## License
MIT
