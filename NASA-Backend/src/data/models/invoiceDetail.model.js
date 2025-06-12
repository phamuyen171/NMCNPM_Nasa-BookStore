const mongoose = require('mongoose');

const invoiceDetailSchema = new mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    bookTitle: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('InvoiceDetail', invoiceDetailSchema);