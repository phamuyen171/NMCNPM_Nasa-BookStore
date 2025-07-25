const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Lấy danh sách sách phổ biến
router.get('/popular-books', invoiceController.getPopularBooks);

router.get('/count-invoices', invoiceController.countInvoices);

// Tạo hóa đơn mới
// router.post('/', invoiceController.createInvoice);
router.post('/', invoiceController.createInvoice);
// router.post('/wholesale', invoiceController.createInvoiceWholesale);

// Tạo mã hóa đơn: R0001 - cho KH mua lẻ, và W0001: cho KH mua sỉ
router.post('/create-invoice-id/:type', invoiceController.createInvoiceId);

// Lấy danh sách hóa đơn
router.get('/', invoiceController.getInvoices);

// Lấy chi tiết hóa đơn
router.get('/:id', invoiceController.getInvoiceById);

// Xóa hóa đơn
router.delete('/:id', protect, authorize(['manager', 'accountant']), invoiceController.deleteInvoice);

// Đánh dấu hóa đơn là đã thanh toán
router.patch('/:id/mark-as-paid', (req, res, next) => invoiceController.markInvoiceAsPaid(req, res, next));

// Đánh dấu các hóa đơn quá hạn thành nợ xấu
router.patch('/mark-overdue-as-bad-debt', (req, res, next) => invoiceController.markOverdueInvoicesAsBadDebt(req, res, next));

router.post('/send-email', protect, authorize(['manager', 'accountant']), invoiceController.sendEmail);

module.exports = router;