const express = require('express');
const router = express.Router();
const importOrderController = require('../controllers/import-order.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Tạo đơn nhập sách mới - chỉ manager
router.post('/import-order', protect, authorize(['manager']), importOrderController.createImportOrder);

// Xác nhận đơn nhập - chỉ manager
router.put('/import-order/confirm/:orderId', protect, authorize(['manager']), importOrderController.confirmImportOrder);

// Cập nhật số lượng sách sau khi nhận hàng - chỉ manager
router.put('/import-order/receive/:orderId', protect, authorize(['manager']), importOrderController.updateBookQuantity);

// Xuất PDF đơn nhập - tất cả vai trò đã đăng nhập đều xem được
router.get('/import-order/:orderId/pdf', protect, authorize(['manager', 'accountant', 'staff']), importOrderController.exportImportOrderPDF);

// Xem danh sách đơn nhập - tất cả vai trò đã đăng nhập đều xem được
router.get('/get-import-orders', protect, authorize(['manager', 'accountant', 'staff']), importOrderController.getOrders);

module.exports = router;