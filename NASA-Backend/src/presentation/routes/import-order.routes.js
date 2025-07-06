const express = require('express');
const router = express.Router();
const importOrderController = require('../controllers/import-order.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Tạo đơn nhập sách mới
router.post('/import-order', protect, authorize(['manager']), importOrderController.createImportOrder);

// Xác nhận đơn nhập
router.put('/import-order/confirm/:orderId', protect, authorize(['manager']), importOrderController.confirmImportOrder);

// Cập nhật số lượng sách sau khi nhận hàng
router.put('/import-order/receive/:orderId', protect, authorize(['manager']), importOrderController.updateBookQuantity);

// Xuất PDF đơn nhập
router.get('/import-order/:orderId/pdf', protect, authorize(['manager', 'accountant']), importOrderController.exportImportOrderPDF);

router.get('/get-import-orders', importOrderController.getOrders);

module.exports = router; 