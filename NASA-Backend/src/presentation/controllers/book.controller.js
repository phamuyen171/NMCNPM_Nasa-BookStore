const bookService = require('../../business/services/book.service');
const mongoose = require('mongoose');
const { STOCK_THRESHOLD } = require('../../business/services/book.service');
const path = require('path');

const bookController = {
    // Thêm sách mới
    async createBook(req, res, next) {
        try {
            const bookData = req.body; // Lấy dữ liệu từ body, có thể là 1 object hoặc 1 array
            const result = await bookService.createBook(bookData);

            if (Array.isArray(bookData)) {
                // Nếu là thêm nhiều sách
                res.status(201).json({
                    success: true,
                    message: `Đã thêm thành công ${result.length} cuốn sách.`, // Thông báo số lượng sách đã thêm
                    data: result // Trả về danh sách sách đã thêm
                });
            } else {
                // Nếu là thêm 1 sách
                res.status(201).json({
                    success: true,
                    message: 'Thêm sách thành công',
                    data: result
                });
            }
        } catch (error) {
            if (error.name === 'ValidationError') {
                // Lỗi validation có thể xảy ra cho từng sách trong mảng
                res.status(400).json({
                    success: false,
                    message: 'Lỗi validation khi thêm sách',
                    errors: error.errors // Mongoose ValidationError có trường errors chi tiết
                });
            } else {
                next(error);
            }
        }
    },

    // Lấy danh sách sách
    async getAllBooks(req, res, next) {
        try {
            const queryOptions = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 8,
                sortBy: req.query.sortBy || 'title',
                order: parseInt(req.query.order) || 1,
                category: req.query.category,
                author: req.query.author,
                minPrice: parseFloat(req.query.minPrice),
                maxPrice: parseFloat(req.query.maxPrice),
            };

            Object.keys(queryOptions).forEach(key => {
                if (queryOptions[key] === undefined || (typeof queryOptions[key] === 'number' && isNaN(queryOptions[key]))) {
                    delete queryOptions[key];
                }
            });

            const result = await bookService.getAllBooks(queryOptions);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // Lấy thông tin một cuốn sách
    async getBookById(req, res, next) {
        try {
            const book = await bookService.getBookById(req.params.id);
            res.status(200).json({
                success: true,
                data: book
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error instanceof mongoose.Error.CastError) {
                res.status(400).json({ success: false, message: 'ID sách không hợp lệ' });
            } else {
                next(error);
            }
        }
    },

    // Cập nhật thông tin sách
    async updateBook(req, res, next) {
        try {
            const book = await bookService.updateBook(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Cập nhật sách thành công',
                data: book
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof mongoose.Error.CastError) {
                res.status(400).json({
                    success: false,
                    message: 'ID sách không hợp lệ'
                });
            } else if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    },

    // Xóa sách
    async deleteBook(req, res, next) {
        try {
            await bookService.deleteBook(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Xóa sách thành công'
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error instanceof mongoose.Error.CastError) {
                res.status(400).json({
                    success: false,
                    message: 'ID sách không hợp lệ'
                });
            } else {
                next(error);
            }
        }
    },

    // Lấy danh sách sách sắp hết/đã hết
    async getLowStockBooks(req, res, next) {
        try {
            const { outOfStock, lowStock } = await bookService.getLowStockBooks();
            res.status(200).json({
                success: true,
                data: {
                    threshold: STOCK_THRESHOLD,
                    outOfStock,
                    lowStock
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Xử lý phiếu nhập thêm sách
    async processRestockOrder(req, res, next) {
        try {
            console.log('Received restock data:', req.body);
            const restockData = req.body.items;
            const userCreatingOrder = { _id: new mongoose.Types.ObjectId() };
            const restockOrder = await bookService.processRestockOrder(restockData, userCreatingOrder);
            res.status(200).json({
                success: true,
                message: 'Phiếu nhập kho đã được tạo thành công',
                data: restockOrder
            });
        } catch (error) {
            if (error.message.startsWith('Dữ liệu nhập sách không hợp lệ') ||
                error.message.startsWith('Một hoặc nhiều sách không tồn tại') ||
                error.message.startsWith('Số lượng nhập cho sách')) {
                res.status(400).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    },

    // Tìm kiếm sách
    async searchBooks(req, res, next) {
        try {
            const { searchTerm } = req.query;
            const result = await bookService.searchBooks(searchTerm);
            if (result.total === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Không tìm thấy kết quả phù hợp',
                    data: { books: [], total: 0 }
                });
            }
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // Tăng số lượng sách
    async importBookQuantity(req, res, next) {
        try {
            const book = await bookService.importBookQuantity(req.params.id, req.body.quantity);
            res.status(200).json({
                success: true,
                message: 'Nhập thêm sách thành công',
                data: book
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error instanceof mongoose.Error.CastError) {
                res.status(400).json({ success: false, message: 'ID sách không hợp lệ' });
            } else {
                next(error);
            }
        }
    },

    // Đánh dấu sách ngừng kinh doanh
    async markBookAsDiscontinued(req, res, next) {
        try {
            const book = await bookService.markBookAsDiscontinued(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Đã đánh dấu sách ngừng kinh doanh',
                data: book
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error instanceof mongoose.Error.CastError) {
                res.status(400).json({ success: false, message: 'ID sách không hợp lệ' });
            } else {
                next(error);
            }
        }
    },

    // Kiểm tra sách có còn hàng không
    async isBookAvailable(req, res, next) {
        try {
            const isAvailable = await bookService.isBookAvailable(req.params.id);
            res.status(200).json({
                success: true,
                data: { isAvailable }
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error instanceof mongoose.Error.CastError) {
                res.status(400).json({ success: false, message: 'ID sách không hợp lệ' });
            } else {
                next(error);
            }
        }
    },

    // Xác nhận phiếu nhập kho
    async confirmRestockOrder(req, res, next) {
        try {
            const order = await bookService.confirmRestockOrder(req.params.orderId);
            res.status(200).json({
                success: true,
                message: 'Phiếu nhập kho đã được xác nhận',
                data: order
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy phiếu nhập kho')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error.message.startsWith('Phiếu nhập kho đã được xác nhận')) {
                res.status(400).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    },

    // Tạo PDF phiếu nhập
    async generateRestockPdf(req, res, next) {
        try {
            const pdfBuffer = await bookService.generateRestockPdf(req.params.orderId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=restock-order-${req.params.orderId}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy phiếu nhập kho')) {
                res.status(404).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    },

    // Controller: Xóa mềm nhiều sách
    async batchSoftDeleteBooks(req, res, next) {
        try {
            const bookIds = req.body.bookIds;
            if (!Array.isArray(bookIds) || bookIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu xóa hàng loạt không hợp lệ: phải là một mảng ID không rỗng.'
                });
            }
            const result = await bookService.batchSoftDeleteBooks(bookIds);
            res.status(200).json({
                success: true,
                message: `Đã xóa mềm thành công ${result} cuốn sách.`, // result là số lượng sách đã sửa đổi
                data: { modifiedCount: result } // Trả về số lượng sách đã sửa đổi
            });
        } catch (error) {
            next(error);
        }
    },

    // Controller: Cập nhật số lượng cho nhiều sách cùng lúc
    async batchUpdateQuantity(req, res, next) {
        try {
            console.log('=== Batch Update Quantity Request ==='); // Log start
            console.log('Received req.body type:', typeof req.body); // Log body type
            console.log('Received req.body:', JSON.stringify(req.body, null, 2)); // Log full body

            const updates = req.body; // Request body dự kiến là một mảng [{ bookId: '...', quantity: ... }, ...]

            // Kiểm tra dữ liệu đầu vào cơ bản
            if (!Array.isArray(updates) || updates.length === 0) {
                console.log('Validation failed: Body is not an array or is empty.'); // Log validation failure
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu cập nhật không hợp lệ: phải là một mảng không rỗng.'
                });
            }

            // Kiểm tra từng phần tử trong mảng
            for (const update of updates) {
                console.log('Validating update item:', JSON.stringify(update, null, 2)); // Log each item

                if (!update.bookId) {
                    console.log(`Validation failed: bookId is missing in item ${JSON.stringify(update)}.`); // Log validation failure
                    return res.status(400).json({
                        success: false,
                        message: `ID sách không hợp lệ: ${update.bookId}. ID phải là một chuỗi ObjectId hợp lệ.`
                    });
                }

                if (!mongoose.Types.ObjectId.isValid(update.bookId)) {
                    console.log(`Validation failed: Invalid ObjectId format for ID ${update.bookId}.`); // Log validation failure
                    return res.status(400).json({
                        success: false,
                        message: `ID sách không hợp lệ: ${update.bookId}. ID phải là một chuỗi ObjectId hợp lệ.`
                    });
                }

                if (typeof update.quantity !== 'number' || update.quantity < 0) {
                    console.log(`Validation failed: Invalid quantity ${update.quantity} for bookId ${update.bookId}.`); // Log validation failure
                    return res.status(400).json({
                        success: false,
                        message: `Số lượng không hợp lệ cho sách ID ${update.bookId}: ${update.quantity}. Số lượng phải là số >= 0.`
                    });
                }
                console.log(`Validation passed for item with bookId ${update.bookId}.`); // Log validation success
            }

            console.log('All items validated. Calling service...'); // Log before service call
            const result = await bookService.batchUpdateQuantity(updates);

            console.log('Service call successful. Result:', JSON.stringify(result, null, 2)); // Log service result

            res.status(200).json({
                success: true,
                message: `Đã cập nhật số lượng cho ${result.modifiedCount || result.nModified} cuốn sách.`, // Sử dụng modifiedCount cho Mongoose 6+, nModified cho cũ hơn
                data: result
            });

        } catch (error) {
            // Xử lý lỗi từ service hoặc các lỗi khác
            console.error('=== Error in batchUpdateQuantity controller ===', error); // Log error
            next(error);
        }
    },

    // Controller: Cập nhật số lượng cho tất cả sách
    async updateAllBooksQuantity(req, res, next) {
        try {
            const { quantity } = req.body; // Lấy số lượng từ body request

            // Kiểm tra tính hợp lệ của số lượng
            if (typeof quantity !== 'number' || quantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng cập nhật không hợp lệ. Phải là số không âm.'
                });
            }

            // Gọi service để cập nhật số lượng cho tất cả sách
            const result = await bookService.updateAllQuantity(quantity);

            res.status(200).json({
                success: true,
                message: `Đã cập nhật số lượng cho ${result.modifiedCount} cuốn sách.`, // modifiedCount từ bulkWrite result
                data: result
            });

        } catch (error) {
            console.error('Error in updateAllBooksQuantity controller:', error);
            next(error); // Chuyển lỗi cho middleware xử lý lỗi chung
        }
    },

    // Tạo đơn nhập sách (bước 1: chỉ ghi nhận, chưa tăng kho)
    async createImportOrder(req, res, next) {
        try {
            const { bookId, quantity } = req.body;
            if (!bookId || typeof quantity !== 'number' || quantity <= 0) {
                return res.status(400).json({ success: false, message: 'Thiếu hoặc sai dữ liệu bookId/quantity' });
            }
            const importOrder = await bookService.createImportOrderById(bookId, quantity);
            res.status(201).json({
                success: true,
                message: 'Đã tạo đơn nhập sách thành công',
                data: importOrder
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    },

    // Xác nhận đơn nhập sách (bước 2: tăng kho)
    async confirmImportOrder(req, res, next) {
        try {
            const { orderId } = req.params;
            const result = await bookService.confirmImportOrder(orderId);
            res.status(200).json({
                success: true,
                message: 'Xác nhận đơn nhập sách thành công',
                data: result
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy')) {
                res.status(404).json({ success: false, message: error.message });
            } else if (error.message.includes('trạng thái')) {
                res.status(400).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    },

    // Lấy danh sách đơn nhập sách
    async getImportOrders(req, res, next) {
        try {
            const importOrders = await bookService.getImportOrders();
            res.status(200).json({
                success: true,
                data: importOrders
            });
        } catch (error) {
            next(error);
        }
    },


    // Generate PDF for an import order
    async generateImportOrderPdf(req, res, next) {
        try {
            const orderId = req.params.orderId;

            // Get PDF document stream from service
            const pdfDoc = await bookService.generateImportOrderPdf(orderId);

            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=phieu_nhap_sach_${orderId}.pdf`);

            // Pipe PDF document stream to response
            pdfDoc.pipe(res);
            pdfDoc.end();

        } catch (error) {
            if (error.message.startsWith('ID đơn nhập không hợp lệ') || error.message.startsWith('Không tìm thấy đơn nhập')) {
                res.status(400).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    }

};

module.exports = bookController;