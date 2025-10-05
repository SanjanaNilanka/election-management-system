const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.body.userId || 'unknown';
    const field = file.fieldname; // e.g. nic_front
    cb(null, `${field}_${userId}${ext}`);
  }
});

const upload = multer({ storage });
module.exports = upload;
