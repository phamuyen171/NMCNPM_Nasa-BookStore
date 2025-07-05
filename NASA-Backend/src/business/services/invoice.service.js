const Invoice = require('../../data/models/invoice.model');
const InvoiceDetail = require('../../data/models/invoiceDetail.model');
const Book = require('../../data/models/book.model');
const Promotion = require('../../data/models/promotion.model');
// const customerService = require('./customer.service'); // Removed this line
const mongoose = require('mongoose');
const promotionService = require('./promotion.service');
const Customer = require('../../data/models/customer.model');
const bookService = require('./book.service');

// const promotionService = new PromotionService();
// const customerService = new CustomerService();

class InvoiceService {
    // Lấy danh sách sách phổ biến
    async getPopularBooks() {
        try {
            // Lấy tất cả sách chưa bị xóa mềm và sắp xếp theo số lượng bán
            const books = await Book.find({ isDeleted: { $ne: true } })
                .sort({ soldQuantity: -1 }) // Sắp xếp giảm dần theo số lượng bán
                .select('title author category price salesCount quantity image description'); // Chỉ lấy các trường cần thiết

            return books.map(book => ({
                id: book._id,
                title: book.title,
                price: book.price,
                salesCount: book.soldQuantity || 0,
                quantity: book.quantity
            }));
        } catch (error) {
            throw new Error('Không thể lấy danh sách sách phổ biến: ' + error.message);
        }
    }

