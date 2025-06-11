const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

// Lấy danh sách sách phổ biến
router.get('/popular-books', invoiceController.getPopularBooks);

// Tạo hóa đơn mới
router.post('/', invoiceController.createInvoice);

// Lấy danh sách hóa đơn
router.get('/', invoiceController.getInvoices);

// Lấy chi tiết hóa đơn
router.get('/:id', invoiceController.getInvoiceById);

// Xóa hóa đơn
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;