const mongoose = require('mongoose')
const express = require('express');
const router = express.Router();
const Grid = require('gridfs-stream');

let gfs;
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Route để lấy ảnh
router.get('/:id', async (req, res) => {
  try {
    const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    const readstream = gfs.createReadStream(file.filename);
    res.set('Content-Type', file.contentType);
    readstream.pipe(res);
  } catch (err) {
    res.status(404).send('Không tìm thấy ảnh');
  }
});

module.exports = router;
