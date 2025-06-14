const ImportOrder = require('../../data/models/import-order.model');
const Book = require('../../data/models/book.model');
const Invoice = require('../../data/models/invoice.model');
const InvoiceDetail = require('../../data/models/invoiceDetail.model');

const getBookImportStatistics = async (filters) => {
    const { day, month, year } = filters;

    const matchStage = {};
    if (year) {
        matchStage['createdAt'] = {
            $gte: new Date(year, (month || 1) - 1, day || 1),
            $lt: new Date(year, month || 12, day ? day + 1 : 1)
        };
        if (month && !day) {
            matchStage['createdAt'].$lt = new Date(year, month, 1);
        }
    }

    try {
        const statistics = await ImportOrder.aggregate([
            { $match: matchStage },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'books', // Tên collection của Book model
                    localField: 'items.bookId',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: '$bookDetails' },
            {
                $project: {
                    _id: 0,
                    'Tên sách': '$bookDetails.title',
                    'Nhà xuất bản': '$bookDetails.publisher',
                    'Ngày nhập': {
                        $dateToString: {
                            format: '%d/%m/%Y',
                            date: '$createdAt'
                        }
                    },
                    'Đơn giá nhập': '$bookDetails.priceImport',
                    'Số lượng nhập': '$items.quantity',
                    'Thành tiền': {
                        $multiply: ['$items.quantity', '$bookDetails.priceImport']
                    }
                }
            }
        ]);

        // tính tổng tiền 
        const totalAmount = statistics.reduce((sum, item) => sum + item['Thành tiền'], 0);

        return { details: statistics, totalAmount };
    } catch (error) {
        console.error('Error fetching book import statistics:', error);
        throw new Error('Could not retrieve book import statistics');
    }
};

const getSalesStatistics = async (filters) => {
    const { day, month, year, searchKeyword, searchField } = filters;

    const matchStage = {};
    if (year) {
        matchStage['date'] = {
            $gte: new Date(year, (month || 1) - 1, day || 1),
            $lt: new Date(year, month || 12, day ? day + 1 : 1)
        };
        if (month && !day) {
            matchStage['date'].$lt = new Date(year, month, 1);
        }
    }

    // theo các trường tìm kiếm 
    if (searchKeyword && searchField) {
        if (searchField === 'invoiceId') {
            matchStage['invoiceID'] = { $regex: searchKeyword, $options: 'i' };
        } else if (searchField === 'staffName') {
            matchStage['createdBy'] = { $regex: searchKeyword, $options: 'i' };
        } else if (searchField === 'customerPhone') {
            matchStage['customerPhone'] = { $regex: searchKeyword, $options: 'i' };
        }
    }

    try {
        const statistics = await Invoice.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'invoicedetails', // collection name for InvoiceDetail model
                    localField: '_id',
                    foreignField: 'invoice',
                    as: 'details'
                }
            },
            { $unwind: '$details' }, // Correct unwind position
            {
                $lookup: {
                    from: 'books', // Collection name for Book model
                    localField: 'details.bookId',
                    foreignField: '_id',
                    as: 'bookInfo'
                }
            },
            { $unwind: '$bookInfo' },
            {
                $project: {
                    _id: 0,
                    'Tên sách': '$bookInfo.title',
                    'Nhà xuất bản': '$bookInfo.publisher',
                    'Tác giả': '$bookInfo.author',
                    'Ngày bán': {
                        $dateToString: {
                            format: '%d/%m/%Y',
                            date: '$date'
                        }
                    },
                    'Đơn giá bán': '$details.pricePerUnit',
                    'Số lượng bán': '$details.quantity',
                    'Thành tiền': '$details.subtotal',
                    'Mã hóa đơn': '$invoiceID',
                    'Nhân viên': '$createdBy',
                    'SĐT Khách hàng': '$customerPhone',
                    'GHI CHÚ': {
                        $cond: {
                            if: { $eq: ['$status', 'paid'] },
                            then: 'Đã thanh toán đủ',
                            else: {
                                $cond: {
                                    if: { $eq: ['$status', 'debt'] },
                                    then: 'Đang chờ thanh toán',
                                    else: {
                                        $cond: {
                                            if: { $eq: ['$status', 'bad_debt'] },
                                            then: 'Thu hồi ghi nợ',
                                            else: ''
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        // tính tổng tiền 
        const totalAmount = statistics.reduce((sum, item) => sum + item['Thành tiền'], 0);

        return { details: statistics, totalAmount };
    } catch (error) {
        console.error('Error fetching sales statistics:', error);
        throw new Error('Could not retrieve sales statistics');
    }
};

module.exports = {
    getBookImportStatistics,
    getSalesStatistics,
}; 