// src/presentation/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); // Đường dẫn này đi lên 1 cấp presentation, rồi vào controllers
const { protect, authorize } = require('../../middlewares/auth.middleware');
const uploadImg = require('../../business/services/uploadImage.service');


router.post('/create-account', protect, authorize(['manager']), uploadImg.single('image'), authController.createAccount);

// Route đăng nhập
router.post('/login', authController.login);

module.exports = router;