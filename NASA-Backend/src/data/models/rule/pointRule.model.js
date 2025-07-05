const mongoose = require('mongoose');

const pointRuleSchema = new mongoose.Schema({

    minBillValue: {
        // giá trị hóa đơn tối thiểu được sử dụng điểm
        type: Number,
        default: 20,
        min: [0, "Giá trị hóa đơn tối thiểu phải là số không âm"]
    },
    minPointToUse: {
        // số điểm tích lũy tối thiểu để được sử dụng
        type: Number,
        default: 10,
        min: [0, "Số điểm tích lũy tối thiểu phải là số không âm"],
        validate: {
            validator: Number.isInteger,
            message: "Số điểm tích lũy tối thiểu phải là số nguyên"
        }
    },
    cashToPoint: {
        // giá trị tiền mặt có thể quy đổi được 1 điểm
        type: Number,
        default: 10,
        min: [0, "Giá trị tiền mặt quy đổi phải là số không âm"]
    },
    pointToCash: {
        // 1 điểm tích lũy có thể giảm được
        type: Number,
        default: 1,
        min: [0, "Giá trị giảm của 1 điểm phải là số không âm"]
    },
    minUsedLevel: {
        // số điểm tối thiểu được sử dụng trong một hóa đơn
        type: Number,
        default: 1,
        min: [0, "Số điểm tối thiểu sử dụng phải là số không âm"],
        validate: {
            validator: Number.isInteger,
            message: "Số điểm tối thiểu sử dụng phải là số nguyên"
        }
    },
});

module.exports = pointRuleSchema;