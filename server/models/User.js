const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ref = { type: mongoose.Schema.Types.ObjectId, ref: 'User' };

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    username: {
      type: String, required: [true, 'Username is required'], unique: true, lowercase: true, trim: true,
      match: [/^[a-z0-9_.]{3,20}$/, 'Username must be 3-20 chars (letters, numbers, _ or .)'],
    },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'], select: false },
    headline: { type: String, default: '', maxlength: 120 },
    bio: { type: String, default: '', maxlength: 500 },
    skills: [String],
    avatar: { type: String, default: '' },
    followers: [ref],
    following: [ref],
    connections: [ref],
    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
