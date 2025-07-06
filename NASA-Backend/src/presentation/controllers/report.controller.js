const reportService = require('../../business/services/report.service');

const getBookImportStatistics = async (req, res, next) => {
    try {
        const filters = req.query;
        const statistics = await reportService.getBookImportStatistics(filters);
        res.status(200).json(statistics);
    } catch (error) {
        next(error);
    }
};

const getSalesStatistics = async (req, res, next) => {
    try {
        const filters = req.query;
        const statistics = await reportService.getSalesStatistics(filters);
        res.status(200).json(statistics);
    } catch (error) {
        next(error);
    }
};

///// biểu đồ 
const getRevenueSummary = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const data = await reportService.getRevenueSummary(from, to);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const getBookStats = async (req, res, next) => {
    try {
        const { type, from, to } = req.query;
        const data = await reportService.getBookStats(type, from, to);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const getCustomerStats = async (req, res, next) => {
    try {
        const { type, from, to } = req.query;
        const data = await reportService.getCustomerStats(type, from, to);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBookImportStatistics,
    getSalesStatistics,
    getRevenueSummary,
    getBookStats,
    getCustomerStats,
}; 