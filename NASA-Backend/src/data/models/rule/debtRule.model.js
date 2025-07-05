const mongoose = require('mongoose');

const debtRuleSchema = new mongoose.Schema({

    maxLowDebt: {
        type: Number,
        default: 100,
        min: [0, "Khoản nợ nhỏ phải là số không âm"]
    },
    timeLowDebt: {
        type: Number,
        default: 60,
        min: [1, "Thời gian hoàn nợ phải lớn hơn 0"],
        validate: {
            validator: Number.isInteger,
            message: "Thời gian hoàn nợ phải là số nguyên"
        }
    },
    maxHighDebt: {
        type: Number,
        default: 1000,
        validate: [
            {
                validator: function (v) { return v > this.maxLowDebt; },
                message: "Khoản nợ lớn phải lớn hơn khoản nợ nhỏ"
            },
            {
                validator: function (v) { return v >= 0; },
                message: "Khoản nợ lớn phải là số không âm"
            }
        ]
    },
    timeHighDebt: {
        type: Number,
        default: 180,
        min: [1, "Thời gian hoàn nợ phải lớn hơn 0"],
        validate: {
            validator: Number.isInteger,
            message: "Thời gian hoàn nợ phải là số nguyên"
        }
    },
    
});

module.exports = debtRuleSchema;