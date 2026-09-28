# ConnectFree — Interview Preparation

## 1. 30-second pitch
"ConnectFree is a full-stack social platform I built with the MERN stack that combines Instagram-style features, like stories, reels and follows, with LinkedIn-style features, like connection requests, professional profiles and tech content feeds. It uses JWT authentication, REST APIs on Express and MongoDB, and Socket.IO for real-time chat and notifications."

## 2. Resume bullets (updated)

**ConnectFree — Social + Professional Networking Platform | MongoDB, Express.js, React.js, Node.js, Socket.IO | 2026**
- Built a full-stack platform combining Instagram-style stories, reels and follows with LinkedIn-style connections, profiles and tech/social content feeds.
- Implemented posts (CRUD), likes, comments, category-filtered feeds (Tech, Career, Social) and 24-hour stories using MongoDB TTL indexes.
- Designed a connection-request workflow (pending/accepted/rejected) and follow system with people recommendations based on mutual connections.
- Added real-time chat, typing indicators, online presence and live notifications with Socket.IO.
- Built RESTful APIs with Express and Mongoose, with pagination, validation and centralized error handling; tested with Postman.
- Secured the app with JWT authentication, bcryptjs hashing and protected routes; built a responsive React UI with Axios and optimistic updates.

Only list features you have actually built. Be ready to demo or explain every line.

## 3. Project questions and model answers

**Why this project?** I wanted to work on problems real products face: relationships between users, feeds, real-time updates and media handling.

**Walk me through the architecture.** React client calls an Express REST API through Axios. Express talks to MongoDB via Mongoose. Socket.IO runs on the same server for chat and notifications. JWT middleware protects routes.

**How does authentication work?** On login the server verifies the password with bcryptjs and signs a JWT. The client sends it in the `Authorization: Bearer` header. Middleware verifies the token and attaches the user to `req`. Follow-up: where do you store the token? (localStorage is simple but exposed to XSS; httpOnly cookies are safer.)

**How does follow differ from connect?** Follow is one-way and instant (Instagram). Connect is two-way and needs acceptance (LinkedIn). Follow is arrays on User; Connection is its own collection with a status field.

**How do stories expire after 24 hours?** Each story has `expiresAt`; a MongoDB TTL index on that field removes the document automatically. TTL cleanup runs about every 60 seconds, so I also filter by `expiresAt > now` in queries.

**How did you build the feed?** Query posts from followed users and connections, sorted by `createdAt`, filtered by category, paginated with `limit`/`skip` (or cursor-based for scale). An index on `(author, createdAt)` speeds it up.

**Skip vs cursor pagination?** Skip gets slow on large offsets and can duplicate items when new posts arrive. Cursor pagination (`createdAt < lastSeen`) is stable and faster.

**How does real-time chat work?** Clients connect with Socket.IO, authenticate with the JWT, and join a room by user ID. On `sendMessage` the server saves to MongoDB and emits to the receiver's room. Typing, presence and read receipts are separate events.

**How do you handle media uploads?** Multer saves the file to disk and only the path (`/uploads/...`) is stored in MongoDB. Never store large binaries in the database. In production I'd move uploads to S3 or Cloudinary behind a CDN, since local disk doesn't survive redeploys or scale across servers.

**What would break at scale, and how would you fix it?**
- Multiple server instances: add the Socket.IO Redis adapter
- Slow feeds: cache in Redis, use fan-out on write
- Media: CDN and video transcoding
- DB: indexes, read replicas, sharding

**Security measures?** bcryptjs hashing, JWT expiry, input validation, rate limiting, helmet, CORS whitelist, ownership checks (only the author can edit/delete a post).

**A hard bug you solved?** Prepare one real story: problem, how you debugged it, fix, lesson. (Examples: duplicate socket events, stale state after like, CORS issue.)

**What would you improve next?** Tests (Jest + Supertest), TypeScript, Docker + CI/CD, group chats, better recommendations.

## 4. Technical quick-fire

- **MongoDB vs SQL?** Flexible documents suit posts/profiles; relations are handled with references and `populate`.
- **Embedding vs referencing?** Embed small bounded data; reference unbounded data (comments, followers at scale).
- **What is `populate`?** Mongoose replaces referenced IDs with the actual documents.
- **useEffect vs useState?** State holds data; effect runs side effects (API calls, sockets) after render.
- **Optimistic update?** Update the UI immediately, then roll back if the API fails.
- **Debouncing?** Delay a call (e.g. search) until the user stops typing.
- **JWT vs sessions?** JWT is stateless and scalable but hard to revoke; sessions are stateful and easy to revoke.
- **Middleware in Express?** Functions that run before route handlers (auth, logging, errors).
- **HTTP vs WebSocket?** HTTP is request/response; WebSocket is a persistent two-way connection.
- **Why Context API / Redux?** Share state (user, notifications) without prop drilling.

## 5. Demo checklist (3 minutes)
1. Register / login
2. Follow someone, send a connection request
3. Post a tech update, filter the feed by Tech
4. Upload a story and view a reel
5. Open chat in two windows to show real-time messages and typing
6. Show the notification appearing live

## 6. Code map (know where things live)
- Auth: `server/controllers/authController.js`, `server/middleware/auth.js`
- Feed and pagination: `postController.getFeed`
- Stories TTL: `server/models/Story.js` (`expireAfterSeconds`)
- Mutual-connection suggestions: `userController.suggestions`
- Real time: `server/sockets/index.js` plus `utils/notify.js`
- Optimistic like: `client/src/components/PostCard.jsx`
- Reel autoplay (IntersectionObserver): `client/src/pages/Reels.jsx`

## 7. Be honest
If asked about something you haven't built, say so: "I haven't implemented that yet, but here's how I would approach it." Interviewers value that more than bluffing.

## 8. Questions to ask them
- What does the engineering team's code review process look like?
- What would success look like in the first 3 months?
