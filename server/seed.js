// Demo data for interviews:  npm run seed   (password for every user: password123)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Connection = require('./models/Connection');

const people = [
  ['Aarav Mehta', 'aarav', 'Full-Stack Developer | MERN'],
  ['Priya Nair', 'priya', 'Product Designer at Figma fan club'],
  ['Rohan Gupta', 'rohan', 'DevOps Engineer | Docker & AWS'],
  ['Sneha Iyer', 'sneha', 'Data Scientist | Python'],
  ['Kabir Shah', 'kabir', 'Photographer & traveller'],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Post.deleteMany({}), Connection.deleteMany({})]);

  const users = [];
  for (const [name, username, headline] of people) {
    users.push(await User.create({ name, username, headline, email: `${username}@demo.com`, password: 'password123', bio: `Hi, I'm ${name}.`, skills: ['JavaScript', 'React', 'Node.js'] }));
  }
  // follows
  for (const a of users) for (const b of users) {
    if (a !== b && Math.random() > 0.4) {
      await User.updateOne({ _id: a._id }, { $addToSet: { following: b._id } });
      await User.updateOne({ _id: b._id }, { $addToSet: { followers: a._id } });
    }
  }
  // connections between the first three
  for (const [a, b] of [[0, 1], [1, 2], [0, 2]]) {
    await Connection.create({ requester: users[a]._id, recipient: users[b]._id, status: 'accepted' });
    await User.updateOne({ _id: users[a]._id }, { $addToSet: { connections: users[b]._id } });
    await User.updateOne({ _id: users[b]._id }, { $addToSet: { connections: users[a]._id } });
  }
  const samples = [
    ['tech', 'Just shipped JWT refresh tokens for my #mern project. Worth the effort! #nodejs'],
    ['tech', 'TIL MongoDB TTL indexes can auto-delete documents. Perfect for stories #mongodb'],
    ['career', 'Tips for your first tech interview: explain your projects out loud. #career #interview'],
    ['social', 'Weekend hike done. Nothing beats fresh air. #life'],
    ['lifestyle', 'Morning routine: coffee, code, walk. #productivity'],
  ];
  for (let i = 0; i < 12; i++) {
    const [category, text] = samples[i % samples.length];
    await Post.create({ author: users[i % users.length]._id, category, text, hashtags: (text.match(/#\w+/g) || []).map((h) => h.slice(1).toLowerCase()) });
  }
  console.log('Seeded 5 users (aarav, priya, rohan, sneha, kabir @demo.com / password123)');
  process.exit(0);
})();
