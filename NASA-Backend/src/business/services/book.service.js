const Book = require('../../data/models/book.model');
const RestockOrder = require('../../data/models/restockOrder.model');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const STOCK_THRESHOLD = 10;
const MIN_RESTOCK_QUANTITY = 5;  // Số lượng tối thiểu cho mỗi lần nhập
const MAX_RESTOCK_QUANTITY = 100; // Số lượng tối đa cho mỗi lần nhập
const DELETE_QUANTITY_THRESHOLD = 10; // số lượng tối đa để xóa sách
const ImportOrder = require('../../data/models/import-order.model');

class BookService {
    // Service: Xử lý logic thêm sách mới vào hệ thống
    async createBook(bookData) {
        try {
            // Xử lý dữ liệu trước khi lưu
            const processBookData = (data) => {
                return {
                    ...data,
                    // Đảm bảo quantity có giá trị mặc định
                    quantity: data.quantity || 0,
                    // Đảm bảo description có giá trị mặc định
                    description: data.description || '',
                    // Đảm bảo status có giá trị mặc định
                    status: data.status || 'Available'
                };
            };

            // Kiểm tra nếu bookData là một mảng (thêm nhiều sách)
            if (Array.isArray(bookData)) {
                // Xử lý từng item trong mảng
                const processedData = bookData.map(processBookData);
                // Sử dụng insertMany để thêm nhiều document cùng lúc
                return await Book.insertMany(processedData);
            } else {
                // Nếu không phải mảng, xử lý một sách
                const processedData = processBookData(bookData);
                const book = new Book(processedData);
                return await book.save();
            }
        } catch (error) {
            // Xử lý lỗi validation hoặc các lỗi khác từ Mongoose
            throw error;
        }
    }

    // Service: Lấy danh sách tất cả sách, hỗ trợ lọc, phân trang, sắp xếp
    async getAllBooks(queryOptions = {}) {
        try {
            const { page = 1, limit = 8, sortBy = 'title', order = 1, category, author, minPrice, maxPrice } = queryOptions;

            // Xây dựng điều kiện lọc
            const filter = { isDeleted: false };
            if (category) {
                // Use regex for partial and case-insensitive match
                filter.category = new RegExp(category, 'i');
            }
            if (author) {
                filter.author = author; // Lọc theo tác giả
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                filter.price = {};
                if (minPrice !== undefined) {
                    filter.price.$gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    filter.price.$lte = maxPrice;
                }
            }

            // Tính toán skip và limit cho phân trang
            const skip = (page - 1) * limit;

            // Lấy tổng số sách phù hợp với điều kiện lọc (không phân trang)
            const totalBooks = await Book.countDocuments(filter);

            // Thực hiện query với lọc, phân trang, và sắp xếp
            const books = await Book.find(filter)
                .select('title author price quantity description category publisher priceImport status image') // Đã sửa coverImage thành image
                .sort({ [sortBy]: order })
                .skip(skip)
                .limit(limit);

            return {
                total: totalBooks,
                page: page,
                limit: limit,
                books: books
            };
        } catch (error) {
            throw error;
        }
    }

    // Service: Lấy thông tin chi tiết của một cuốn sách theo ID
    async getBookById(id) {
        try {
            const book = await Book.findOne({ _id: id, isDeleted: false });
            if (!book) {
                throw new Error('Không tìm thấy sách');
            }
            return book;
        } catch (error) {
            throw error;
        }
    }

    // Service: Cập nhật thông tin của một cuốn sách
    async updateBook(id, updateData) {
        try {
            const book = await Book.findOne({ _id: id, isDeleted: false });

            if (!book) {
                throw new Error('Không tìm thấy sách');
            }

            // Áp dụng các cập nhật từ updateData
            Object.assign(book, updateData);

            // Logic tự động cập nhật status dựa trên quantity nếu quantity được thay đổi VÀ status không được gửi trong updateData
            if (updateData.hasOwnProperty('quantity') && !updateData.hasOwnProperty('status')) {
                if (book.quantity === 0) {
                    book.status = 'Out of Stock';
                } else if (book.quantity > 0 && book.status === 'Out of Stock') {
                    book.status = 'Available';
                } else if (book.quantity > 0 && book.status === 'Discontinued') {
                    // Giữ nguyên trạng thái Discontinued
                } else if (book.quantity > 0 && book.status === 'Available') {
                    // Giữ nguyên trạng thái Available
                }
            }

            await book.save({
                runValidators: true
            });

            return book;
        } catch (error) {
            throw error;
        }
    }

