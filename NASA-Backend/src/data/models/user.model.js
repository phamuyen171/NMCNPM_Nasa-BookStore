const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: [true, 'Mã nhân viên là bắt buộc'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['employee', 'manager', 'admin'],
        default: 'employee'
    },
    name: {
        type: String,
        required: [true, 'Tên nhân viên là bắt buộc']
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

// Middleware tự động set role dựa vào prefix của employeeId
userSchema.pre('save', async function (next) {
    // Nếu đang tạo mới user hoặc employeeId bị thay đổi
    if (this.isNew || this.isModified('employeeId')) {
        const prefix = this.employeeId.charAt(0).toUpperCase();
        switch (prefix) {
            case 'S':
                this.role = 'employee';
                break;
            case 'M':
                this.role = 'manager';
                break;
            case 'A':
                this.role = 'admin';
                break;
            default:
                this.role = 'employee'; // Mặc định là employee nếu prefix không hợp lệ
        }
    }

    // Nếu password bị thay đổi thì hash password
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', userSchema); 