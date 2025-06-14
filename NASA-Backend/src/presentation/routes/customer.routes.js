const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

router.post('/', customerController.createOrGetCustomer);
router.post('/add', customerController.addCustomer);
router.get('/phone/:phone', customerController.findCustomerByPhone);
router.post('/points', customerController.updatePoints);
router.get('/company-info/:companyName', customerController.getCompanyInfoByName);

router.get('/filter-customer/retail', customerController.getRetailCustomer);
router.get('/filter-customer/wholesale', customerController.getWholestailCustomer);
router.put('/reset-points', customerController.resetPoints);

router.post('/check-representative', customerController.checkRepresentative);

module.exports = router;