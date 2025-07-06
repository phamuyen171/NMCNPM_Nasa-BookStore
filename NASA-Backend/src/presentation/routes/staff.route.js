// src/presentation/routes/staff.routes.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const uploadImg = require('../../business/services/uploadImage.service');

// Tự động điền thông tin nhân viên (chỉ manager)
router.post('/fill-staff-auto', protect, authorize(['manager']), staffController.fillStaffAuto);

// Xem danh sách nhân viên (tất cả vai trò)
router.get('/get-staff-by-page', protect, authorize(['manager', 'accountant', 'staff']), staffController.getStaffByPage);
router.get('/get-all-staffs', protect, authorize(['manager', 'accountant', 'staff']), staffController.getAllStaffs);

// Đổi trạng thái nhân viên (chỉ manager)
router.put('/change-status/:id', protect, authorize(['manager']), staffController.changeStatus);

// Xóa nhân viên (chỉ manager)
router.delete('/delete-staff/:id', protect, authorize(['manager']), staffController.deleteStaff);

// Kiểm tra tồn tại nhân viên (tất cả vai trò)
router.get('/check-staff-exist/:staffId', protect, authorize(['manager', 'accountant', 'staff']), staffController.checkStaffExist);

// Cập nhật thông tin nhân viên (chỉ manager)
router.put('/update-staff/:id', protect, authorize(['manager']), staffController.updateStaff);

// Cập nhật ảnh nhân viên (chỉ manager)
router.put('/update-staff-image/:id', protect, authorize(['manager']), uploadImg.single('image'), staffController.updateStaffImage);

// Xem chi tiết nhân viên theo username (tất cả vai trò)
router.get('/get-staff-by-username/:username', protect, authorize(['manager', 'accountant', 'staff']), staffController.getStaffById);

module.exports = router;