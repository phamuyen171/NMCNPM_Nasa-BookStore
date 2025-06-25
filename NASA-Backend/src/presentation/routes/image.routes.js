const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
const Grid = require('gridfs-stream');
const { GridFSBucket } = require('mongodb');


let gfs;
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Route để lấy ảnh
router.get('/:id', async (req, res) => {

  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID không hợp lệ');
    }

    const _id = new mongoose.Types.ObjectId(id);

    // Bucket đúng tên
    const db = mongoose.connection.useDb('test');
    const bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });

    // Lấy file metadata
    const file = await mongoose.connection.db
      .collection('uploads.files')
      .findOne({ _id });

    if (!file) return res.status(404).send('Không tìm thấy ảnh');

    res.set('Content-Type', file.contentType || 'image/jpeg');

    // Stream file ra client
    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.on('error', (err) => {
      console.error('Lỗi khi stream:', err);
      res.status(500).send('Lỗi khi stream ảnh');
    });
    downloadStream.pipe(res);

  } catch (err) {
    console.error('Lỗi khi tải ảnh:', err);
    res.status(500).send('Lỗi server');
  }
});

module.exports = router;
