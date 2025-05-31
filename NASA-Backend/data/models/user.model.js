const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  staffId: { 
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

  resetToken: String,
  resetTokenExpire: Date
});

module.exports = mongoose.model('User', userSchema);
