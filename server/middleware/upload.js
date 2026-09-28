const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
});

const fileFilter = (req, file, cb) => {
  if (/^(image|video)\//.test(file.mimetype)) return cb(null, true);
  const err = new Error('Only image or video files are allowed');
  err.status = 400;
  cb(err);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
