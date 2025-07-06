const jwt = require('jsonwebtoken');
const User = require('../data/models/user.model');

// Middleware xác thực (Authentication Middleware)
exports.protect = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User không tồn tại' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc hết hạn' });
    }
};

// Middleware phân quyền (Authorization Middleware)
exports.authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Người dùng với vai trò ${req.user.role} không được phép truy cập tài nguyên này`
            });
        }
        next();
    };
};