const invoiceService = require('../../business/services/invoice.service');
const Invoice = require('../../data/models/invoice.model');
const mongoose = require('mongoose'); // Import mongoose để kiểm tra ObjectId

class InvoiceController {
    // Lấy danh sách sách phổ biến
    async getPopularBooks(req, res, next) {
        try {
            const books = await invoiceService.getPopularBooks();
            res.json({
                success: true,
                data: books
            });
        } catch (error) {
            next(error);
        }
    }

    // Tạo hóa đơn mới
    async createInvoice(req, res, next) {
        try {
            const invoiceData = req.body;
            const newInvoice = await invoiceService.createInvoice(invoiceData);
            res.status(201).json({
                success: true,
                message: 'Tạo hóa đơn thành công',
                data: newInvoice
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy danh sách hóa đơn
    async getInvoices(req, res, next) {
        try {
            const { page, limit, status, customerPhone, startDate, endDate, keyword, sortBy, sortOrder } = req.query;
            const currentUser = req.user;

            const result = await invoiceService.getInvoices(
                currentUser,
                {
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 10,
                    status,
                    customerPhone,
                    startDate,
                    endDate,
                    keyword,
                    sortBy,
                    sortOrder
                }
            );
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy chi tiết hóa đơn
    async getInvoiceById(req, res, next) {
        try {
            const { id } = req.params;
            const invoice = await invoiceService.getInvoiceById(id);
            res.json({
                success: true,
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    }

    // Soft delete hóa đơn
    async deleteInvoice(req, res) {
        try {
            const { id } = req.params;
            let invoice = null;

            // Thử tìm bằng _id trước (nếu là ObjectId hợp lệ)
            if (mongoose.Types.ObjectId.isValid(id)) {
                invoice = await Invoice.findById(id);
            }

            // Nếu không tìm thấy bằng _id hoặc id không phải ObjectId, thử tìm bằng invoiceID
            if (!invoice) {
                invoice = await Invoice.findOne({ invoiceID: id });
            }

            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy hóa đơn'
                });
            }

            // Kiểm tra nếu hóa đơn đang nợ
            if (invoice.status === 'debt') {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa hóa đơn đang còn nợ'
                });
            }

            // Nếu không nợ thì mới cho xóa
            invoice.isDeleted = true;
            await invoice.save();

            return res.status(200).json({
                success: true,
                message: 'Xóa hóa đơn thành công'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // Đánh dấu hóa đơn là đã thanh toán
    async markInvoiceAsPaid(req, res, next) {
        try {
            const { id } = req.params;
            const updatedInvoice = await invoiceService.markInvoiceAsPaid(id);
            res.status(200).json({
                success: true,
                message: 'Đánh dấu hóa đơn đã thanh toán thành công',
                data: updatedInvoice
            });
        } catch (error) {
            next(error);
        }
    }

    // Đánh dấu các hóa đơn quá hạn thành nợ xấu
    async markOverdueInvoicesAsBadDebt(req, res, next) {
        try {
            const result = await invoiceService.markOverdueInvoicesAsBadDebt();
            res.status(200).json({
                success: true,
                message: 'Đã đánh dấu các hóa đơn quá hạn thành nợ xấu thành công',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InvoiceController();