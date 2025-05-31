// mongoose giúp mình làm việc với MongoDB dễ hơn
const mongoose = require('mongoose');

// Định nghĩa cấu trúc (schema) cho sách
const bookSchema = new mongoose.Schema({
    // Tên sách, bắt buộc phải có
    title: {
        type: String,
        required: [true, 'Tên sách là bắt buộc'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Tác giả là bắt buộc'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Thể loại là bắt buộc'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Giá bán là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    quantity: {
        type: Number,
        required: [true, 'Số lượng là bắt buộc'],
        min: [0, 'Số lượng không được âm']
    },
    image: {
        type: String,
        required: [true, 'Hình ảnh là bắt buộc'],
        // Tự kiểm tra xem URL ảnh có hợp lệ không (tạm thời chỉ check đuôi file)
        validate: {
            validator: function (v) {
                // Dùng regex để kiểm tra đuôi file ảnh
                return /\.(jpg|jpeg|png|gif)$/i.test(v);
            },
            message: props => `${props.value} không phải là URL hình ảnh hợp lệ (chỉ chấp nhận .jpg, .jpeg, .png, .gif)!`
        }
    },
    publisher: {
        type: String,
        required: [true, 'Nhà xuất bản là bắt buộc'],
        trim: true
    },
    priceImport: {
        type: Number,
        required: [true, 'Giá nhập là bắt buộc'],
        min: [0, 'Giá nhập không được âm']
    },
    description: {
        type: String,
        required: [true, 'Mô tả là bắt buộc']
    },
    status: {
        type: String,
        required: [true, 'Trạng thái là bắt buộc'],
        trim: true,
        // Chỉ chấp nhận các trạng thái này
        enum: ['Available', 'Out of Stock', 'Discontinued'],
        default: 'Available' // Mặc định sách mới là còn hàng
    },
    // Đánh dấu sách đã bị xóa mềm hay chưa
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo Model từ schema để tương tác với collection 'books' trong DB
module.exports = mongoose.model('Book', bookSchema);