const staffService = require('../../business/services/staff.service');
const authService = require('../../business/services/auth.service');

class staffController {
  // Route đăng ký người dùng (CHỈ DÙNG CHO USER CÓ ROLE CUA_HANG_TRUONG)
  async fillStaffAuto(req, res) {
    // req.body chứa thông tin chức vị, CCCD
    const role = req.body.role;
    const cccd = req.body.CCCD;
    const startDate = req.body.startDate;
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
                password: password,
                startDate: startDate ? startDate : new Date()
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

  async getAllStaffs(req, res){
    try{
        const staffList = await staffService.getAllStaffs();
            if (!staffList || staffList.length === 0){
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhân viên nào"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Lấy danh sách nhân viên thành công",
                data: staffList
            });
    }
    catch (error){
        return res.status(500).json({ success: false, message: error.message });
    }
  }

  async changeStatus(req, res){
    try{
        const staff = await staffService.changeStatus(req.params.id);
        const user = await authService.lockAccount(staff.username);
        return res.status(200).json({ success: true, message: "Sa thải nhân viên thành công!"});
    }
    catch (error){
        return res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteStaff(req, res){
    try{
        const staff = await staffService.deleteStaff(req.params.id);
        return res.status(200).json({ success: true, message: "Xóa nhân viên thành công!"});
    }
    catch (error){
        return res.status(500).json({ success: false, message: error.message});
    }
  }

  async checkStaffExist(req, res){
    try{
        const staff = await staffService.checkStaffExist(req.params.staffId);
        return res.status(200).json({ success: true, message: "Lấy thông tin nhân viên thành công", data: staff});
    }
    catch (error){
        return res.status(500).json({ success: false, message: error.message});
    }
  }

  async updateStaff(req, res) {
    try {
      const staffId = req.params.id;
      const staffData = req.body;

      // Update staff information
      const updatedStaff = await staffService.updateStaff(staffId, staffData);
      if (!updatedStaff) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên để cập nhật' });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin nhân viên thành công',
        data: updatedStaff
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateStaffImage(req, res) {
    try {
      const staffId = req.params.id;
      const imageId = req.file.id;

      // Update staff image
      const updatedStaff = await staffService.updateImage(staffId, imageId);
      if (!updatedStaff) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên để cập nhật hình ảnh' });
      }

      return res.status(200).json({
        success: true,
        message: 'Cập nhật hình ảnh nhân viên thành công',
        data: updatedStaff
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  async getStaffById(req, res) {
    try {
      const username = req.params.username;
      const staff = await staffService.getStaffById(username);
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên với ID này' });
      }
      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin nhân viên thành công',
        data: staff
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

}


module.exports = new staffController();