    // Tạo hóa đơn mới
    async createInvoice(invoiceData) {
        // const session = await Invoice.startSession(); // Removed transaction start
        // session.startTransaction(); // Removed transaction start

        try {
            const { items, customerPhone, customerIdCard, paymentMethod, pointsToUse = 0, discountPercentage: invoiceDataDiscountPercentage } = invoiceData;

            // Tính tổng số lượng sách
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

            // Xác định loại khách hàng
            let customerType = 'retail';
            let customer = null;

            // Kiểm tra số lượng sách
            if (totalQuantity >= 20) {
                // Nếu mua từ 20 cuốn trở lên, yêu cầu phải có số điện thoại và CCCD
                if (!customerPhone) {
                    throw new Error('Khách hàng mua từ 20 cuốn trở lên phải cung cấp số điện thoại');
                }
                if (!customerIdCard) {
                    throw new Error('Khách hàng mua từ 20 cuốn trở lên phải cung cấp CCCD');
                }
                customerType = 'wholesale';
            }

            // Nếu có số điện thoại, kiểm tra thông tin khách hàng
            if (customerPhone) {
                customer = await Customer.findOne({ phone: customerPhone, isDeleted: false });
                if (!customer) {
                    // Nếu chưa có thông tin khách hàng, tạo mới
                    customer = await Customer.create({
                        phone: customerPhone,
                        name: 'Khách hàng mới',
                        type: totalQuantity >= 20 ? 'wholesale' : 'retail',
                        idCard: customerIdCard
                    });
                    console.log(`[InvoiceService] Created new customer with phone ${customerPhone}`);
                }
                if (customer.type === 'wholesale') {
                    customerType = 'wholesale';
                }
            }

            // Kiểm tra số lượng sách tối thiểu cho khách sỉ
            if (customerType === 'wholesale' && totalQuantity < 20) {
                throw new Error('Khách sỉ phải mua tối thiểu 20 cuốn sách');
            }

            // Kiểm tra phương thức thanh toán
            let finalPaymentMethod = paymentMethod;
            if (customerType === 'retail') {
                // Khách lẻ luôn thanh toán ngay
                finalPaymentMethod = 'cash';
            } else if (customerType === 'wholesale' && paymentMethod === 'debt') {
                // Kiểm tra thông tin khách sỉ
                if (!customer) {
                    throw new Error('Khách sỉ phải có thông tin trong hệ thống để thanh toán công nợ');
                }
                finalPaymentMethod = 'debt';
            }

            // Kiểm tra số lượng sách trong kho
            for (const item of items) {
                const book = await Book.findById(item.bookId);
                if (!book) {
                    throw new Error(`Không tìm thấy sách với ID: ${item.bookId}`);
                }
                if (book.quantity < item.quantity) {
                    throw new Error(`Sách "${book.title}" chỉ còn ${book.quantity} cuốn`);
                }
                // Cập nhật số lượng trong kho và số lượng bán
                book.quantity -= item.quantity;
                book.soldQuantity += item.quantity;
                await book.save();
            }

            // Tính tổng tiền và kiểm tra số lượng sách trong kho
            let subtotal = 0;
            const invoiceDetails = [];

            for (const item of items) {
                const book = await Book.findById(item.bookId);
                if (!book) {
                    throw new Error(`Không tìm thấy sách với ID: ${item.bookId}`);
                }

                if (book.quantity < item.quantity) {
                    throw new Error(`Sách ${book.title} (ID: ${book._id}) chỉ còn ${book.quantity} cuốn trong kho`);
                }

                const pricePerUnit = book.price;
                const itemSubtotal = pricePerUnit * item.quantity;
                subtotal += itemSubtotal;

                invoiceDetails.push({
                    bookId: book._id,
                    bookTitle: book.title,
                    quantity: item.quantity,
                    pricePerUnit: pricePerUnit,
                    subtotal: itemSubtotal
                });
            }

            // Tính điểm tích lũy (1% giá trị hóa đơn)
            const points = customerPhone ? Math.floor(subtotal * 0.01) : 0;

            // Áp dụng khuyến mãi
            let percentageOrPromotionDiscount = 0; // Đổi tên biến discount thành percentageOrPromotionDiscount
            let appliedPromotion = null;
            let promotionDiscount = 0;

            let finalDiscountPercentage = 0; // Khởi tạo với 0

            if (invoiceDataDiscountPercentage !== undefined) {
                finalDiscountPercentage = invoiceDataDiscountPercentage; // Ưu tiên từ dữ liệu hóa đơn nếu có
            }

            // Logic tùy chỉnh chiết khấu dựa trên thông tin khách hàng
            if (customer) {
                if (typeof customer.discountPercentage === 'number' && customer.discountPercentage > 0) {
                    // Ưu tiên 1: Khách hàng (cả lẻ và sỉ) có chiết khấu cụ thể (>0)
                    finalDiscountPercentage = customer.discountPercentage;
                } else if (customer.type === 'wholesale') {
                    // Ưu tiên 2: Khách sỉ, nhưng chiết khấu riêng là 0 hoặc không có -> chiết khấu 0%
                    finalDiscountPercentage = 0;
                } else { // customer.type === 'retail'
                    // Ưu tiên 3: Khách lẻ, và không có chiết khấu riêng (>0), lấy từ invoiceData (hoặc 0 nếu không có)
                    finalDiscountPercentage = invoiceDataDiscountPercentage !== undefined ? invoiceDataDiscountPercentage : 0;
                }
            }

            // Tính toán chiết khấu mặc định dựa trên subtotal và finalDiscountPercentage
            const defaultPercentageDiscount = subtotal * (finalDiscountPercentage / 100);

            // Chỉ áp dụng khuyến mãi nếu có số điện thoại
            if (customerPhone) {
                const applicablePromotions = await promotionService.getApplicablePromotions(
                    customerPhone,
                    subtotal,
                    invoiceDetails
                );

                // Lấy khuyến mãi có giá trị giảm giá cao nhất (nếu có)
                if (applicablePromotions.length > 0) {
                    const bestPromotion = applicablePromotions.reduce((prev, current) =>
                        (current.discountAmount > prev.discountAmount) ? current : prev
                    );

                    appliedPromotion = bestPromotion.promotion._id;
                    promotionDiscount = bestPromotion.discountAmount;
                }
            }

            // Chọn chiết khấu lớn nhất giữa chiết khấu mặc định và chiết khấu từ khuyến mãi
            percentageOrPromotionDiscount = Math.max(defaultPercentageDiscount, promotionDiscount); // Gán vào biến mới

            let totalBeforePointsDiscount = subtotal - percentageOrPromotionDiscount; // Tính tổng tiền trước khi trừ điểm

            // Xác định trạng thái hóa đơn
            let status = 'paid';
            if (customerType === 'wholesale' && finalPaymentMethod === 'debt') {
                status = 'debt';
            }

            let finalTotal = totalBeforePointsDiscount; // Bắt đầu với tổng tiền sau chiết khấu mặc định
            let finalPointsUsed = 0;
            let totalDiscountAmount = percentageOrPromotionDiscount; // Khởi tạo tổng giảm giá với chiết khấu mặc định/khuyến mãi

            // Xử lý logic sử dụng điểm
            if (pointsToUse > 0 && customerPhone) {
                // Tìm lại thông tin khách hàng để lấy điểm hiện tại
                const currentCustomer = await Customer.findOne({ phone: customerPhone, isDeleted: false });
                if (!currentCustomer) {
                    throw new Error('Không tìm thấy khách hàng để sử dụng điểm.');
                }

                const MIN_POINTS_TO_USE = 30; // Ngưỡng điểm tối thiểu để sử dụng
                const POINTS_VALUE = 1; // 1 điểm = 1 VND

                if (currentCustomer.points < MIN_POINTS_TO_USE) {
                    throw new Error(`Khách hàng không đủ ${MIN_POINTS_TO_USE} điểm để sử dụng. Điểm hiện có: ${currentCustomer.points}`);
                }
                if (pointsToUse > currentCustomer.points) {
                    throw new Error(`Số điểm muốn sử dụng (${pointsToUse}) lớn hơn điểm hiện có của khách hàng (${currentCustomer.points}).`);
                }

                const discountFromPoints = pointsToUse * POINTS_VALUE;
                finalTotal = Math.max(0, totalBeforePointsDiscount - discountFromPoints); // Đảm bảo tổng tiền không âm
                finalPointsUsed = pointsToUse;
                totalDiscountAmount += discountFromPoints; // Cộng thêm giảm giá từ điểm vào tổng giảm giá

                // Trừ điểm đã sử dụng khỏi khách hàng
                currentCustomer.points -= finalPointsUsed;
                await currentCustomer.save();
            }

            // Tạo hóa đơn mới
            const invoice = new Invoice({
                invoiceID: 'INV-' + Date.now(),
                subtotal: subtotal,
                totalDiscount: totalDiscountAmount, // Sử dụng totalDiscount mới
                total: finalTotal,
                status: status,
                customerPhone: customerPhone || null,
                customerType: customerType,
                points: points,
                pointsUsed: finalPointsUsed,
                paymentMethod: finalPaymentMethod,
                appliedPromotion: appliedPromotion,
                promotionDiscount: promotionDiscount,
                createdBy: 'Nhân viên',
                isDeleted: false,
                discountPercentage: finalDiscountPercentage,
                // Thêm dueDate và điều chỉnh nếu chỉ cung cấp ngày
                dueDate: invoiceData.dueDate ? (() => {
                    const d = new Date(invoiceData.dueDate);
                    d.setUTCHours(23, 59, 59, 999); // Đặt giờ là cuối ngày UTC
                    return d;
                })() : null
            });

            // Lưu hóa đơn
            const savedInvoice = await invoice.save();
            if (!savedInvoice) {
                throw new Error('Không thể lưu hóa đơn');
            }

            // Tạo chi tiết hóa đơn
            const savedDetails = await InvoiceDetail.insertMany(
                invoiceDetails.map(detail => ({ ...detail, invoice: savedInvoice._id }))
            );
            if (!savedDetails || savedDetails.length !== invoiceDetails.length) {
                await Invoice.findByIdAndDelete(savedInvoice._id);
                throw new Error('Không thể lưu chi tiết hóa đơn');
            }

            // Cập nhật điểm tích lũy và tổng chi tiêu cho khách hàng
            if (customerPhone && points > 0) {
                const existingCustomer = await Customer.findOne({ phone: customerPhone, isDeleted: false });
                if (existingCustomer) {
                    existingCustomer.points += points;
                    existingCustomer.totalSpent += savedInvoice.total;
                    await existingCustomer.save();
                }
            }

            // await session.commitTransaction(); // Removed transaction commit
            // session.endSession(); // Removed session end

            return {
                success: true,
                data: savedInvoice,
                details: savedDetails,
                pointsEarned: points,
                pointsUsed: finalPointsUsed,
                promotionDiscount: promotionDiscount
            };
        } catch (error) {
            // await session.abortTransaction(); // Removed transaction abort
            // session.endSession(); // Removed transaction end
            throw error;
        }
    }

