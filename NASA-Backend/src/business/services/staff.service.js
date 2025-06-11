const Staff = require('../../data/models/staff.model');

class StaffService {
    async checkExistingStaff(CCCD, phone) {
        
        if (!phone) {
            throw new Error('Vui lòng cung cấp số điện thoại');
        }
        if (!CCCD) {
            throw new Error('Vui lòng cung cấp CCCD');
        }

        let find = {
            status: 'active'
        }
        const existingCCCD = await Staff.findOne({ CCCD, ...find });
        const existingPhone = await Staff.findOne({ phone, ...find });
        
        if (existingCCCD || existingPhone) {
            return true
        }
        return false;
    }
    async createStaffId(role){
        if (!role) {
            throw new Error('Vui lòng cung cấp vai trò');
        }
        let find = {
            status: 'active'
        }
        const count = await Staff.countDocuments({ role, ...find });
        const role_dict = {
            'manager': 'M',
            'staff': 'S',
            'accountant': 'A'
        };
        const number=String(count+1).padStart(4, '0'); 
        if (!role_dict[role]) {
            throw new Error('Vai trò không hợp lệ');
        }
        // console.log(role_dict[role]);
        const staffId = `${role_dict[role]}${number}`;
        // console.log(`Tạo mã nhân viên: ${staffId} cho vai trò ${role}`);
        return staffId;
    }
    createStaffEmail(staffId) {
        if (!staffId) {
            throw new Error('Vui lòng cung cấp mã nhân viên');
        }
        const email = `${ staffId}@gmail.com`;
        return email;
    }

    createStaffPassword(cccd) {
        if (!cccd) {
            throw new Error('Vui lòng cung cấp CCCD nhân viên');
        }
        const password = `NASA@${cccd.slice(-4)}`;
        return password;
    }

    async getStaffByUsername(username){
        try{
            const staff = await Staff.findOne({ username: username, status: 'active' });
            if (!staff){
                throw new Error(`Không tìm thấy nhân viên có mã nhân viên: <b>${username}</b>`)
            }
            return staff;
        } catch (error){
            throw error;
        }
    }

    async createStaff(staffData, image) {
        if (!staffData) {
            throw new Error('Vui lòng cung cấp thông tin nhân viên');
        }
        const CCCD = staffData.CCCD;
        const phone = staffData.phone;
        const check = await this.checkExistingStaff(CCCD, phone);
        if (check) {
            throw new Error('Nhân viên đã tồn tại');
        }

        const [day, month, year] = staffData.DoB.split('/');
        const dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        // console.log(`Chuyển đổi ngày sinh: ${staffData.DoB} thành ${dateObject}`);

        const newStaff = new Staff({
            username: staffData.username,
            fullName: staffData.fullName,
            address: staffData.address,
            phone: staffData.phone,
            CCCD: staffData.CCCD,
            DoB: dateObject,
            thumbnail: staffData.thumbnail,
            role: staffData.role,
            email: staffData.email,
            startdate: new Date(),
            image: image
        });

        return await newStaff.save();
    }

    async getStaffByPage(queryOptions = {}) {
        try {
            const { page = 1, limit = 8, sortBy = 'username', order = 1, role } = queryOptions;

            let find = {
                status: 'active'
            };
            if (role) {
                find.role = role;
            }

            const skip = (page - 1) * limit;
            const totalStaffs = await Staff.countDocuments({ status: 'active' });

            const staffList = await Staff.find(find)
                .skip(skip)
                .limit(limit)
                .sort({ [sortBy]: order });

            return {
                total: totalStaffs,
                page: page,
                limit: limit,
                staffs: staffList
            };
        }
        catch (error) {
            throw new Error(`Lỗi khi lấy danh sách nhân viên: ${error.message}`);
        }
    }

    async getAllStaffs(){
        let filter = {
            isDeleted: 'false'
        }

        try{
            const staffList = await Staff.find(filter).sort({['username']:1});
            return staffList;
        }
        catch (error){
            throw new Error(`Lỗi khi lấy danh sách nhân viên: ${error.message}`);
        }
    }

    async changeStatus(staffId){
        try{
            const staff = await Staff.findOne({ _id: staffId, status: 'active'});
            if (!staff){
                throw new Error("Không tìm thấy nhân viên.");
            }

            staff.status = "inactive";

            await staff.save({
                runValidators: true
            });

            return staff;
        } catch (error){
            throw error;
        }
    }
}

module.exports = new StaffService();