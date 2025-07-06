// const express = require('express');
// const router = express.Router();
// const customerController = require('../controllers/customer.controller');
// const { protect, authorize } = require('../../middlewares/auth.middleware');

// router.post('/', customerController.createOrGetCustomer);
// router.post('/add', customerController.addCustomer);
// router.get('/phone/:phone', customerController.findCustomerByPhone);
// router.post('/points', customerController.updatePoints);
// router.get('/company-info/:companyName', customerController.getCompanyInfoByName);

// router.put('/phone/:phone', customerController.updateCustomer);
// router.delete('/phone/:phone', customerController.deleteCustomer);

// router.get('/filter-customer/retail', customerController.getRetailCustomer);
// router.get('/filter-customer/wholesale', customerController.getWholestailCustomer);
// router.put('/reset-points', customerController.resetPoints);

// router.post('/check-representative', customerController.checkRepresentative);

// router.get('/count-customers', customerController.countCustomers);

// router.get('/check-exist-taxId/:taxId', customerController.checkExistTaxID);

// module.exports = router;


const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Tạo, thêm, sửa, xóa khách hàng: manager, staff
router.post('/', protect, authorize(['manager', 'staff']), customerController.createOrGetCustomer);
router.post('/add', protect, authorize(['manager', 'staff']), customerController.addCustomer);
router.put('/phone/:phone', protect, authorize(['manager', 'staff']), customerController.updateCustomer);
router.delete('/phone/:phone', protect, authorize(['manager', 'staff']), customerController.deleteCustomer);

// Xem thông tin: mọi vai trò
router.get('/phone/:phone', protect, authorize(['manager', 'accountant', 'staff']), customerController.findCustomerByPhone);
router.get('/company-info/:companyName', protect, authorize(['manager', 'accountant', 'staff']), customerController.getCompanyInfoByName);
router.get('/filter-customer/retail', protect, authorize(['manager', 'accountant', 'staff']), customerController.getRetailCustomer);
router.get('/filter-customer/wholesale', protect, authorize(['manager', 'accountant', 'staff']), customerController.getWholestailCustomer);
router.get('/count-customers', protect, authorize(['manager', 'accountant', 'staff']), customerController.countCustomers);
router.get('/check-exist-taxId/:taxId', protect, authorize(['manager', 'accountant', 'staff']), customerController.checkExistTaxID);

// Điểm thưởng, reset điểm, check đại diện: manager, staff
router.post('/points', protect, authorize(['manager', 'staff']), customerController.updatePoints);
router.put('/reset-points', protect, authorize(['manager', 'staff']), customerController.resetPoints);
router.post('/check-representative', protect, authorize(['manager', 'staff']), customerController.checkRepresentative);

module.exports = router;