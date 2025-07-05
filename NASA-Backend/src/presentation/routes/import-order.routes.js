const express = require('express');
const router = express.Router();
const importOrderController = require('../controllers/import-order.controller');


// Tạo đơn nhập sách mới
router.post('/import-order', importOrderController.createImportOrder);

// Xác nhận đơn nhập
router.put('/import-order/confirm/:orderId', importOrderController.confirmImportOrder);

// Cập nhật số lượng sách sau khi nhận hàng
router.put('/import-order/receive/:orderId', importOrderController.updateBookQuantity);

// Xuất PDF đơn nhập
router.get('/import-order/:orderId/pdf', importOrderController.exportImportOrderPDF);

router.get('/get-import-orders', importOrderController.getOrders);

module.exports = router; 