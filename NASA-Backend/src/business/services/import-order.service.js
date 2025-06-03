const ImportOrder = require('../models/import-order.model');
const Book = require('../../data/models/book.model');
const PDFDocument = require('pdfkit');
const path = require('path');

function removeVN(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

class ImportOrderService {
    // Lấy danh sách sách sắp hết/hết hàng
    async getLowStockBooks() {
        const LOW_STOCK_THRESHOLD = 50; // Ngưỡng cảnh báo sắp hết hàng

        const books = await Book.find({
            quantity: { $lte: LOW_STOCK_THRESHOLD }
        }).select('title author category description quantity price imageUrl');

        return {
            outOfStock: books.filter(book => book.quantity === 0),
            lowStock: books.filter(book => book.quantity > 0 && book.quantity <= LOW_STOCK_THRESHOLD)
        };
    }

    // Tạo đơn nhập sách mới
    async createImportOrder(items) {
        // Kiểm tra số lượng nhập cho từng sách
        for (const item of items) {
            if (item.quantity < 5 || item.quantity > 1000) {
                throw new Error(`Số lượng nhập cho sách ${item.bookId} phải từ 5 đến 1000`);
            }
        }

        const importOrder = new ImportOrder({ items });
        await importOrder.save();
        return importOrder;
    }

    // Xác nhận đơn nhập (chỉ chuyển trạng thái, không tăng số lượng)
    async confirmImportOrder(orderId) {
        const importOrder = await ImportOrder.findById(orderId);
        if (!importOrder) {
            throw new Error('Không tìm thấy đơn nhập');
        }

        if (importOrder.status === 'confirmed') {
            throw new Error('Đơn nhập đã được xác nhận trước đó');
        }

        // Chỉ cập nhật trạng thái đơn nhập
        importOrder.status = 'confirmed';
        importOrder.confirmedAt = new Date();
        await importOrder.save();

        // Sau khi xác nhận, tạo PDF và trả về cùng với đơn nhập
        const pdfBuffer = await this.generateImportOrderPdf(importOrder);

        return { importOrder, pdfBuffer };
    }

    // Cập nhật số lượng sách sau khi nhận hàng
    async updateBookQuantity(orderId) {
        const importOrder = await ImportOrder.findById(orderId);
        if (!importOrder) {
            throw new Error('Không tìm thấy đơn nhập');
        }

        if (importOrder.status !== 'confirmed') {
            throw new Error('Đơn nhập chưa được xác nhận');
        }

        // Cập nhật số lượng sách trong kho
        for (const item of importOrder.items) {
            await Book.findByIdAndUpdate(item.bookId, {
                $inc: { quantity: item.quantity }
            });
        }

        return importOrder;
    }

    // Lấy thông tin đơn nhập
    async getImportOrder(orderId) {
        console.log('Service: Getting import order by ID:', orderId);
        const importOrder = await ImportOrder.findById(orderId)
            .populate('items.bookId', 'title author price');

        if (!importOrder) {
            console.log('Service: Import order not found:', orderId);
            throw new Error('Không tìm thấy đơn nhập');
        }
        console.log('Service: Found import order:', importOrder._id);
        return importOrder;
    }

    // Hàm helper tạo PDF (logic di chuyển từ controller)
    // async generateImportOrderPdf(importOrder) {
    //     console.log('Service: Generating PDF for order:', importOrder._id);
    //     // Để tạo PDF, cần populate lại thông tin sách
    //     const populatedOrder = await ImportOrder.findById(importOrder._id)
    //         .populate('items.bookId', 'title author price');
    //     console.log('Service: Populated order for PDF:', populatedOrder._id);

    //     return new Promise((resolve, reject) => {
    //         const doc = new PDFDocument();
    //         const buffers = [];

    //         doc.on('data', buffers.push.bind(buffers));
    //         doc.on('end', () => {
    //             console.log('Service: PDFKit end event fired.');
    //             const pdfBuffer = Buffer.concat(buffers);
    //             resolve(pdfBuffer);
    //         });
    //         doc.on('error', (err) => {
    //             console.error('Service: PDFKit error event fired:', err);
    //             reject(err);
    //         });

    //         // Thêm nội dung vào PDF (sử dụng font Courier và bỏ dấu)
    //         doc.font('Courier-Bold').fontSize(20).text('Don Nhap Sach', { align: 'center' });
    //         doc.moveDown();
    //         doc.font('Courier').fontSize(12).text(`Ma don: ${populatedOrder._id}`);
    //         doc.text(`Ngay tao: ${populatedOrder.createdAt.toLocaleDateString()}`);
    //         doc.moveDown();

    //         // Bảng danh sách sách (sử dụng font Courier và bỏ dấu)
    //         let y = doc.y;
    //         doc.font('Courier-Bold').fontSize(12).text('Danh sach sach can nhap:', 50, y);
    //         doc.moveDown();

    //         // Header (sử dụng font Courier và bỏ dấu)
    //         doc.text('Ten sach', 50, doc.y);
    //         doc.text('So luong', 300, doc.y);
    //         doc.text('Gia nhap (d)', 400, doc.y);
    //         doc.text('Thanh tien (d)', 500, doc.y);
    //         doc.moveDown();
    //         doc.font('Courier');

    //         // Chi tiết từng sách
    //         let totalAmount = 0;
    //         const itemHeight = 20; // Approximate height of one item row
    //         let currentY = doc.y;

    //         for (const item of populatedOrder.items) {
    //             const book = item.bookId;
    //             // Kiểm tra nếu book hoặc price bị undefined/null
    //             if (!book || typeof book.price !== 'number') {
    //                 console.error('Service: Book data missing for PDF generation item:', item);
    //                 return reject(new Error(`Thieu thong tin sach (${item.bookId}) de tao PDF.`));
    //             }
    //             const amount = item.quantity * book.price;
    //             totalAmount += amount;

    //             // Add pagination logic
    //             if (currentY + itemHeight > doc.page.height - doc.page.margins.bottom) {
    //                 doc.addPage();
    //                 currentY = doc.page.margins.top; // Reset Y to top margin of new page
    //                 // Re-print headers on new page (using Courier and no diacritics)
    //                 doc.font('Courier-Bold')
    //                     .text('Ten sach', 50, currentY, { width: 200, align: 'left' })
    //                     .text('So luong', 280, currentY, { width: 80, align: 'right' })
    //                     .text('Gia nhap (d)', 370, currentY, { width: 90, align: 'right' })
    //                     .text('Thanh tien (d)', 470, currentY, { width: 100, align: 'right' });
    //                 doc.font('Courier'); // Switch back to regular font
    //                 currentY += itemHeight; // Move Y down after headers
    //             }

    //             // Print item details (using Courier and no diacritics - titles might still have them from DB unless processed)
    //             doc.text(book.title, 50, currentY, { width: 200, align: 'left' }); // Book titles might need separate processing if they have diacritics
    //             doc.text(item.quantity.toString(), 300, currentY, { width: 80, align: 'right' });
    //             doc.text(book.price.toLocaleString('vi-VN') + 'd', 380, currentY, { width: 80, align: 'right' });
    //             doc.text(amount.toLocaleString('vi-VN') + 'd', 460, currentY, { width: 80, align: 'right' });

    //             currentY += itemHeight; // Move Y down for the next item
    //         }

    //         // Tổng tiền (sử dụng font Courier và bỏ dấu)
    //         doc.moveDown();
    //         doc.font('Courier-Bold').text(`Tong tien: ${totalAmount.toLocaleString('vi-VN')}d`, 400, doc.y, { align: 'right' });

    //         // Kết thúc PDF
    //         doc.end();
    //         console.log('Service: PDFKit doc.end() called.');
    //     });
    // }

    
    // Hàm tạo PDF
    async generateImportOrderPdf(importOrder) {
        console.log('Service: Generating PDF for order:', importOrder._id);

        const populatedOrder = await ImportOrder.findById(importOrder._id)
            .populate('items.bookId', 'title author price');
        console.log('Service: Populated order for PDF:', populatedOrder._id);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            // Header
            doc.font('Courier-Bold').fontSize(20).text('Don Nhap Sach', { align: 'center' });
            doc.moveDown();
            doc.font('Courier').fontSize(12);
            doc.text(`Ma don: ${populatedOrder._id}`);
            doc.text(`Ngay tao: ${populatedOrder.createdAt.toLocaleDateString()}`);
            doc.moveDown();

            // Danh sách sách
            doc.font('Courier-Bold').text('Danh sach sach can nhap:');
            doc.moveDown();

            // Cột (tọa độ X)
            const colX = {
                title: 50,
                quantity: 270,
                price: 370,
                amount: 480,
            };
            const rowHeight = 40;
            let y = doc.y;

            // Header bảng
            doc.font('Courier-Bold').fontSize(12);
            doc.text('Ten sach', colX.title, y);
            doc.text('So luong', colX.quantity, y, { width: 80, align: 'right' });
            doc.text('Gia nhap', colX.price, y, { width: 80, align: 'right' });
            doc.text('Thanh tien', colX.amount, y, { width: 80, align: 'right' });

            y += rowHeight;
            doc.font('Courier').fontSize(12);

            let totalAmount = 0;

            for (const item of populatedOrder.items) {
                const book = item.bookId;
                if (!book || typeof book.price !== 'number') {
                    return reject(new Error(`Thieu thong tin sach (${item.bookId}) de tao PDF.`));
                }

                const amount = item.quantity * book.price;
                totalAmount += amount;

                // Nếu hết trang
                if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    y = doc.page.margins.top;

                    // In lại tiêu đề cột trên trang mới
                    doc.font('Courier-Bold').fontSize(12);
                    doc.text('Ten sach', colX.title, y);
                    doc.text('So luong', colX.quantity, y, { width: 80, align: 'right' });
                    doc.text('Gia nhap (d)', colX.price, y, { width: 80, align: 'right' });
                    doc.text('Thanh tien (d)', colX.amount, y, { width: 80, align: 'right' });
                    y += rowHeight;
                    doc.font('Courier').fontSize(12);
                }

                // Nội dung hàng
                doc.text(removeVN(book.title), colX.title, y, { width: 240, align: 'left' });
                doc.text(item.quantity.toString(), colX.quantity, y, { width: 80, align: 'right' });
                doc.text(book.price.toLocaleString('vi-VN') + 'd', colX.price, y, { width: 80, align: 'right' });
                doc.text(amount.toLocaleString('vi-VN') + 'd', colX.amount, y, { width: 80, align: 'right' });

                y += rowHeight;
            }

            doc.moveDown();
            doc.font('Courier-Bold').text(`Tong tien: ${totalAmount.toLocaleString('vi-VN')}d`, colX.amount, y + 10, {
                width: 100,
                align: 'right',
            });

            doc.end();
        });
    }     
}

module.exports = new ImportOrderService(); 