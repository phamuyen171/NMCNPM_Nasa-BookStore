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

module.exports = {
    getBookImportStatistics,
    getSalesStatistics,
}; 