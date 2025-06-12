const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Số điện thoại phải có 10 chữ số'
        }
    },
    name: {
        type: String,
        required: true
    },
    customerId: {
        type: String, // Mã khách hàng (chỉ có với khách sỉ)
        default: null
    },
    type: {
        type: String,
        enum: ['retail', 'wholesale'],
        default: 'retail' // retail: lẻ, wholesale: sỉ
    },
    idCard: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[0-9]{9,12}$/.test(v);
            },
            message: 'CCCD phải có 9-12 chữ số'
        }
    },
    points: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    debtLimit: {
        type: Number,
        default: 0  // 0 cho khách lẻ, > 0 cho khách sỉ
    },
    currentDebt: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: 0, // Mặc định là 0 nếu khách hàng không có chiết khấu đặc biệt
        min: 0,
        max: 100
    },
    // Thêm các trường cho thông tin khách hàng là tổ chức/sỉ (cho hóa đơn GTGT)
    companyName: {
        type: String,
        trim: true,
        default: null
    },
    taxId: {
        type: String,
        trim: true,
        default: null
    },
    address: {
        type: String,
        trim: true,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetAt:{
        type: Date, 
        default: new Date(new Date().getFullYear + 1, 0, 1)
    }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 