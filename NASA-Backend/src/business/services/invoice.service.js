const Invoice = require('../../data/models/invoice.model');
const InvoiceDetail = require('../../data/models/invoiceDetail.model');
const Book = require('../../data/models/book.model');
const Promotion = require('../../data/models/promotion.model');
const customerService = require('./customer.service');
const mongoose = require('mongoose');
const promotionService = require('./promotion.service');
const Customer = require('../../data/models/customer.model');

// const promotionService = new PromotionService();
// const customerService = new CustomerService();

class InvoiceService {
    // Lấy danh sách sách phổ biến
    async getPopularBooks() {
        try {
            // Lấy tất cả sách chưa bị xóa mềm và sắp xếp theo số lượng bán
            const books = await Book.find({ isDeleted: { $ne: true } })
                .sort({ salesCount: -1 }) // Sắp xếp giảm dần theo số lượng bán
                .select('title price salesCount quantity'); // Chỉ lấy các trường cần thiết

            return books.map(book => ({
                id: book._id,
                title: book.title,
                price: book.price,
                salesCount: book.salesCount || 0,
                quantity: book.quantity
            }));
        } catch (error) {
            throw new Error('Không thể lấy danh sách sách phổ biến: ' + error.message);
        }
    }

    // Tạo hóa đơn mới
    async createInvoice(invoiceData) {
        const session = await Invoice.startSession();
        session.startTransaction();

        try {
            const { items, customerPhone, customerIdCard, paymentMethod } = invoiceData;

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
            let discount = 0;
            let appliedPromotion = null;
            let promotionDiscount = 0;

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
                    discount = promotionDiscount;
                }
            }

            const total = subtotal - discount;

            // Xác định trạng thái hóa đơn
            let status = 'paid';
            if (customerType === 'wholesale' && finalPaymentMethod === 'debt') {
                status = 'debt';
            }

            // Tạo hóa đơn mới
            const invoice = new Invoice({
                invoiceID: 'INV-' + Date.now(),
                subtotal: subtotal,
                discount: discount,
                total: total,
                status: status,
                customerPhone: customerPhone || null,
                customerType: customerType,
                points: points,
                paymentMethod: finalPaymentMethod,
                appliedPromotion: appliedPromotion,
                promotionDiscount: promotionDiscount,
                createdBy: 'Nhân viên',
                isDeleted: false
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

            // Cập nhật điểm tích lũy cho khách hàng
            if (customerPhone && points > 0) {
                await customerService.updateCustomerPoints(customerPhone, points, total);
            }

            return {
                success: true,
                data: savedInvoice,
                details: savedDetails,
                points: points,
                promotionDiscount: promotionDiscount
            };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
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
            query.status = status;
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
            // Kiểm tra nếu keyword có định dạng của invoiceID
            if (keyword.startsWith('INV-')) {
                query.invoiceID = keyword; // Tìm kiếm chính xác mã hóa đơn
            } else {
                // Nếu không phải invoiceID, tìm kiếm trong customerPhone
                query.customerPhone = new RegExp(keyword, 'i'); // Tìm kiếm không phân biệt hoa thường
            }
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
        // Tìm hóa đơn bằng ID và kiểm tra chưa bị xóa mềm (hoặc chưa có trường)
        const invoice = await Invoice.findOne({ _id: invoiceId, isDeleted: { $ne: true } });
        if (!invoice) {
            // Thông báo lỗi chung nếu không tìm thấy (bao gồm cả trường hợp đã bị xóa mềm hoặc ID sai)
            throw new Error('Không tìm thấy hóa đơn');
        }

        const details = await InvoiceDetail.find({ invoice: invoiceId });

        // Format thông tin khuyến mãi để hiển thị
        let promotionInfo = null;
        // Cần populate trường appliedPromotion để truy cập thông tin chi tiết
        if (invoice.appliedPromotion) {
            const promotion = await Promotion.findById(invoice.appliedPromotion);
            if (promotion) {
                promotionInfo = {
                    _id: promotion._id,
                    code: promotion.code,
                    name: promotion.name,
                    discountValue: promotion.discountValue
                    // Thêm các trường khác nếu cần
                };
            }
        }

        return { ...invoice.toJSON(), details, promotionInfo }; // Trả về hóa đơn kèm chi tiết và info KM
    }

    // Xóa mềm hóa đơn
    async softDeleteInvoice(invoiceId) {
        try {
            // Kiểm tra hóa đơn có tồn tại và chưa bị xóa
            const invoice = await Invoice.findOne({ _id: invoiceId, isDeleted: false });

            if (!invoice) {
                throw new Error('Không tìm thấy hóa đơn hoặc hóa đơn đã bị xóa');
            }

            // Kiểm tra trạng thái hóa đơn
            if (invoice.status === 'debt') {
                throw new Error('Không thể xóa hóa đơn đang nợ');
            }

            // Nếu hóa đơn đã thanh toán, cho phép xóa
            invoice.isDeleted = true;
            await invoice.save();

            return invoice;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new InvoiceService();