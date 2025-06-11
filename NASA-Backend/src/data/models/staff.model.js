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
  email:{
    type: String,
    required: [true, "Email là bắt buộc"],
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
    // Trạng thái của nhân viên (active: vẫn còn làm, inactive: đã sa thải)
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active'
  },

  DoB: {
    // type: Date,
    type: Date,
    required: false
  },

  image: {
    type: mongoose.Schema.Types.ObjectId,  // Tham chiếu tới file lưu trong GridFS
    required: false,                       // Có thể là tùy chọn nếu chưa upload ảnh
    ref: 'fs.files'                        // Bảng chứa metadata ảnh trong GridFS
  },
  
  startDate: Date,
  thumbnail: String,

  role: {
    // Vai trò của người dùng (cua_hang_truong, nhan_vien, admin)
    type: String, 
    enum: ['manager', 'staff', 'accountant'], 
    default: 'staff'
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: Date,

  resetToken: String,
  resetTokenExpire: Date
});

module.exports = mongoose.model('Staff', staffSchema);
