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
    email: {
        type: String,
        require: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v); // Regex đơn giản kiểm tra định dạng email
            },
            message: props => `${props.value} không phải là email hợp lệ!`
        }
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
        default: null,
        unique: true
    },
    taxId: {
        type: String,
        trim: true,
        default: null,
        unique: true
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
        default: () => {
            const now = new Date();
            return new Date(now.getFullYear() + 1, 0, 1); // 1/1 của năm sau
        }
    }
}, { timestamps: true });

// Thêm compound index để phone chỉ cần unique trong cùng type
customerSchema.index({ phone: 1, type: 1 }, { unique: true });
customerSchema.index(
  { companyName: 1, taxId: 1 },
  {
    unique: true,
    partialFilterExpression: { type: 'wholesale' }
  }
);


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 