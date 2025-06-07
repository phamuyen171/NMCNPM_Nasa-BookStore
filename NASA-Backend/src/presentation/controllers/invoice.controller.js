const invoiceService = require('../../business/services/invoice.service');

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
            const { page, limit } = req.query;
            const result = await invoiceService.getInvoices(
                parseInt(page) || 1,
                parseInt(limit) || 10
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
    async deleteInvoice(req, res, next) {
        try {
            const { invoiceId } = req.params;
            const deletedInvoice = await invoiceService.softDeleteInvoice(invoiceId);
            res.json({
                success: true,
                message: 'Xóa mềm hóa đơn thành công',
                data: deletedInvoice // Có thể trả về thông tin hóa đơn đã xóa mềm
            });
        } catch (error) {
            next(error); // Chuyển lỗi đến middleware xử lý lỗi tập trung
        }
    }
}

module.exports = new InvoiceController();