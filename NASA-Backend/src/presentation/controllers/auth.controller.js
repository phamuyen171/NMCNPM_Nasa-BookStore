const authService = require('../../business/services/auth.service');
const staffService = require('../../business/services/staff.service');

class authController {
  // Route tạo người dùng (CHỈ DÙNG CHO USER CÓ ROLE CUA_HANG_TRUONG)
  async createAccount(req, res) {
    // req.body sẽ chứa đầy đủ thông tin về staff (màn hình tạo nhân viên) (bao gồm username, password, role, v.v.)

    // // Kiểm tra xem người dùng đã đăng nhập chưa
    // if (!req.user || !req.user.role.includes('cua_hang_truong')) {
    //   return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    // }

    try {
      const newStaff = await staffService.createStaff(req.body);
      if (!newStaff) {
        return res.status(400).json({success: false, message: 'Không thể tạo nhân viên với thông tin đã cung cấp' });
      }

      const newUser = await authService.addUser(req.body.username, req.body.password, req.body.role);
      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản thành công',
        data: newUser
      });
    } catch (err) {
      res.status(500).json({success: false, message: err.message });
    }
  }

  // Route đăng nhập
  async login(req, res) {
    // req.body sẽ chứa thông tin username và password
    const { username, password } = req.body;

    try {
        const token = await authService.login(username, password);
        res.json({ success: true, data: token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
  }
}


module.exports = new authController();