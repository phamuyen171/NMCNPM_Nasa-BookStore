const mongoose = require('mongoose');

const importOrderSchema = new mongoose.Schema({
    items: [{
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 5,
            max: 1000
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'confirmed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: {
        type: Date
    }
});

const ImportOrder = mongoose.model('ImportOrder', importOrderSchema);

module.exports = ImportOrder; 