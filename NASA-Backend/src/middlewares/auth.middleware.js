// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../data/models/user.model'); // Import User model

// Middleware để bảo vệ route (kiểm tra token và xác thực người dùng)
exports.protect = async (req, res, next) => {
    let token;

    // Kiểm tra xem token có ở trong headers hoặc cookies không (thường là Authorization Bearer)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]; // Lấy token từ "Bearer TOKEN"
    }
    // Nếu muốn hỗ trợ token trong cookie, có thể thêm:
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Kiểm tra nếu không có token
    if (!token) {
        return res.status(401).json({ // 401: Unauthorized
            success: false,
            message: 'Không được phép truy cập route này (chưa đăng nhập)'
        });
    }

    try {
        // Xác minh token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[Auth: Protect] Token decoded:', decoded);

        // Tìm người dùng dựa trên ID trong token, loại trừ trường password
        req.user = await User.findById(decoded.id).select('-password'); // Gắn user vào object request

        if (!req.user) {
            console.log('[Auth: Protect] User not found for ID:', decoded.id);
            return res.status(401).json({ // Token hợp lệ nhưng không tìm thấy user trong DB
                success: false,
                message: 'Người dùng không còn tồn tại'
            });
        }

        req.userRole = req.user.role; // Gắn vai trò LẤY TỪ DB vào object request
        console.log('[Auth: Protect] User authenticated. Role from DB:', req.userRole);

        next(); // Cho phép request đi tiếp
    } catch (err) {
        console.error("Error verifying token:", err.message);
        return res.status(401).json({ // Token không hợp lệ (hết hạn, sai định dạng, v.v.)
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại'
        });
    }
};

// Middleware để kiểm tra phân quyền dựa trên vai trò
exports.authorize = (...roles) => { // Nhận danh sách các vai trò được phép
    return (req, res, next) => {
        console.log('[Auth: Authorize] Checking role for route.');
        console.log('[Auth: Authorize] User Role:', req.userRole);
        console.log('[Auth: Authorize] Allowed Roles:', roles);

        // req.userRole được set từ middleware protect
        if (!roles.includes(req.userRole)) {
            console.log('[Auth: Authorize] Role NOT allowed. Denying access.');
            return res.status(403).json({ // 403: Forbidden
                success: false,
                message: `Vai trò '${req.userRole}' không được phép truy cập route này`
            });
        }
        console.log('[Auth: Authorize] Role allowed. Proceeding.');
        next(); // Cho phép request đi tiếp
    };
};