const mongoose = require('mongoose');
const Promotion = require('../src/data/models/promotion.model');
require('dotenv').config();

async function insertPromotions() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Uyen:uyen1701*@cluster0.vkb76fk.mongodb.net/');
        console.log('Connected to MongoDB');

        // Xóa tất cả khuyến mãi cũ
        await Promotion.deleteMany({});
        console.log('Deleted old promotions');

        // Tạo khuyến mãi giảm 10% cho khách hàng mới
        const newCustomerPromotion = new Promotion({
            code: 'NEW10',
            name: 'Giảm 10% cho khách hàng mới',
            description: 'Áp dụng cho khách hàng mua hàng lần đầu',
            type: 'new_customer',
            discountType: 'percentage',
            discountValue: 10,
            minPurchaseAmount: 0,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true
        });

        await newCustomerPromotion.save();
        console.log('Inserted new customer promotion');

        // Đóng kết nối
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

insertPromotions(); 