    // Lấy danh sách hóa đơn (chỉ lấy các hóa đơn CHƯA bị xóa mềm HOẶC chưa có trường isDeleted)
    async getInvoices(currentUser, filters) {
        const { page = 1, limit = 10, status, customerPhone, startDate, endDate, keyword, sortBy = 'date', sortOrder = -1 } = filters;
        const skip = (page - 1) * limit;
        console.log(`[InvoiceService] getInvoices called with keyword: '${keyword}'`); // THÊM DÒNG NÀY

        const query = { isDeleted: { $ne: true } }; // Luôn lọc các hóa đơn chưa bị xóa mềm

        // --- Logic lọc ---
        if (status) {
            query.customerType = status;
        }
        if (customerPhone) {
            query.customerPhone = new RegExp(customerPhone, 'i'); // Tìm kiếm không phân biệt hoa thường
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }
        if (keyword) {
            // // Kiểm tra nếu keyword có định dạng của invoiceID
            // if (keyword.startsWith('INV-')) {
            //     query.invoiceID = keyword; // Tìm kiếm chính xác mã hóa đơn
            // } else {
            //     // Nếu không phải invoiceID, tìm kiếm trong customerPhone
            //     query.customerPhone = new RegExp(keyword, 'i'); // Tìm kiếm không phân biệt hoa thường
            // }
            query.invoiceID = keyword; 
        }

        // --- Logic sắp xếp ---
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = parseInt(sortOrder);
        } else {
            sortOptions.date = -1; // Mặc định sắp xếp theo ngày giảm dần
        }

