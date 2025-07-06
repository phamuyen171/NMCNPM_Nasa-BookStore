// const express = require('express');
// const router = express.Router();
// const invoiceController = require('../controllers/invoice.controller');

// // Lấy danh sách sách phổ biến
// router.get('/popular-books', invoiceController.getPopularBooks);

// router.get('/count-invoices', invoiceController.countInvoices);

// // Tạo hóa đơn mới
// // router.post('/', invoiceController.createInvoice);
// router.post('/', invoiceController.createInvoice);
// // router.post('/wholesale', invoiceController.createInvoiceWholesale);

// // Tạo mã hóa đơn: R0001 - cho KH mua lẻ, và W0001: cho KH mua sỉ
// router.post('/create-invoice-id/:type', invoiceController.createInvoiceId);

// // Lấy danh sách hóa đơn
// router.get('/', invoiceController.getInvoices);

// // Lấy chi tiết hóa đơn
// router.get('/:id', invoiceController.getInvoiceById);

// // Xóa hóa đơn
// router.delete('/:id', invoiceController.deleteInvoice);

// // Đánh dấu hóa đơn là đã thanh toán
// router.patch('/:id/mark-as-paid', (req, res, next) => invoiceController.markInvoiceAsPaid(req, res, next));

// // Đánh dấu các hóa đơn quá hạn thành nợ xấu
// router.patch('/mark-overdue-as-bad-debt', (req, res, next) => invoiceController.markOverdueInvoicesAsBadDebt(req, res, next));

// module.exports = router;


const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Lấy danh sách sách phổ biến - tất cả vai trò đã đăng nhập
router.get('/popular-books', protect, authorize(['manager', 'accountant', 'staff']), invoiceController.getPopularBooks);

// Lấy tổng số hóa đơn - tất cả vai trò đã đăng nhập
router.get('/count-invoices', protect, authorize(['manager', 'accountant', 'staff']), invoiceController.countInvoices);

// Tạo hóa đơn mới - chỉ manager và staff
router.post('/', protect, authorize(['manager', 'staff']), invoiceController.createInvoice);

// Tạo mã hóa đơn - chỉ manager và staff
router.post('/create-invoice-id/:type', protect, authorize(['manager', 'staff']), invoiceController.createInvoiceId);

// Lấy danh sách hóa đơn - tất cả vai trò đã đăng nhập
router.get('/', protect, authorize(['manager', 'accountant', 'staff']), invoiceController.getInvoices);

// Lấy chi tiết hóa đơn - tất cả vai trò đã đăng nhập
router.get('/:id', protect, authorize(['manager', 'accountant', 'staff']), invoiceController.getInvoiceById);

// Xóa hóa đơn - chỉ manager
router.delete('/:id', protect, authorize(['manager']), invoiceController.deleteInvoice);

// Đánh dấu hóa đơn là đã thanh toán - chỉ manager và accountant
router.patch('/:id/mark-as-paid', protect, authorize(['manager', 'accountant']), invoiceController.markInvoiceAsPaid);

// Đánh dấu các hóa đơn quá hạn thành nợ xấu - chỉ manager và accountant
router.patch('/mark-overdue-as-bad-debt', protect, authorize(['manager', 'accountant']), invoiceController.markOverdueInvoicesAsBadDebt);

module.exports = router;