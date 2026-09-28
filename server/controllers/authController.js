const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Name, username, email and password are required' });
  }
  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
  if (exists) return res.status(409).json({ message: 'Email or username already in use' });

  const user = await User.create({ name, username, email, password });
  res.status(201).json({ token: sign(user._id), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: sign(user._id), user });
});

exports.me = asyncHandler(async (req, res) => res.json(req.user));
