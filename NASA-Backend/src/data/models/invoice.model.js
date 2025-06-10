const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceID: {
        type: String,
        unique: true,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'debt'],
        required: true
    },
    customerPhone: {
        type: String,
        required: false,
        validate: {
            validator: function (v) {
                return !v || /^[0-9]{10}$/.test(v);
            },
            message: 'Số điện thoại phải có 10 chữ số'
        }
    },
    customerType: {
        type: String,
        enum: ['retail', 'wholesale'],
        default: 'retail'
    },
    points: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'debt'],
        required: true
    },
    appliedPromotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        default: null
    },
    promotionDiscount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Middleware để tự động tính điểm tích lũy (1% giá trị hóa đơn)
invoiceSchema.pre('save', function (next) {
    if (this.customerPhone && this.total > 0) {
        this.points = Math.floor(this.total * 0.01); // 1% giá trị hóa đơn
    }
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);