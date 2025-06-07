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
        required: false
    },
    customerType: {
        type: String,
        enum: ['retail', 'wholesale'],
        default: 'retail'
    },
    createdBy: {
        type: String,
        required: true
    },
    appliedPromotion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);