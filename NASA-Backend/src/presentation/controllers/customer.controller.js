const Customer = require('../../data/models/customer.model');
const customerService = require('../../business/services/customer.service');
const Invoice = require('../../data/models/invoice.model')

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
        const { phone, name, type, companyName, taxId, address, discountPercentage, debtLimit, email } = req.body;
        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingCustomer = await Customer.findOne({ phone: phone, isDeleted: false });
        if (existingCustomer) {
            return res.status(409).json({ success: false, message: 'Số điện thoại đã tồn tại' });
        }

        // Kiểm tra mã số thuế đã tồn tại chưa
        const existingTaxId = await Customer.findOne({ taxId: taxId, isDeleted: false });
        if (taxId && existingTaxId) { // Chỉ kiểm tra nếu taxId được cung cấp và đã tồn tại
            return res.status(409).json({ success: false, message: 'Mã số thuế đã tồn tại' });
        }
        let customerId = null;
        if (type === "wholesale"){
            const countWholesale = await Customer.countDocuments({type});
            customerId = `WH${String(countWholesale+1).padStart(3, '0')}`;
        }
        const newCustomer = await Customer.create({ phone, name, type, companyName, taxId, address, discountPercentage, customerId, debtLimit, email });
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
        const customer = await customerService.getCompanyInfoByName(companyName);
        
        res.json({ success: true, data: { taxId: customer.taxId, address: customer.address } });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin công ty: ", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin công ty' });
    }
};

exports.getRetailCustomer = async (req, res) => {
    try {
        const retailCustomer = await customerService.getRetailCustomer();
        return res.status(200).json({ success: true, message: "Lấy danh sách khách hàng bán lẻ thành công", data: retailCustomer });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getWholestailCustomer = async (req, res) => {
    try {
        const wholesaleCustomer = await customerService.getWholestailCustomer();
        return res.status(200).json({ success: true, message: "Lấy danh sách khách hàng bán sỉ thành công", data: wholesaleCustomer });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.resetPoints = async (req, res) => {
    try {
        await customerService.resetPoints();
        return res.status(200).json({ success: true, message: "Điểm tích lũy đã được reset thành công." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.checkRepresentative = async (req, res) => {
    try {
        const { companyName, taxId, name, phone } = req.body;
        const customer = await Customer.findOne({ companyName, taxId, name, phone, isDeleted: false });
        if (!customer) {
            throw new Error("Người đại diện không đúng với công ty.");
        }
        res.status(200).json({ success: true, message: "Người đại diện phù hợp với công ty.", data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = req.body;

        const updatedCustomer = await customerService.updateCustomer(id, updateData);

        res.status(200).json({ success: true, message: 'Cập nhật thông tin khách hàng thành công', data: updatedCustomer });
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin khách hàng: ", error);
        // Kiểm tra nếu lỗi là do không tìm thấy khách hàng
        if (error.message === "Không tìm thấy khách hàng để cập nhật.") {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông tin khách hàng' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params; // Lấy số điện thoại từ URL parameters

        const deletedCustomer = await customerService.deleteCustomer(id);

        res.status(200).json({ success: true, message: 'Xóa mềm tài khoản khách hàng thành công', data: deletedCustomer });
    } catch (error) {
        console.error("Lỗi khi xóa tài khoản khách hàng: ", error);
        if (error.message === "Không tìm thấy khách hàng để xóa.") {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa tài khoản khách hàng' });
    }
};

exports.countCustomers = async (req, res) => {
    try {
        const count = await customerService.countCustomers();
        res.status(200).json({ success: true, message: 'Đếm số lượng khách hàng thành công', data: { count } });
    } catch (error) {
        console.error("Lỗi khi đếm số lượng khách hàng: ", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đếm số lượng khách hàng' });
    }
};

exports.checkExistTaxID = async (req, res) => {
    try{
        if (!req.params.taxId) {
            return res.status(400).json({ success: false, message: "Thiếu mã số thuế." });
        }
        const customer = await Customer.findOne({
           taxId: req.params.taxId,
           type: "wholesale" ,
           isDeleted: false
        });
        const exists = !!customer;
        const message = exists ? "Mã số thuế đã tồn tại." : "Mã số thuế không tồn tại.";
        res.status(200).json({ success: true, message, data: { check: exists } });

    } catch (error){
        res.status(500).json({success: false, message: error.message});
    }
};

exports.isBadDebt = async (req, res) => {
    try {
        if (!req.params.companyName){
            throw new Error("Tên công ty không hợp lệ.");
        }
        const filter = {
            isDeleted: false,
            companyName: req.params.companyName,
            customerType: "wholesale",
            paymentMethod: "debt",
            $or: [
                { paidAt: null, dueDate: { $lt: new Date() } },
                { $expr: { $gt: ["$paidAt", "$dueDate"] } }
            ]
        }
        const invoices = await Invoice.find(filter);
        let check = false;
        if (invoices){
            if (invoices.length > 0){
                check = true;
            }
            res.status(200).json({success: true, data: { isBadDebt: check}});
        }
    } catch (error){
        res.status(500).json({ success: false, message: error.message});
    }
};

exports.resetDiscount = async (req, res) => {
    try{
        const id = req.params.id;
        if (!id){
            throw new Error("Mã Khách hàng không hợp lệ.");
        }
        const customer = await Customer.findOne({_id: id, isDeleted: false});
        customer.discountPercentage = 0;
        const savedCustomer = await customer.save();
        res.status(200).json({success: true, message: "Thu hồi chiết khấu khách hàng thành công", data: savedCustomer});
    } catch (error){
        res.status(500).json({success: false, message: error.message});
    }
};