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
}

module.exports = new CustomerService(); 