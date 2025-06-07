const Invoice = require('../../data/models/invoice.model');
const InvoiceDetail = require('../../data/models/invoiceDetail.model');
const Book = require('../../data/models/book.model');
const mongoose = require('mongoose');

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
        try {
            const { customerPhone, items, paymentMethod } = invoiceData;

            // Xác định loại khách hàng (dựa trên việc có số điện thoại)
            let customerType = 'retail';
            if (customerPhone) {
                customerType = 'wholesale'; // Giả định: có SĐT là khách sỉ. Cần logic chính xác hơn nếu phân biệt KH sỉ/lẻ bằng cách khác.
            }

            // --- Tạm thời bỏ qua Xử lý thông tin khách hàng và xác định khách hàng mới ---
            // let customer = null;
            // let isNewCustomer = false;
            // if (customerPhone) {
            //     // Tìm khách hàng theo số điện thoại
            //     customer = await customerService.findCustomerByPhone(customerPhone);

            //     if (!customer) {
            //         // Nếu không tìm thấy khách hàng, tạo mới
            //         console.log(`[InvoiceService] Customer with phone ${customerPhone} not found in invoicecustomers. Creating new customer.`);
            //         // Giả định tên khách hàng không có sẵn khi tạo hóa đơn, có thể cần lấy từ frontend hoặc cập nhật sau
            //         customer = await customerService.createCustomer(customerPhone, 'Khách hàng mới', customerType);
            //         isNewCustomer = true;
            //     } else {
            //         // Nếu tìm thấy khách hàng, xác định có phải khách hàng mới dựa trên hóa đơn cũ
            //         const existingInvoicesCount = await Invoice.countDocuments({ customerPhone: customerPhone, isDeleted: { $ne: true } });
            //         isNewCustomer = existingInvoicesCount === 0;
            //         console.log(`[InvoiceService] Customer ${customerPhone} found in invoicecustomers. existingInvoicesCount = ${existingInvoicesCount}, isNewCustomer = ${isNewCustomer}`);
            //     }
            // }
            // --- Kết thúc Xử lý thông tin khách hàng ---

            // Tính tổng tiền và kiểm tra số lượng sách trong kho
            let subtotal = 0;
            const invoiceDetails = [];
            const booksToUpdate = []; // Lưu danh sách sách cần cập nhật

            for (const item of items) {
                // Kiểm tra sách có tồn tại trong kho không bằng ID và chưa bị xóa mềm
                const book = await Book.findById(item.bookId);
                if (!book) {
                    throw new Error(`Không tìm thấy sách với ID: ${item.bookId}`);
                }

                // Kiểm tra số lượng sách trong kho
                if (book.quantity < item.quantity) {
                    throw new Error(`Sách ${book.title} (ID: ${book._id}) chỉ còn ${book.quantity} cuốn trong kho`);
                }

                // Lấy giá từ database (để tránh gian lận từ frontend)
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

                // Lưu sách cần cập nhật
                booksToUpdate.push({
                    book: book,
                    quantity: item.quantity
                });
            }

            // --- Tạm thời bỏ qua Áp dụng khuyến mãi ---
            let discount = 0;
            let appliedPromotion = null;

            // console.log(`[InvoiceService] Finding applicable promotions for subtotal: ${subtotal}`);
            // // Truyền đối tượng customer (hoặc customerPhone và isNewCustomer) vào promotionService
            // const applicablePromotions = await promotionService.findApplicablePromotions(subtotal, invoiceDetails, customerPhone, isNewCustomer);
            // console.log(`[InvoiceService] Found ${applicablePromotions.length} applicable promotions.`);

            // const bestPromotion = await promotionService.selectBestPromotion(applicablePromotions, subtotal, invoiceDetails);
            // console.log(`[InvoiceService] Selected best promotion: ${bestPromotion ? bestPromotion.name : 'None'}`); // Log tên KM

            // if (bestPromotion) {
            //     discount = promotionService.calculateDiscountAmount(subtotal, bestPromotion, invoiceDetails);
            //     console.log(`[InvoiceService] Calculated discount: ${discount}`);
            //     appliedPromotion = bestPromotion._id;

            //     if (bestPromotion.type === 'buy_x_get_y') {
            //         const totalQuantity = invoiceDetails.reduce((sum, item) => sum + item.quantity, 0);
            //         const timesApplicable = Math.floor(totalQuantity / bestPromotion.requiredQuantity);
            //         const totalFreeItems = timesApplicable * bestPromotion.freeQuantity;

            //         const sortedItems = [...invoiceDetails].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
            //         let itemsConsidered = 0;

            //         for (const item of sortedItems) {
            //             const quantityToConsider = Math.min(item.quantity, totalFreeItems - itemsConsidered);
            //             if (quantityToConsider <= 0) break;

            //             item.isPromotionItem = true;
            //             item.promotionQuantity = quantityToConsider;
            //             itemsConsidered += quantityToConsider;

            //             if (itemsConsidered >= totalFreeItems) break;
            //         }
            //     }
            // }

            const total = subtotal - discount;

            // Xác định trạng thái hóa đơn
            let status = 'paid';
            if (customerType === 'wholesale' && paymentMethod === 'debt') {
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
                // customerType: customerType, // Có thể lấy customerType từ customer object nếu có
                customer: null, // Lưu null vì khách hàng chưa được xác định
                createdBy: 'Nhân viên',
                appliedPromotion: appliedPromotion,
                isDeleted: false // Mặc định khi tạo là chưa xóa
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
                // Nếu lưu chi tiết hóa đơn thất bại, xóa hóa đơn
                await Invoice.findByIdAndDelete(savedInvoice._id);
                throw new Error('Không thể lưu chi tiết hóa đơn');
            }

            // Cập nhật số lượng sách trong kho
            for (const { book, quantity } of booksToUpdate) {
                book.quantity -= quantity;
                const updatedBook = await book.save();
                if (!updatedBook) {
                    // Nếu cập nhật số lượng sách thất bại, xóa hóa đơn và chi tiết
                    await InvoiceDetail.deleteMany({ invoice: savedInvoice._id });
                    await Invoice.findByIdAndDelete(savedInvoice._id);
                    throw new Error(`Không thể cập nhật số lượng sách ${book.title}`);
                }
            }

            // --- Tạm thời bỏ qua Cập nhật điểm thưởng cho khách hàng ---
            // Kiểm tra customer object đã được tạo/tìm thấy và loại khách hàng phù hợp để tích điểm
            // if (customer && (customer.type === 'retail' || customer.type === 'wholesale')) {
            //     try {
            //         const pointsEarned = customerService.calculatePointsEarned(savedInvoice.total);
            //         // Truyền customer._id để cập nhật đúng khách hàng
            //         await customerService.updateLoyaltyPoints(customer._id, pointsEarned);
            //         console.log(`Updated loyalty points for customer ${customer.phone}: +${pointsEarned}`);
            //     } catch (loyaltyError) {
            //         console.error('Error updating loyalty points:', loyaltyError);
            //         // Không throw error vì đây không phải lỗi nghiêm trọng
            //     }
            // }

            return { success: true, data: savedInvoice, details: savedDetails };
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách hóa đơn (chỉ lấy các hóa đơn CHƯA bị xóa mềm HOẶC chưa có trường isDeleted)
    async getInvoices(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        // Lọc để lấy các hóa đơn có isDeleted = false HOẶC không có trường isDeleted
        const query = { isDeleted: { $ne: true } };

        const invoices = await Invoice.find(query)
            .sort({ date: -1 })
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
            // Để populate, cần thay đổi findOne ở trên hoặc fetch lại promotion
            // Tạm thời chỉ lấy ID, nếu muốn chi tiết cần fetch thêm
            promotionInfo = { _id: invoice.appliedPromotion }; // Chỉ lấy ID
            // TODO: Implement populating appliedPromotion or fetching promotion details if needed
        }

        return { ...invoice.toJSON(), details, promotionInfo }; // Trả về hóa đơn kèm chi tiết và info KM
    }

    // Soft delete hóa đơn (đánh dấu isDeleted = true)
    async softDeleteInvoice(invoiceId) {
        try {
            // Tìm và cập nhật hóa đơn, đặt isDeleted = true
            const updatedInvoice = await Invoice.findByIdAndUpdate(
                invoiceId,
                { $set: { isDeleted: true } },
                { new: true } // Trả về tài liệu sau khi cập nhật
            );

            if (!updatedInvoice) {
                throw new Error('Không tìm thấy hóa đơn để xóa mềm');
            }

            console.log(`[InvoiceService] Soft deleted invoice with ID: ${invoiceId}`);
            return updatedInvoice; // Trả về hóa đơn đã được đánh dấu xóa

        } catch (error) {
            console.error('Error soft deleting invoice:', error);
            throw new Error('Lỗi khi xóa mềm hóa đơn: ' + error.message);
        }
    }
}

module.exports = new InvoiceService();