const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load biến môi trường từ .env

// >>> THAY THẾ CÁC GIÁ TRỊ NÀY BẰNG THÔNG TIN CỦA USER TEST TRONG DB <<<
// Lấy _id của user test từ MongoDB Compass
const userIdFromDB = '68388ae547eddefe818a7eb2'; // <-- Ví dụ: Thay bằng ID của user S0001 hoặc M0001/A0001
// Lấy vai trò của user test từ MongoDB Compass ('employee', 'manager', 'accountant')
const userRoleFromDB = 'employee'; // <-- Ví dụ: Thay bằng 'manager' hoặc 'accountant'

// Lấy JWT_SECRET từ file .env
const jwtSecret = process.env.JWT_SECRET;

// Kiểm tra xem JWT_SECRET đã được load chưa
if (!jwtSecret) {
    console.error("Lỗi: Không tìm thấy JWT_SECRET trong file .env!");
    console.error("Vui lòng đảm bảo file .env tồn tại và có dòng JWT_SECRET=your_secret_key");
    process.exit(1);
}

// Tạo token
const token = jwt.sign({ id: userIdFromDB, role: userRoleFromDB }, jwtSecret, {
    expiresIn: '60m' // Thời gian hết hạn của token là 60 phút 
});

console.log(`--- JWT Token cho User ID: ${userIdFromDB} (${userRoleFromDB}) ---`);
console.log(token);
console.log("------------------------------------------------------------------");
console.log("Copy token này và sử dụng trong header Authorization: Bearer <token>");