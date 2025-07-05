const mongoose = require('mongoose');

const bookRuleSchema = new mongoose.Schema({

    // Dành cho sách 
    minImportBook: {
        // số lượng nhập tối thiểu
        type: Number,
        default: 100,
        min: [0, "Số lượng nhập tối thiểu phải là số không âm"],
        validate: {
            validator: Number.isInteger,
            message: "Số lượng nhập tối thiểu phải là số nguyên"
        }
    },
    maxImportBook: {
        // số lượng nhập tối đa
        type: Number,
        default: 300,
        validate: [
            {
                validator: function (v) { return v > this.minImportBook; },
                message: "Số lượng sách nhập tối đa phải lớn hơn số lượng sách nhập tối thiểu"
            },
            {
                validator: Number.isInteger,
                message: "Số lượng nhập tối đa phải là số nguyên"
            },
            {
                validator: function (v) { return v >= 0; },
                message: "Số lượng nhập tối đa phải là số không âm"
            }
        ]
    },
    maxImportableBook: {
        // số lượng tối đa cho phép nhập thêm
        type: Number,
        default: 50,
        min: [0, "Số lượng tồn tối đa phải là số không âm"],
        validate: {
            validator: Number.isInteger,
            message: "Số lượng tồn tối đa phải là số nguyên"
        }
    },
});

module.exports = bookRuleSchema;