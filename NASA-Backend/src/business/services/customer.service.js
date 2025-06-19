const Customer = require('../../data/models/customer.model');

class CustomerService {
    async findCustomerByPhone(phone) {
        return Customer.findOne({ phone, isDeleted: false });
    }

    async createCustomer(phone, name = 'Khách hàng mới', type = 'normal') {
        const customer = new Customer({
            phone,
            name,
            type,
            points: 0,
            totalSpent: 0
        });
        return customer.save();
    }

    async updateCustomerPoints(phone, points, totalSpent) {
        return Customer.findOneAndUpdate(
            { phone, isDeleted: false },
            {
                $inc: {
                    points: points,
                    totalSpent: totalSpent
                }
            },
            { new: true }
        );
    }

    async getRetailCustomer(){
        try{
            const customers = await Customer.find({ type:"retail", isDeleted: false });
            if (!customers || customers.length === 0){
                throw new Error("Không tìm thấy khách hàng bán lẻ nào.");
            }
            return customers;
        } catch (error) {
            throw error;
        }
    }

    async getWholestailCustomer(){
        try {
            const customers = await Customer.find({ type: "wholesale", isDeleted: false});
            if (!customers || customers.length === 0){
                throw new Error("Không tìm thấy khách hàng bán sỉ nào.");
            }
            return customers;
        }
        catch (error){
            throw error;
        }
    }

    async resetPoints(){
        try{
            const nextResetDate = new Date(new Date().getFullYear() + 1, 0, 1);
            const result = await Customer.updateMany(
                { type: 'retail', isDeleted: false},
                { 
                    $set: {
                        points: 0,
                        resetAt: nextResetDate
                    }
                }
            );
        } catch (error){
            throw error;
        }
    }

    async updateCustomer(phone, updateData) {
        try {
            // Loại bỏ các trường không nên cập nhật trực tiếp hoặc không cần thiết
            delete updateData.phone; // Không cho phép cập nhật phone qua hàm này để tránh phức tạp
            delete updateData.points; // Điểm sẽ được cập nhật riêng
            delete updateData.totalSpent; // Tổng chi tiêu sẽ được cập nhật riêng
            delete updateData.createdAt;
            delete updateData.updatedAt;
            delete updateData.isDeleted; // Có thể có hàm riêng để xóa mềm

            const updatedCustomer = await Customer.findOneAndUpdate(
                { phone: phone, isDeleted: false },
                { $set: updateData },
                { new: true, runValidators: true } // `new: true` trả về tài liệu đã cập nhật, `runValidators: true` chạy các validation trong Schema
            );

            if (!updatedCustomer) {
                throw new Error("Không tìm thấy khách hàng để cập nhật.");
            }
            return updatedCustomer;
        } catch (error) {
            throw error;
        }
    }

    async deleteCustomer(phone) {
        try {
            const customer = await Customer.findOneAndUpdate(
                { phone: phone, isDeleted: false },
                { $set: { isDeleted: true } },
                { new: true } // Trả về tài liệu đã cập nhật
            );

            if (!customer) {
                throw new Error("Không tìm thấy khách hàng để xóa.");
            }
            return customer;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CustomerService(); 