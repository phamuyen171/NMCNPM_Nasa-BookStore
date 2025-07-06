const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.get('/book-imports', protect, authorize(['manager', 'accountant']), reportController.getBookImportStatistics);
router.get('/sales', protect, authorize(['manager', 'accountant']), reportController.getSalesStatistics);

module.exports = router;