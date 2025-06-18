const mongoose = require('mongoose');

const pointRuleSchema = new mongoose.Schema({

    minBillValue: {
        // giá trị hóa đơn tối thiểu được sử dụng điểm
        type: Number,
        default: 20
    },
    minPointToUse: {
        // số điểm tích lũy tối thiểu để được sử dụng
        type: Number, 
        default: 10
    },
    cashToPoint: {
        // giá trị tiền mặt có thể quy đổi được 1 điểm
        type: Number, 
        default: 10
    },
    pointToCash: {
        // 1 điểm tích lũy có thể giảm được
        type: Number, 
        default: 1
    },
    minUsedLevel:{
        // số điểm tối thiểu được sử dụng trong một hóa đơn
        type: Number,
        default: 1
    }
});

module.exports = pointRuleSchema;