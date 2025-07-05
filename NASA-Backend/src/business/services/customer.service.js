const Customer = require('../../data/models/customer.model');

class CustomerService {
    async findCustomerByPhone(phone) {
        return Customer.findOne({ phone, isDeleted: false });
    }

    async getCompanyInfoByName(companyName) {
        try{
            if (!companyName) {
                throw new Error("Tên công ty không được để trống.");
            }
            const customer = await Customer.findOne({
                companyName: new RegExp(companyName, 'i'), // Tìm kiếm không phân biệt hoa thường
                type: 'wholesale',
                isDeleted: false
            });
            if (!customer) {
                throw new Error("Không tìm thấy công ty khách sỉ với tên này.");
            }

            return customer;
        } catch (error) {
            throw new Error("Lỗi khi tìm kiếm công ty: " + error.message);
        }
    }

    async updateCustomerRetail(phone, updatePoints, spent){
        try {
            const customer = await this.findCustomerByPhone(phone);
            if (customer) {
                const resetDate = customer.resetAt;
                customer.points += updatePoints;
                customer.totalSpent += spent;
                customer.resetAt = resetDate;
                await customer.save();
                return customer;
            }
            else {
                throw new Error("Không tìm thấy khách hàng bán lẻ với số điện thoại này.");
            }
        } catch (error) {
            throw new Error("Lỗi khi cập nhật khách hàng bán lẻ: " + error.message);
        }
        
    }

    async updateCustomerWholesale(invoiceData){
        try{
            const customer = await this.getCompanyInfoByName(invoiceData.companyName);
            if (customer) {
                if (invoiceData.paymentMethod === 'paid') {
                    customer.totalSpent += invoiceDate.total;
                } else if (invoiceData.status === 'debt') {
                    customer.currentDebt += invoiceData.total;
                }
                await customer.save();
                return customer;
            } else {
                throw new Error("Không tìm thấy khách hàng bán sỉ với tên công ty này.");
            }
        }
        catch (error) {
            throw new Error("Lỗi khi cập nhật khách hàng bán sỉ: " + error.message);
        }
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

    async updateCustomer(id, updateData) {
        try {

            const updatedCustomer = await Customer.findOneAndUpdate(
                { _id: id, isDeleted: false, type: "wholesale" },
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

    async deleteCustomer(id) {
        try {
            const customer = await Customer.findOneAndUpdate(
                { _id: id, isDeleted: false },
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

    async countCustomers() {
        try {
            const totalCustomers = await Customer.countDocuments({ isDeleted: false });
            return totalCustomers;
        } catch (error) {
            throw new Error("Lỗi khi đếm số lượng khách hàng: " + error.message);
        }
    }
}

module.exports = new CustomerService(); 