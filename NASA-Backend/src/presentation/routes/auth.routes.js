const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const uploadImg = require('../../business/services/uploadImage.service');

router.post('/create-account', protect, authorize(['manager']), uploadImg.single('image'), authController.createAccount);
router.post('/login', authController.login);
router.put('/reset-password/:username', protect, authorize(['manager']), authController.resetPassWord);
router.put('/change-password/:username', protect, authorize(['manager', 'accountant', 'staff']), authController.changePassword);

module.exports = router;