const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');

router.get('/count-books', bookController.getBookCount); // Lấy tổng số sách
router.get('/get-newest-books', bookController.getNewestBooks); // Lấy sách mới nhất

// Các route chỉ cần đăng nhập (protect)
router.get('/', bookController.getAllBooks); // Lấy danh sách sách
router.get('/search', bookController.searchBooks); // Tìm kiếm sách
router.get('/lowstock', bookController.getLowStockBooks); // Lấy sách tồn kho thấp
router.get('/popular-books', bookController.getPopularBooks); // Lấy sách phổ biến
router.get('/available/:id', bookController.isBookAvailable); // Kiểm tra sách có sẵn
router.get('/:id', bookController.getBookById); // Lấy chi tiết sách

// Các route cần quyền quản lý (protect và authorize)
router.post('/', bookController.createBook); // Thêm sách mới
router.put('/:id', bookController.updateBook); // Cập nhật sách
router.delete('/:id', bookController.deleteBook); // Xóa mềm sách
router.post('/batch-delete', bookController.batchSoftDeleteBooks); // Xóa mềm hàng loạt


router.put('/discontinue/:id', bookController.markBookAsDiscontinued); // Ngừng kinh doanh (cần quyền quản lý)


// Route cập nhật thông tin sách
router.put('/:id', bookController.updateBook);

// Route xóa sách
router.delete('/:id', bookController.deleteBook);

// Route để lấy thông tin chi tiết một cuốn sách theo ID
router.get('/:id', bookController.getBookById);

// Route for batch soft deleting books
router.post('/batch-delete', bookController.batchSoftDeleteBooks);

module.exports = router;