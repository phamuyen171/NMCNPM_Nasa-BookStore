// src/presentation/routes/staff.routes.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller'); // Đường dẫn này đi lên 1 cấp presentation, rồi vào controllers
// const { protect, authorize } = require('../../middlewares/auth.middleware');

router.post('/fill-staff-auto', staffController.fillStaffAuto);

router.get('/get-staff-by-page', staffController.getStaffByPage);

module.exports = router;