    // Service: Đánh dấu một cuốn sách là đã xóa mềm (đánh dấu isDeleted = true trong DB)
    async deleteBook(id) {
        try {
            // const book = await Book.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, status: 'Discontinued' }, { new: true });
            const book = await Book.findOne({_id: id, isDeleted: false});
            if (!book) {
                throw new Error('Không tìm thấy sách để xóa mềm');
            }
            if (book.quantity >= DELETE_QUANTITY_THRESHOLD){
                throw new Error(`Chỉ xóa sách có số lượng nhỏ hơn <b>${DELETE_QUANTITY_THRESHOLD}</b>.`)
            }
            book.isDeleted = true;
            book.status = 'Discontinued';
            const updateBook = await book.save();

            return updateBook;
        } catch (error) {
            throw error;
        }
    }

    //////// Các hàm liên quan đến Quản lý kho sách ////////

    // Service: Tìm và phân loại sách có số lượng tồn kho thấp hoặc đã hết
    async getLowStockBooks() {
        try {
            const outOfStock = await Book.find({ isDeleted: false, quantity: 0 });
            const lowStock = await Book.find({ isDeleted: false, quantity: { $gt: 0, $lte: STOCK_THRESHOLD } });

            // Thêm trường warningLevel để dễ phân biệt ở frontend
            const formattedOutOfStock = outOfStock.map(book => ({
                ...book.toObject(),
                warningLevel: 'Out of Stock'
            }));

            const formattedLowStock = lowStock.map(book => ({
                ...book.toObject(),
                warningLevel: 'Low Stock'
            }));

            return {
                threshold: STOCK_THRESHOLD,
                outOfStock: formattedOutOfStock,
                lowStock: formattedLowStock,
            };
        } catch (error) {
            throw error;
        }
    }

    // Service: Xử lý việc tạo một phiếu đề xuất nhập thêm sách
    async processRestockOrder(restockData) {
        if (!Array.isArray(restockData) || restockData.length === 0) {
            throw new Error('Dữ liệu nhập sách không hợp lệ');
        }

        // Validate book IDs exist
        const bookIds = restockData.map(item => item.bookId);
        const existingBooks = await Book.find({ _id: { $in: bookIds } });

        if (existingBooks.length !== bookIds.length) {
            // Tìm các ID không tồn tại để báo lỗi cụ thể hơn
            const existingBookIds = existingBooks.map(book => book._id.toString());
            const nonExistingIds = bookIds.filter(id => !existingBookIds.includes(id));
            throw new Error(`Một hoặc nhiều sách không tồn tại với các ID: ${nonExistingIds.join(', ')}`);
        }

        // Validate quantities
        for (const item of restockData) {
            if (item.quantity < MIN_RESTOCK_QUANTITY) {
                throw new Error(`Số lượng nhập cho sách ${item.bookId} phải lớn hơn hoặc bằng ${MIN_RESTOCK_QUANTITY}`);
            }
            if (item.quantity > MAX_RESTOCK_QUANTITY) {
                throw new Error(`Số lượng nhập cho sách ${item.bookId} không được vượt quá ${MAX_RESTOCK_QUANTITY}`);
            }
        }

        // Map bookId thành book để phù hợp với schema
        const orderItems = restockData.map(item => ({
            book: item.bookId,
            quantity: item.quantity
        }));

        // Create restock order
        const restockOrder = new RestockOrder({
            orderItems: orderItems,
            status: 'pending',
        });

        await restockOrder.save();
        return restockOrder;
    }

