const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => ({
    filename: 'image_' + Date.now(),
    bucketName: 'uploads'
  })
});

const upload = multer({ storage });
module.exports = upload;
