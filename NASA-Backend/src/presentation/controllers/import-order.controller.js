const importOrderService = require('../../business/services/import-order.service');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ImportOrder = require('../../data/models/import-order.model');

const importOrderController = {
    // Lấy danh sách sách sắp hết/hết hàng
    async getLowStockBooks(req, res) {
        try {
            const result = await importOrderService.getLowStockBooks();
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    async getOrders(req, res) {
    try {
        const { startDate, endDate } = req.query;
        let filter = {};
        if (startDate && endDate){
            // Chuyển chuỗi thành Date
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Đảm bảo end là cuối ngày (23:59:59)
            end.setHours(23, 59, 59, 999);

            filter["createdAt"] = {
                $gte: start,
                $lte: end
            }
        }

        // Truy vấn hóa đơn
        const orders = await ImportOrder.find(filter);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách hóa đơn nhập sách thành công.",
            data: orders
        });

    } catch (error) {
            res.status(500).json({
            success: false,
            message: error.message
            });
        }
    },


    // Tạo đơn nhập sách mới
    async createImportOrder(req, res) {
        try {
            const { items } = req.body;
            const importOrder = await importOrderService.createImportOrder(items);
            res.json({
                success: true,
                data: importOrder
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xác nhận đơn nhập (trả về đơn nhập và PDF)
    async confirmImportOrder(req, res) {
        try {
            const { orderId } = req.params;
            // Service trả về cả đơn nhập và buffer PDF
            const { importOrder, pdfBuffer } = await importOrderService.confirmImportOrder(orderId);

            // Thiết lập header để trình duyệt hiểu là file PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=import-order-${orderId}.pdf`);

            // Gửi buffer PDF về client
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Error in confirmImportOrder:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi xác nhận đơn nhập và tạo PDF'
            });
        }
    },

    // Xuất PDF đơn nhập (API cũ vẫn giữ lại)
    async exportImportOrderPDF(req, res) {
        try {
            const { orderId } = req.params;
            console.log('Controller: Received request to export PDF for order:', orderId);

            console.log('Controller: Calling service to get order and generate PDF...');
            // Sử dụng hàm generate PDF từ service
            const pdfBuffer = await importOrderService.generateImportOrderPdf({ _id: orderId });
            console.log('Controller: Service returned PDF buffer. Size:', pdfBuffer.length);

            // Gửi buffer PDF về client
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=import-order-${orderId}.pdf`);
            res.send(pdfBuffer);
            console.log('Controller: Sent PDF to client.');

        } catch (error) {
            console.error('Controller: Error in exportImportOrderPDF:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi xuất PDF'
            });
        }
    },

    // Cập nhật số lượng sách sau khi nhận hàng
    async updateBookQuantity(req, res) {
        try {
            const { orderId } = req.params;
            const importOrder = await importOrderService.updateBookQuantity(orderId);
            res.json({
                success: true,
                data: importOrder,
                message: 'Đã cập nhật số lượng sách trong kho'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = importOrderController; 