    // Service: Xác nhận một phiếu nhập kho đang chờ xử lý
    async confirmRestockOrder(orderId) {
        try {

            // Tìm phiếu nhập và cập nhật trạng thái
            const order = await RestockOrder.findById(orderId).populate('orderItems.book'); // Populate để lấy thông tin sách
            if (!order) {
                throw new Error('Không tìm thấy phiếu nhập');
            }

            if (order.status !== 'pending') {
                throw new Error('Phiếu nhập không ở trạng thái chờ xác nhận');
            }

            // Cập nhật trạng thái phiếu nhập
            order.status = 'confirmed';
            order.confirmedAt = new Date();

            // Cập nhật số lượng sách trong kho
            for (const item of order.orderItems) { // Đã sửa order.items thành order.orderItems
                const book = item.book; // Lấy thông tin sách đã populate
                if (!book) {
                    console.error(`[Confirm Restock] Không tìm thấy sách với ID ${item.book} khi cập nhật số lượng.`);
                    continue; // Bỏ qua mục này nếu không tìm thấy sách 
                }
                book.quantity += item.quantity;
                // Cập nhật status nếu cần thiết
                if (book.quantity > 0 && book.status === 'Out of Stock') {
                    book.status = 'Available';
                }
                await book.save();
            }

            // Lưu phiếu nhập đã xác nhận
            await order.save();

            return order;
        } catch (error) {
            throw error;
        }
    }

