const authService = require('../../business/services/auth.service');
const staffService = require('../../business/services/staff.service');

class authController {
  // Route tạo người dùng (CHỈ DÙNG CHO USER CÓ ROLE CUA_HANG_TRUONG)
  async createAccount(req, res) {
    // req.body sẽ chứa đầy đủ thông tin về staff (màn hình tạo nhân viên) (bao gồm username, password, role, v.v.)

    // Kiểm tra xem người dùng đã đăng nhập chưa
    // console.log(req.user);

    // if (!req.user || !req.user.role.includes('cua_hang_truong')) {
    //   return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    // }

    try {

      const imageId = req.file.id;

      const newStaff = await staffService.createStaff(req.body, imageId);
      if (!newStaff) {
        return res.status(400).json({success: false, message: 'Không thể tạo nhân viên với thông tin đã cung cấp' });
      }

      const newUser = await authService.addUser(req.body.username, req.body.password, req.body.role, imageId);
      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản thành công',
        data: { ...newUser, "fullName":req.body.fullName}
      });
    } catch (error) {
      // res.status(500).json({success: false, message: err.message });
      if (error.name === 'ValidationError') {
          const firstInvalidField = Object.keys(error.errors)[0];
          const firstErrorMessage = error.errors[firstInvalidField].message;

          res.status(400).json({
              success: false,
              message: `Lỗi validation: ${firstErrorMessage}`,
              invalidField: firstInvalidField, // Trường không hợp lệ
              errorType: error.errors[firstInvalidField].kind 
          });
      }
      else {
        res.status(500).json({
              success: false,
              message: error.message,
          });
      }
    }
  }

  // Route đăng nhập
  async login(req, res) {
    // req.body sẽ chứa thông tin username và password
    const { username, password } = req.body;

    try {
        const userData = await authService.login(username, password);
        res.json({ success: true, message: "Đăng nhập thành công", data: userData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
  }

  async resetPassWord(req, res){
    try{
      const staff = await staffService.getStaffByUsername(req.params.username);
      const password = staffService.createStaffPassword(staff.CCCD);
      const account = await authService.resetPassword(req.params.username, password);
      return res.status(200).json({
          success: true,
          message: "Reset password nhân viên thành công",
          data: account
      });
    }
    catch (error){
        return res.status(500).json({ success: false, message: error.message });
    }
  }
  
}


module.exports = new authController();