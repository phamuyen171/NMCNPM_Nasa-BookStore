const Customer = require('../../data/models/customer.model');

// Tạo hoặc lấy thông tin khách hàng theo số điện thoại
exports.createOrGetCustomer = async (req, res) => {
    try {
        const { phone, points, totalSpent } = req.body;
        let customer = await Customer.findOne({ phone: phone, isDeleted: false });
        if (!customer) {
            customer = await Customer.create({ phone: phone, name: 'Khách hàng mới' });
        }
        if (points && totalSpent) {
            // Logic này có thể được chuyển sang invoice.service hoặc bỏ nếu đã xử lý ở đó
            customer.points += points;
            customer.totalSpent += totalSpent;
            await customer.save();
        }
        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Thêm khách hàng mới (cho use-case Thêm khách hàng mới)
exports.addCustomer = async (req, res) => {
    try {
        const { phone, name, type, idCard, companyName, taxId, address, discountPercentage } = req.body;
        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingCustomer = await Customer.findOne({ phone: phone, isDeleted: false });
        if (existingCustomer) {
            return res.status(409).json({ success: false, message: 'Số điện thoại đã tồn tại' });
        }

        const newCustomer = await Customer.create({ phone, name, type, idCard, companyName, taxId, address, discountPercentage });
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
        const customer = await Customer.findOne({ phone: phone, isDeleted: false });
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
        let customer = await Customer.findOne({ phone: phone, isDeleted: false });
        if (!customer) {
            // Nếu khách hàng không tồn tại, tạo mới
            customer = await Customer.create({ phone: phone, name: 'Khách hàng mới' });
        }
        // Cập nhật điểm và tổng chi tiêu
        customer.points += points;
        customer.totalSpent += totalSpent;
        await customer.save();

        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Lấy thông tin công ty khách hàng sỉ theo tên công ty
exports.getCompanyInfoByName = async (req, res) => {
    try {
        const { companyName } = req.params; // Lấy tên công ty từ URL params
        const customer = await Customer.findOne({
            companyName: new RegExp(companyName, 'i'), // Tìm kiếm không phân biệt hoa thường
            type: 'wholesale',
            isDeleted: false
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy công ty khách sỉ này' });
        }

        res.json({ success: true, data: { taxId: customer.taxId, address: customer.address } });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin công ty: ", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin công ty' });
    }
}; 