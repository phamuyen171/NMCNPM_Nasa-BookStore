const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  username: { 
    // Mã nhân viên (username) là duy nhất và bắt buộc
    type: String, 
    required: [true, "Tên đăng nhập là bắt buộc"],
    trim: true,
    unique: true 
  },
  
  fullName: { 
    type: String, 
    required: [true, "Họ và tên nhân viên là bắt buộc"],
    trim: true,
  },

  address: { 
    type: String, 
    trim: true
  },

  phone: {
    type: String, 
    required: [true, "Số điện thoại là bắt buộc"],
    trim: true,
    unique: true
  },
  CCCD: {
    type: String, 
    required: [true, "CCCD là bắt buộc"],
    trim: true,
    unique: true
  },

  status: {
    // Trạng thái của nhân viên (active, inactive)
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active'
  },

  DoB: Date,
  startdate: Date,
  thumbnail: String,

  role: {
    // Vai trò của người dùng (cua_hang_truong, nhan_vien, admin)
    type: String, 
    enum: ['manager', 'staff', 'accountant'], 
    default: 'staff'
  },
  deletedAt: Date,

  resetToken: String,
  resetTokenExpire: Date
});

module.exports = mongoose.model('Staff', staffSchema);
