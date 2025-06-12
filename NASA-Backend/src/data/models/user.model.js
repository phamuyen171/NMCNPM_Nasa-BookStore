const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    // Mã nhân viên (username) là duy nhất và bắt buộc
    type: String, 
    required: [true, "Tên đăng nhập là bắt buộc"],
    trim: true,
    unique: true 
  },

  password: { 
    type: String, 
    required: [true, "Mật khẩu là bắt buộc"],
    minlength: [8, "Mật khẩu phải có ít nhất 8 ký tự"], 
  },

  role: {
    // Vai trò của người dùng (cua_hang_truong, nhan_vien, admin)
    type: String, 
    enum: ['manager', 'staff', 'accountant'], 
    default: 'staff'
  },

  status: {
    // Trạng thái của người dùng (active, inactive)
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active'
  },

  image: {
    type: mongoose.Schema.Types.ObjectId,  // Tham chiếu tới file lưu trong GridFS
    required: false,                       // Có thể là tùy chọn nếu chưa upload ảnh
    ref: 'fs.files'                        // Bảng chứa metadata ảnh trong GridFS
  },

  resetToken: String,
  resetTokenExpire: Date
});

module.exports = mongoose.model('User', userSchema);
