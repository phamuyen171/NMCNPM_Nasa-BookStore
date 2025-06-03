const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware'); // Import middleware

// Các route chỉ cần đăng nhập (protect)
router.get('/', protect, bookController.getAllBooks); // Lấy danh sách sách
router.get('/search', protect, bookController.searchBooks); // Tìm kiếm sách
router.get('/lowstock', protect, bookController.getLowStockBooks); // Lấy sách tồn kho thấp
router.get('/available/:id', protect, bookController.isBookAvailable); // Kiểm tra sách có sẵn
router.get('/:id', protect, bookController.getBookById); // Lấy chi tiết sách

// Các route cần quyền quản lý (protect và authorize)
router.post('/', protect, authorize('manager', 'admin'), bookController.createBook); // Thêm sách mới
router.put('/:id', protect, authorize('manager', 'admin'), bookController.updateBook); // Cập nhật sách
router.delete('/:id', protect, authorize('manager', 'admin'), bookController.deleteBook); // Xóa mềm sách
router.post('/batch-delete', protect, authorize('manager', 'admin'), bookController.batchSoftDeleteBooks); // Xóa mềm hàng loạt

// Routes liên quan đến nhập kho - Thường chỉ Quản lý (manager, admin) mới có quyền tạo/xác nhận phiếu
router.post('/restock', protect, authorize('manager', 'admin'), bookController.processRestockOrder); // Xử lý tạo phiếu nhập
router.put('/restock/confirm/:orderId', protect, authorize('manager', 'admin'), bookController.confirmRestockOrder); // Xác nhận phiếu nhập
router.put('/import/:id', protect, authorize('manager', 'admin'), bookController.importBookQuantity); // Nhập đơn lẻ (có thể phân quyền khác tùy nghiệp vụ)
router.put('/discontinue/:id', protect, authorize('manager', 'admin'), bookController.markBookAsDiscontinued); // Ngừng kinh doanh (cần quyền quản lý)
router.get('/restock/:orderId/pdf', protect, authorize('manager', 'admin'), bookController.generateRestockPdf); // Tạo PDF phiếu nhập

// Route cập nhật thông tin sách
router.put('/:id', protect, authorize('manager', 'admin'), bookController.updateBook);

// Route xóa sách
router.delete('/:id', protect, authorize('manager', 'admin'), bookController.deleteBook);

// Route để lấy thông tin chi tiết một cuốn sách theo ID
router.get('/:id', protect, bookController.getBookById);

// Route for batch soft deleting books
router.post('/batch-delete', protect, authorize('manager', 'admin'), bookController.batchSoftDeleteBooks);

module.exports = router;