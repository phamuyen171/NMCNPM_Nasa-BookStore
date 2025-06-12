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
}

module.exports = new CustomerService(); 