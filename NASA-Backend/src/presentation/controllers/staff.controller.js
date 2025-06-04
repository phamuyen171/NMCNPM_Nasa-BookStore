const staffService = require('../../business/services/staff.service');

class staffController {
  // Route đăng ký người dùng (CHỈ DÙNG CHO USER CÓ ROLE CUA_HANG_TRUONG)
  async fillStaffAuto(req, res) {
    // req.body chứa thông tin chức vị, CCCD
    const role = req.body.role;
    const cccd = req.body.CCCD;
    if (!role || !cccd) {
        return res.status(400).json({success: false, message: 'Vui lòng cung cấp đầy đủ thông tin chức vị và CCCD' });
    }
    try{
        const staffId = await staffService.createStaffId(role);
        // console.log(`Tạo mã nhân viên: ${staffId} cho vai trò ${role}`);
        if (!staffId) {
            return res.status(400).json({ success: false, message: 'Không thể tạo mã nhân viên cho chức vị này' });
        }
        const username = staffId;
        const staffEmail = staffService.createStaffEmail(staffId);
        // console.log(`Tạo email nhân viên: ${staffEmail} cho mã nhân viên ${staffId}`);
        if (!staffEmail) {
            return res.status(400).json({ success:false, message: 'Không thể tạo email cho nhân viên' });
        }
        const password = staffService.createStaffPassword(cccd);
        // console.log(`Tạo mật khẩu nhân viên: ${password} cho CCCD ${cccd}`);
        if (!password) {
            return res.status(400).json({ success: false, message: 'Không thể tạo mật khẩu cho tài khoản nhân viên' });
        }
        return res.status(200).json({
            success: true,
            message: 'Tạo thông tin nhân viên tự động thành công',
            data: {
                staffId: staffId,
                username: username,
                email: staffEmail,
                password: password
            }            
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStaffByPage(req, res) {
    try {
        const queryOptions = {
            page: parseInt(req.query.page) || 1, 
            limit: parseInt(req.query.limit) || 8,
            sortBy: req.query.sortBy || 'username',
            order: parseInt(req.query.order) || 1,
            role: req.query.role
        }

        Object.keys(queryOptions).forEach(key => {
            if (queryOptions[key] === undefined || (typeof queryOptions[key] === 'number' && isNaN(queryOptions[key]))) {
                delete queryOptions[key];
            }
        });

        const staffList = await staffService.getStaffByPage(queryOptions);
        if (!staffList || staffList.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên nào' });
        }
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách nhân viên thành công',
            data: staffList
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
  }

}


module.exports = new staffController();