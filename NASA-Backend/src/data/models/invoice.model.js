const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceID: {
        type: String,
        unique: true,
        required: true
    },
    invoiceFormNumber: {
        type: String,
        default: null
    },
    invoiceSerialNumber: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    },
    subtotal: {
        type: Number,
        required: true
    },
    totalDiscount: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: 10
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'debt', 'bad_debt'],
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
    pointsUsed: {
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

module.exports = mongoose.model('Invoice', invoiceSchema);