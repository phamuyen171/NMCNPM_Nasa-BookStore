const customerService = require('../../business/services/customer.service');

// Tạo hoặc lấy thông tin khách hàng theo số điện thoại
exports.createOrGetCustomer = async (req, res) => {
    try {
        const { phone, points, totalSpent } = req.body;
        let customer = await customerService.findCustomerByPhone(phone);
        if (!customer) {
            customer = await customerService.createCustomer(phone);
        }
        if (points && totalSpent) {
            customer = await customerService.updateCustomerPoints(phone, points, totalSpent);
        }
        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Thêm khách hàng mới (cho use-case Thêm khách hàng mới)
exports.addCustomer = async (req, res) => {
    try {
        const { phone, name, type, idCard } = req.body;
        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingCustomer = await customerService.findCustomerByPhone(phone);
        if (existingCustomer) {
            return res.status(409).json({ success: false, message: 'Số điện thoại đã tồn tại' });
        }

        const newCustomer = await customerService.createCustomer(phone, name, type, idCard);
        res.status(201).json({ success: true, message: 'Thêm khách hàng thành công', data: newCustomer });
    } catch (error) {
        console.error("Lỗi khi thêm khách hàng: ", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi thêm khách hàng' });
    }
};

// Tìm khách hàng theo số điện thoại
exports.findCustomerByPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        const customer = await customerService.findCustomerByPhone(phone);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
        }
        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Cập nhật điểm tích lũy sau khi thanh toán 
exports.updatePoints = async (req, res) => {
    try {
        const { phone, points, totalSpent } = req.body;
        let customer = await customerService.findCustomerByPhone(phone);
        if (!customer) {
            customer = await customerService.createCustomer(phone);
        }
        customer = await customerService.updateCustomerPoints(phone, points, totalSpent);
        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}; 