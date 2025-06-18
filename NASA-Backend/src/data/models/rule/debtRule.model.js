const mongoose = require('mongoose');

const debtRuleSchema = new mongoose.Schema({

    maxLowDebt: {
        type: Number,
        default: 100
    },
    timeLowDebt: {
        type: Number,
        default: 60
    },
    maxHighDebt: {
        type: Number, 
        default: 1000,
        validate : {
            validator: function(v){
                return v > this.maxLowDebt;
            },
            message: "Khoản nợ lớn phải lớn hơn khoản nợ nhỏ"
        }
    },
    timeHighDebt: {
        type: Number,
        default: 180
    }
    
});

module.exports = debtRuleSchema;