    // Service: Tạo file PDF cho một phiếu nhập kho đã xác nhận
    async generateRestockPdf(orderId) {
        try {
            const order = await RestockOrder.findById(orderId)
                .populate('orderItems.book', 'title author priceImport') // Populate book info needed for PDF

            if (!order) {
                throw new Error('Không tìm thấy phiếu nhập');
            }
            if (order.status !== 'confirmed') {
                throw new Error('Chỉ có thể tạo PDF cho phiếu nhập đã xác nhận');
            }

            // Tạo PDF
            const doc = new PDFDocument();
            // Ensure the temp directory exists - relative to the project root
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true }); // Use recursive: true for nested dirs
            }
            const pdfPath = path.join(tempDir, `restock_${orderId}.pdf`);

            // Tạo stream để ghi file
            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            // Thêm nội dung vào PDF
            doc.fontSize(20).text('PHIẾU NHẬP KHO', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Mã phiếu: ${order._id}`);
            doc.text(`Ngày tạo: ${order.createdAt.toLocaleDateString('vi-VN')}`);
            doc.moveDown();

            // Tạo bảng danh sách sách
            const tableTop = doc.y; // Start table below previous text
            const itemHeight = 25;

            // Header
            doc.font('Helvetica-Bold')
                .text('STT', 50, tableTop, { width: 50, align: 'left' })
                .text('Tên sách', 100, tableTop, { width: 200, align: 'left' })
                .text('Số lượng', 300, tableTop, { width: 80, align: 'right' })
                .text('Giá nhập (đ)', 380, tableTop, { width: 80, align: 'right' })
                .text('Thành tiền (đ)', 460, tableTop, { width: 80, align: 'right' });

            doc.font('Helvetica');
            let currentY = tableTop + itemHeight;
            let totalAmount = 0;

            for (let i = 0; i < order.orderItems.length; i++) {
                const item = order.orderItems[i];
                // Kiểm tra xem item.book có tồn tại sau populate không
                if (!item.book) {
                    console.error(`[Generate PDF] Không tìm thấy thông tin sách cho item ID ${item._id}`);
                    continue; // Bỏ qua item này nếu thông tin sách bị thiếu
                }
                const thànhTien = item.quantity * (item.book.priceImport || 0);
                totalAmount += thànhTien;

                doc.text((i + 1).toString(), 50, currentY, { width: 50, align: 'left' })
                    .text(item.book.title, 100, currentY, { width: 200, align: 'left' })
                    .text(item.quantity.toString(), 300, currentY, { width: 80, align: 'right' })
                    .text((item.book.priceImport || 0).toLocaleString('vi-VN'), 380, currentY, { width: 80, align: 'right' })
                    .text(thànhTien.toLocaleString('vi-VN'), 460, currentY, { width: 80, align: 'right' });

                currentY += itemHeight;
                // Add a page break if needed
                if (currentY + itemHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    currentY = doc.page.margins.top; // Reset Y to top margin of new page
                    // Re-print headers on new page
                    doc.font('Helvetica-Bold')
                        .text('STT', 50, currentY, { width: 50, align: 'left' })
                        .text('Tên sách', 100, currentY, { width: 200, align: 'left' })
                        .text('Số lượng', 300, currentY, { width: 80, align: 'right' })
                        .text('Giá nhập (đ)', 380, currentY, { width: 80, align: 'right' })
                        .text('Thành tiền (đ)', 460, currentY, { width: 80, align: 'right' });
                    doc.font('Helvetica');
                    currentY += itemHeight;
                }
            }

            // Total
            doc.moveDown();
            doc.font('Helvetica-Bold')
                .text('Tổng cộng:', 380, currentY, { width: 80, align: 'right' })
                .text(totalAmount.toLocaleString('vi-VN'), 460, currentY, { width: 80, align: 'right' });

            // Kết thúc PDF
            doc.end();

            // Trả về đường dẫn file PDF
            return pdfPath;

        } catch (error) {
            throw error;
        }
    }

    // Service: Tìm kiếm sách theo từ khóa (tên, tác giả, thể loại, nhà xuất bản)
    async searchBooks(searchTerm) {
        try {
            if (!searchTerm) {
                return { books: [], total: 0 };
            }

            const searchRegex = new RegExp(searchTerm, 'i'); // 'i' để tìm kiếm không phân biệt hoa thường

            const books = await Book.find({
                isDeleted: false,
                $or: [
                    { title: searchRegex },
                    { author: searchRegex },
                    { category: searchRegex },
                    { publisher: searchRegex }
                ]
            })
                .select('title author price quantity description category publisher priceImport status coverImage')
                .sort({ title: 1 });

            return {
                books: books,
                total: books.length
            };
        } catch (error) {
            throw error;
        }
    }

    // Service: Tăng số lượng tồn kho cho một cuốn sách cụ thể (nhập đơn lẻ)
    async importBookQuantity(bookId, quantity) {
        try {
            const book = await Book.findOne({ _id: bookId, isDeleted: false });
            if (!book) {
                throw new Error('Không tìm thấy sách để nhập thêm');
            }

            if (quantity <= 0) {
                throw new Error('Số lượng nhập thêm phải lớn hơn 0');
            }

            // TODO: Áp dụng BookImportRule nếu cần (min/max quantity)

            book.quantity += quantity;
            // Nếu sách đang hết hàng và được nhập thêm, có thể cập nhật lại status
            if (book.status === 'Out of Stock' && book.quantity > 0) {
                book.status = 'Available';
            }

            return await book.save();
        } catch (error) {
            throw error;
        }
    }

    // Service: Đánh dấu một cuốn sách không còn kinh doanh nữa
    async markBookAsDiscontinued(bookId) {
        try {
            const book = await Book.findOne({ _id: bookId, isDeleted: false });
            if (!book) {
                throw new Error('Không tìm thấy sách để đánh dấu ngừng kinh doanh');
            }

            // Chỉ cập nhật status nếu sách chưa bị đánh dấu là ngừng kinh doanh
            if (book.status !== 'Discontinued') {
                book.status = 'Discontinued';
                return await book.save();
            }
            return book; // Trả về sách mà không lưu nếu đã ngừng kinh doanh
        } catch (error) {
            throw error;
        }
    }

    // Service: Kiểm tra xem một cuốn sách có sẵn để bán không (còn hàng và không ngừng kinh doanh)
    async isBookAvailable(bookId) {
        try {
            const book = await Book.findOne({ _id: bookId, isDeleted: false });
            if (!book) {
                // Sách không tồn tại hoặc đã bị xóa mềm => không available
                return false;
            }

            // Sách available nếu số lượng > 0 và status không phải là 'Discontinued'
            return book.quantity > 0 && book.status !== 'Discontinued';

        } catch (error) {
            // Nếu có lỗi xảy ra khi kiểm tra, coi như không available để an toàn
            console.error(`Error checking book availability for ID ${bookId}:`, error);
            return false;
        }
    }

    // Service: Xóa mềm (đánh dấu đã xóa) nhiều sách cùng lúc theo danh sách ID
    async batchSoftDeleteBooks(bookIds) {
        if (!Array.isArray(bookIds) || bookIds.length === 0) {
            throw new Error('Danh sách ID sách không hợp lệ.');
        }

        const result = await Book.updateMany(
            { _id: { $in: bookIds }, isDeleted: false },
            { $set: { isDeleted: true, status: 'Discontinued' } }
        );

        return result.nModified;
    }

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
                message: `Đã cập nhật số lượng cho ${result.modifiedCount || result.nModified} cuốn sách.`,
                data: result
            });

        } catch (error) {
            // Xử lý lỗi từ service hoặc các lỗi khác
            console.error('=== Error in batchUpdateQuantity controller ===', error); // Log error
            next(error);
        }
    }

    // Service: Cập nhật số lượng cho tất cả sách
    async updateAllQuantity(quantity) {
        try {
            // Đảm bảo quantity là số không âm
            if (typeof quantity !== 'number' || quantity < 0) {
                throw new Error('Số lượng cập nhật không hợp lệ. Phải là số không âm.');
            }

            // Sử dụng updateMany để cập nhật tất cả các document (filter trống {})
            const result = await Book.updateMany({}, { $set: { quantity: quantity } });

            // Cập nhật trạng thái nếu số lượng thay đổi
            // Nếu quantity = 0, tất cả sách sẽ là 'Out of Stock'
            // Nếu quantity > 0, tất cả sách sẽ là 'Available' (trừ những sách đã Discontinued)
            let statusUpdate = {};
            if (quantity === 0) {
                statusUpdate = { status: 'Out of Stock' };
            } else {
                // Chỉ cập nhật status sang 'Available' cho những sách chưa bị đánh dấu Discontinued
                const availableResult = await Book.updateMany(
                    { isDeleted: false, status: { $ne: 'Discontinued' } },
                    {
                        $set: { status: 'Available' }
                    });
                console.log(`Updated status to Available for ${availableResult.modifiedCount} books.`);
            }

            if (Object.keys(statusUpdate).length > 0) {
                const statusResult = await Book.updateMany({}, { $set: statusUpdate });
                console.log(`Updated status to Out of Stock for ${statusResult.modifiedCount} books where quantity is 0.`);
            }

            return result;

        } catch (error) {
            console.error('Error in updateAllQuantity service:', error);
            throw error;
        }
    }

    // Tạo đơn nhập sách mới
    // Thay thế hàm createImportOrder trong book.controller.js:
    async createImportOrder(req, res, next) {
        try {
            // Kiểm tra và chuyển đổi dữ liệu đầu vào thành mảng
            const orders = Array.isArray(req.body) ? req.body : [req.body];

            // Validate dữ liệu đầu vào
            for (const item of orders) {
                if (!item.bookId || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Dữ liệu không hợp lệ. Mỗi item phải có bookId và quantity > 0'
                    });
                }
            }

            // Tạo các đơn nhập
            const results = [];
            for (const item of orders) {
                const importOrder = await bookService.createImportOrderById(item.bookId, item.quantity);
                results.push(importOrder);
            }

            res.status(201).json({
                success: true,
                message: `Đã tạo ${results.length} đơn nhập sách thành công`,
                data: results
            });
        } catch (error) {
            if (error.message.startsWith('Không tìm thấy sách')) {
                res.status(404).json({ success: false, message: error.message });
            } else {
                next(error);
            }
        }
    }

    // Xác nhận đơn nhập sách và cập nhật số lượng
    async confirmImportOrder(orderId) {
        const importOrder = await ImportOrder.findById(orderId);
        if (!importOrder) {
            throw new Error('Không tìm thấy đơn nhập sách');
        }

        if (importOrder.status !== 'pending') {
            throw new Error('Đơn nhập sách không ở trạng thái chờ xác nhận');
        }

        const book = await Book.findById(importOrder.bookId);
        if (!book) {
            throw new Error('Không tìm thấy sách');
        }

        book.quantity += importOrder.quantity;
        await book.save();

        importOrder.status = 'confirmed';
        importOrder.updatedAt = new Date();
        await importOrder.save();

        return {
            book,
            importOrder
        };
    }

    // Lấy danh sách đơn nhập sách
    async getImportOrders() {
        return await ImportOrder.find().sort({ createdAt: -1 });
    }

    // Generate PDF for an import order
    async generateImportOrderPdf(orderId) {

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new Error('ID đơn nhập không hợp lệ');
        }

        // Find the import order by ID
        // TODO: Nếu ImportOrder model được sửa để hỗ trợ nhiều sách, cần populate sách ở đây
        const order = await ImportOrder.findById(orderId);

        if (!order) {
            throw new Error('Không tìm thấy đơn nhập với ID đã cung cấp');
        }

        // Định nghĩa nội dung PDF (document definition)
        // TODO: Cập nhật nếu ImportOrder model hỗ trợ nhiều sách
        const documentDefinition = {
            content: [
                { text: 'PHIẾU NHẬP SÁCH', style: 'header' },
                { text: `Mã đơn nhập: ${order._id}`, style: 'subheader' },
                { text: `Ngày tạo: ${order.createdAt.toLocaleDateString()}`, style: 'subheader' },
                { text: `Trạng thái: ${order.status}`, style: 'subheader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', 100, 50], // Cột Tên sách rộng tự động, ID 100, Số lượng 50
                        body: [
                            [{ text: 'Tên sách', style: 'tableHeader' }, { text: 'ID sách', style: 'tableHeader' }, { text: 'Số lượng', style: 'tableHeader' }],
                            // Dòng dữ liệu sách - TODO: Cập nhật nếu ImportOrder hỗ trợ nhiều sách
                            [order.title, order.bookId.toString(), order.quantity.toString()]
                        ]
                    },
                    layout: 'lightHorizontalLines' // Kiểu bảng có đường kẻ ngang nhẹ
                },
                { text: '\nLưu ý: Phiếu này chỉ ghi nhận yêu cầu nhập, chưa cập nhật vào kho.', style: 'note' }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 20] },
                subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
                tableExample: { margin: [0, 5, 0, 15] },
                tableHeader: { bold: true, fontSize: 12, color: 'black' },
                note: { italics: true, fontSize: 10, margin: [0, 20, 0, 0] }
            },
            defaultStyle: {
                font: 'Roboto' // Có thể cần cấu hình font khác cho tiếng Việt
            }
        };

        // Import pdfMake library và fonts VFS
        const pdfMakePrinter = require('pdfmake/src/printer'); // Sử dụng module printer
        const vfsFonts = require('pdfmake/build/vfs_fonts.js');

        const fontDescriptors = {
            Roboto: {
                normal: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
                bold: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Medium.ttf'], 'base64')
            }

        };

        const printer = new pdfMakePrinter(fontDescriptors);

        // Tạo tài liệu PDF
        const pdfDoc = printer.createPdfKitDocument(documentDefinition);

        // Trả về stream của tài liệu PDF
        return pdfDoc;
    }

    // Tạo đơn nhập sách mới bằng ID sách
    async createImportOrderById(bookId, quantity) {
        const book = await Book.findById(bookId);
        if (!book) {
            throw new Error('Không tìm thấy sách');
        }
        const importOrder = new ImportOrder({
            bookId: book._id,
            title: book.title,
            quantity: quantity
        });
        await importOrder.save();
        return importOrder;
    }
}

// Export instance của BookService để sử dụng ở Controller
module.exports = new BookService();