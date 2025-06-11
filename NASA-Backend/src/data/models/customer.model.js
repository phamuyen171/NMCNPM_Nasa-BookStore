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
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 