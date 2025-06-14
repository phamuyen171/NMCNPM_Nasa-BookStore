const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');

// Định nghĩa các route cho báo cáo thống kê 
router.get('/book-imports', reportController.getBookImportStatistics);
router.get('/sales', reportController.getSalesStatistics);

module.exports = router; 