        const invoices = await Invoice.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
            // .select("invoiceID customerType total date createdBy customerPhone companyName status");

        const total = await Invoice.countDocuments(query); // Đếm tổng số hóa đơn khớp query

        return {
            invoices,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Lấy chi tiết hóa đơn (chỉ lấy nếu hóa đơn CHƯA bị xóa mềm HOẶC chưa có trường isDeleted)
    async getInvoiceById(invoiceId) {
        try {
            let invoice = null;
            if (mongoose.Types.ObjectId.isValid(invoiceId)) {
                invoice = await Invoice.findOne({ _id: invoiceId, isDeleted: false })
                    .populate({ path: 'appliedPromotion', select: 'name discountType discountValue' });
            }
            if (!invoice) { // If not found by _id, or if invoiceId was not a valid ObjectId
                invoice = await Invoice.findOne({ invoiceID: invoiceId, isDeleted: false })
                    .populate({ path: 'appliedPromotion', select: 'name discountType discountValue' });
            }

            if (!invoice) {
                throw new Error('Không tìm thấy hóa đơn.');
            }

            const invoiceDetails = await InvoiceDetail.find({ invoice: invoice._id })
                .populate({ path: 'bookId', select: 'title author' });

            const formattedDetails = invoiceDetails.map(detail => ({
                bookId: detail.bookId ? detail.bookId._id : null,
                bookTitle: detail.bookId ? detail.bookId.title : 'N/A',
                author: detail.bookId ? detail.bookId.author : 'N/A',
                quantity: detail.quantity,
                pricePerUnit: detail.pricePerUnit,
                subtotal: detail.subtotal
            }));

            return {
                _id: invoice._id,
                invoiceID: invoice.invoiceID,
                customerPhone: invoice.customerPhone,
                customerType: invoice.customerType,
                subtotal: invoice.subtotal,
                totalDiscount: invoice.totalDiscount,
                total: invoice.total,
                status: invoice.status,
                points: invoice.points,
                pointsUsed: invoice.pointsUsed,
                paymentMethod: invoice.paymentMethod,
                appliedPromotion: invoice.appliedPromotion ? {
                    name: invoice.appliedPromotion.name,
                    discountType: invoice.appliedPromotion.discountType,
                    discountValue: invoice.appliedPromotion.discountValue
                } : null,
                promotionDiscount: invoice.promotionDiscount,
                createdBy: invoice.createdBy,
                createdAt: invoice.createdAt,
                dueDate: invoice.dueDate,
                paidAt: invoice.paidAt,
                companyName: invoice.companyName,
                items: formattedDetails
            };
        } catch (error) {
            console.error('Lỗi khi lấy hóa đơn bằng ID:', error);
            throw new Error('Không thể lấy hóa đơn: ' + error.message);
        }
    }

    // Xóa mềm hóa đơn
    async softDeleteInvoice(invoiceId) {
        try {
            let invoice = null;
            if (mongoose.Types.ObjectId.isValid(invoiceId)) {
                invoice = await Invoice.findOne({ _id: invoiceId, isDeleted: false });
            }
            if (!invoice) { // If not found by _id, or if invoiceId was not a valid ObjectId
                invoice = await Invoice.findOne({ invoiceID: invoiceId, isDeleted: false });
            }

            if (!invoice) {
                throw new Error('Không tìm thấy hóa đơn hoặc hóa đơn đã bị xóa mềm');
            }
            if (invoice.status === 'debt') {
                throw new Error('Không thể xóa hóa đơn có trạng thái công nợ. Vui lòng đánh dấu đã thanh toán trước.');
            }
            invoice.isDeleted = true;
            invoice.deletedAt = new Date();
            await invoice.save();
            return { message: 'Đã xóa mềm hóa đơn thành công.' };
        } catch (error) {
            console.error('Lỗi khi xóa mềm hóa đơn:', error);
            throw new Error('Không thể xóa mềm hóa đơn: ' + error.message);
        }
    }

    // Đánh dấu hóa đơn là đã thanh toán
    async markInvoiceAsPaid(invoiceId) {
        try {
            let invoice = null;

            if (mongoose.Types.ObjectId.isValid(invoiceId)) {
                invoice = await Invoice.findOne({ _id: invoiceId, isDeleted: false });
            }
            if (!invoice) { // If not found by _id, or if invoiceId was not a valid ObjectId
                invoice = await Invoice.findOne({ invoiceID: invoiceId, isDeleted: false });
            }

            if (!invoice) {
                throw new Error('Không tìm thấy hóa đơn.');
            }

            if (invoice.status === 'paid') {
                return { message: 'Hóa đơn đã được đánh dấu là đã thanh toán trước đó.' };
            }

            if (invoice.status !== 'debt') {
                throw new Error('Chỉ có thể đánh dấu hóa đơn công nợ là đã thanh toán.');
            }

            invoice.status = 'paid';
            invoice.paidAt = new Date(); // Thêm thời điểm thanh toán
            await invoice.save();

            // Cập nhật công nợ cho khách hàng
            if (invoice.customerPhone && invoice.customerType === 'wholesale' && invoice.total > 0) {
                const customer = await Customer.findOne({ phone: invoice.customerPhone, isDeleted: false });
                if (customer) {
                    customer.debt = Math.max(0, (customer.debt || 0) - invoice.total);
                    await customer.save();
                }
            }

            return {
                message: 'Hóa đơn đã được đánh dấu là đã thanh toán và công nợ đã được cập nhật.',
                paidAt: invoice.paidAt
            };
        } catch (error) {
            console.error('Lỗi khi đánh dấu hóa đơn là đã thanh toán:', error);
            throw new Error('Không thể đánh dấu hóa đơn là đã thanh toán: ' + error.message);
        }
    }

    // Đánh dấu hóa đơn quá hạn thành nợ xấu
    async markOverdueInvoicesAsBadDebt() {
        try {
            const now = new Date();
            const overdueInvoices = await Invoice.find({
                status: 'debt',
                dueDate: { $ne: null, $lt: now }, // dueDate không null và nhỏ hơn thời điểm hiện tại
                isDeleted: false
            });

            if (overdueInvoices.length === 0) {
                return { message: 'Không có hóa đơn công nợ nào quá hạn.', updatedCount: 0 };
            }

            let updatedCount = 0;
            for (const invoice of overdueInvoices) {
                invoice.status = 'bad_debt';
                await invoice.save();
                updatedCount++;

                // Cập nhật công nợ cho khách hàng (Nếu hóa đơn nợ xấu vẫn tính vào công nợ)
                // Logic này có thể cần xem xét lại tùy theo quy định nợ xấu.
            }

            return { message: `Đã cập nhật ${updatedCount} hóa đơn quá hạn thành nợ xấu.`, updatedCount };
        } catch (error) {
            console.error('Lỗi khi đánh dấu hóa đơn quá hạn thành nợ xấu:', error);
            throw new Error('Không thể đánh dấu hóa đơn quá hạn thành nợ xấu: ' + error.message);
        }
    }

    async addDetailedInvoice(invoiceID, book){
        try{
            const checkInvoiceID = await Invoice.findOne({invoiceID});
            if (!checkInvoiceID){
                throw new Error("Không tìm thấy hóa đơn.");
            }

            const detailedInvoice = {
                "bookId": book.id,
                "bookTitle": book.title,
                "quantity": book.quantity,
                "pricePerUnit": book.price,
                "subtotal": book.total,
                "invoice": checkInvoiceID._id
            };
            // cập nhập số lượng sách trong kho
            bookService.sellBook(book.id, book.quantity);
            // thêm chi tiết hóa đơn
            const detail = new InvoiceDetail(detailedInvoice);
            const save = await detail.save();
            if (!save){
                throw new Error("Không thể thêm chi tiết hóa đơn.");
            }
        } catch (error){
            throw error;
        }
    }

    async countInvoices() {
        try {
            const count = await Invoice.countDocuments({ isDeleted: false });
            return { success: true, count };
        } catch (error) {
            console.error('Lỗi khi đếm hóa đơn:', error);
            throw new Error('Không thể đếm hóa đơn: ' + error.message);
        }
    }
}

module.exports = new InvoiceService();