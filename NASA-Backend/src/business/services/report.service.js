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



///biểu đồ thống kê doanh thu

// Tổng doanh thu chia theo loại thanh toán
async function getRevenueSummary(from, to) {
    const match = {};
    if (from && to) {
        match.date = { $gte: new Date(from), $lte: new Date(to) };
    }
    const invoices = await Invoice.find(match);

    let immediatePayment = 0, debtRecovery = 0;
    invoices.forEach(inv => {
        if (inv.date && inv.paidAt && inv.date.getTime() === inv.paidAt.getTime()) {
            immediatePayment += inv.total;
        } else {
            debtRecovery += inv.total;
        }
    });
    return { immediatePayment, debtRecovery };
}

// Gom nhóm sách nhập/bán theo mốc thời gian
async function getBookStats(type, from, to) {
    // Tạo mảng label theo type
    const labels = [];
    const now = new Date(to || Date.now());
    let start;
    if (type === 'day') {
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            labels.push(d.toISOString().slice(0, 10));
        }
    } else if (type === 'month') {
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        for (let i = 0; i < 6; i++) {
            const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
            labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
    } else if (type === 'year') {
        const yearNow = now.getFullYear();
        for (let i = 0; i < 5; i++) {
            labels.push(`${yearNow - 4 + i}`);
        }
    }

    // Sách bán ra
    const soldCount = new Array(labels.length).fill(0);
    const importCount = new Array(labels.length).fill(0);

    // Bán ra
    const invoiceMatch = {};
    if (from && to) invoiceMatch.date = { $gte: new Date(from), $lte: new Date(to) };
    const invoices = await Invoice.find(invoiceMatch);
    const invoiceIds = invoices.map(i => i._id);
    const details = await InvoiceDetail.find({ invoice: { $in: invoiceIds } });

    invoices.forEach(inv => {
        let key;
        const date = new Date(inv.date);
        if (type === 'day') key = date.toISOString().slice(0, 10);
        else if (type === 'month') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        else if (type === 'year') key = `${date.getFullYear()}`;
        const idx = labels.indexOf(key);
        if (idx !== -1) {
            const sum = details.filter(d => d.invoice.toString() === inv._id.toString())
                .reduce((a, b) => a + b.quantity, 0);
            soldCount[idx] += sum;
        }
    });

    // Nhập vào
    const importMatch = {};
    if (from && to) importMatch.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    importMatch.status = 'confirmed';
    const importOrders = await ImportOrder.find(importMatch);
    importOrders.forEach(order => {
        let key;
        const date = new Date(order.createdAt);
        if (type === 'day') key = date.toISOString().slice(0, 10);
        else if (type === 'month') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        else if (type === 'year') key = `${date.getFullYear()}`;
        const idx = labels.indexOf(key);
        if (idx !== -1) {
            const sum = order.items.reduce((a, b) => a + b.quantity, 0);
            importCount[idx] += sum;
        }
    });

    return { labels, importCount, soldCount };
}

// Gom nhóm khách hàng theo mốc thời gian
async function getCustomerStats(type, from, to) {
    const labels = [];
    const now = new Date(to || Date.now());
    let start;
    if (type === 'day') {
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            labels.push(d.toISOString().slice(0, 10));
        }
    } else if (type === 'month') {
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        for (let i = 0; i < 6; i++) {
            const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
            labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
    } else if (type === 'year') {
        const yearNow = now.getFullYear();
        for (let i = 0; i < 5; i++) {
            labels.push(`${yearNow - 4 + i}`);
        }
    }

    const retailCount = new Array(labels.length).fill(0);
    const wholesaleCount = new Array(labels.length).fill(0);

    const match = {};
    if (from && to) match.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    const customers = await Customer.find(match);

    customers.forEach(cust => {
        let key;
        const date = new Date(cust.createdAt);
        if (type === 'day') key = date.toISOString().slice(0, 10);
        else if (type === 'month') key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        else if (type === 'year') key = `${date.getFullYear()}`;
        const idx = labels.indexOf(key);
        if (idx !== -1) {
            if (cust.type === 'retail') retailCount[idx]++;
            else if (cust.type === 'wholesale') wholesaleCount[idx]++;
        }
    });

    return { labels, retailCount, wholesaleCount };
}

module.exports = {
    getBookImportStatistics,
    getSalesStatistics,

    getRevenueSummary,
    getBookStats,
    getCustomerStats,
}; 