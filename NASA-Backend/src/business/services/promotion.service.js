const Promotion = require('../../data/models/promotion.model');
const Invoice = require('../../data/models/invoice.model');

class PromotionService {
    // Lấy khuyến mãi áp dụng cho hóa đơn
    async getApplicablePromotions(customerPhone, subtotal, items) {
        try {
            console.log(`[PromotionService] Checking promotions for customer ${customerPhone}`);

            // Lấy ngày hiện tại
            const now = new Date();

            // Tìm các khuyến mãi đang hoạt động
            const activePromotions = await Promotion.find({
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
            });

            console.log(`[PromotionService] Found ${activePromotions.length} active promotions`);

            const applicablePromotions = [];

            for (const promotion of activePromotions) {
                let discountAmount = 0;

                // Kiểm tra khuyến mãi khách hàng mới
                if (promotion.type === 'new_customer') {
                    // Kiểm tra xem khách hàng đã có hóa đơn nào chưa
                    const existingInvoices = await Invoice.countDocuments({
                        customerPhone: customerPhone,
                        isDeleted: false
                    });

                    console.log(`[PromotionService] Customer ${customerPhone} has ${existingInvoices} existing invoices`);

                    // Nếu là khách hàng mới (chưa có hóa đơn nào)
                    if (existingInvoices === 0) {
                        // Tính giảm giá theo phần trăm
                        if (promotion.discountType === 'percentage') {
                            discountAmount = Math.floor((subtotal * promotion.discountValue) / 100);
                            console.log(`[PromotionService] Calculating discount: ${subtotal} * ${promotion.discountValue}% = ${discountAmount}`);
                        }
                        console.log(`[PromotionService] New customer promotion applied: ${discountAmount}`);
                    }
                }

                // Nếu có giảm giá, thêm vào danh sách khuyến mãi áp dụng được
                if (discountAmount > 0) {
                    applicablePromotions.push({
                        promotion: promotion,
                        discountAmount: discountAmount
                    });
                }
            }

            console.log(`[PromotionService] Found ${applicablePromotions.length} applicable promotions`);
            return applicablePromotions;
        } catch (error) {
            console.error('[PromotionService] Error:', error);
            throw error;
        }
    }

    // Tạo khuyến mãi mới
    async createPromotion(promotionData) {
        try {
            const promotion = new Promotion(promotionData);
            return await promotion.save();
        } catch (error) {
            console.error('[PromotionService] Error creating promotion:', error);
            throw error;
        }
    }
}

module.exports = new PromotionService(); 