const mongoose = require('mongoose');

const bookRuleSchema = new mongoose.Schema({

    // Dành cho sách
    minImportBook:{
        // số lượng nhập tối thiểu
        type: Number, 
        default: 100
    },
    maxImportBook: {
        // số lượng nhập tối đa
        type: Number,
        default: 300,
        validate : {
            validator: function(v){
                return v > this.minImportBook;
            },
            message: "Số lượng sách nhập tối đa phải lớn hơn số lượng sách nhập tối thiểu"
        }
    },
    maxImportableBook: {
        // số lượng tối đa cho phép nhập thêm
        type: Number, 
        default: 50
    },
});

module.exports = bookRuleSchema;