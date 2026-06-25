const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fileType = require('file-type');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `${hash}${path.extname(file.originalname)}`);
  }
});

const fileFilter = async (req, file, cb) => {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  
  // Validasi MIME type lebih ketat
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('File type tidak diizinkan'));
  }
  
  if (file.size > MAX_SIZE) {
    return cb(new Error('File terlalu besar (max 5MB)'));
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;