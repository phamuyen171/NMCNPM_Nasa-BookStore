// src/presentation/routes/staff.routes.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller'); // Đường dẫn này đi lên 1 cấp presentation, rồi vào controllers
// const { protect, authorize } = require('../../middlewares/auth.middleware');
const uploadImg = require('../../business/services/uploadImage.service');

router.post('/fill-staff-auto', staffController.fillStaffAuto);

router.get('/get-staff-by-page', staffController.getStaffByPage);

router.get('/get-all-staffs', staffController.getAllStaffs);

router.put('/change-status/:id', staffController.changeStatus);

router.delete('/delete-staff/:id', staffController.deleteStaff);

router.get('/check-staff-exist/:staffId', staffController.checkStaffExist);

router.put('/update-staff/:id', staffController.updateStaff);

router.put('/update-staff-image/:id', uploadImg.single('image'), staffController.updateStaffImage);

router.get('/get-staff-by-username/:username', staffController.getStaffById);

module.exports = router;