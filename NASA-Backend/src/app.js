// src/app.js
require('dotenv').config(); // Đảm bảo biến môi trường được load đầu tiên
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config'); // Hoặc database, tùy tên file bạn giữ lại
const bookRoutes = require('./presentation/routes/book.routes');
const authRoutes = require('./presentation/routes/auth.routes');
const staffRoutes = require('./presentation/routes/staff.route'); // Đường dẫn đến staff routes
const importOrderRoutes = require('./presentation/routes/import-order.routes'); // Thêm routes cho đơn nhập sách
const invoiceRoutes = require('./presentation/routes/invoice.routes'); // Đường dẫn đến invoice routes
const customerRoutes = require('./presentation/routes/customer.routes');
const imageRoutes = require('./presentation/routes/image.routes')
const reportRoutes = require('./presentation/routes/report.routes');

const app = express();

// Kết nối database
connectDB();

// Middleware
app.use(cors()); // Cho phép các origin khác nhau truy cập API (cần điều chỉnh cho production)
app.use(express.json()); // Để đọc body của request dạng JSON

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/books', importOrderRoutes); // Thêm routes cho đơn nhập sách (sử dụng chung prefix /api/books)
app.use('/api/invoices', invoiceRoutes); // Thêm routes cho hóa đơn
app.use('/api/customers', customerRoutes); // Thêm routes cho khách hàng
app.use('api/image', imageRoutes);
app.use('/api/reports', reportRoutes); // Thêm routes cho báo cáo

// Middleware xử lý lỗi TẬP TRUNG
// Bắt các lỗi được ném ra (thrown) từ controllers hoặc service
app.use((err, req, res, next) => {
    console.error(err.stack); // Log lỗi đầy đủ trên server console để debug

    // Mặc định lỗi là 500 Internal Server Error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Có lỗi xảy ra ở server!';

    // Xử lý một số loại lỗi Mongoose cụ thể nếu chưa bắt ở controller
    if (err.name === 'CastError') {
        statusCode = 400; // Bad Request
        message = 'ID không hợp lệ';
    }
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }
    if (err.code === 11000) {
        statusCode = 400;
        message = 'Dữ liệu bị trùng lặp';
    }

    res.status(statusCode).json({
        success: false,
        message: message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});