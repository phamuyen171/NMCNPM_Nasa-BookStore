const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

router.post('/', customerController.createOrGetCustomer);
router.post('/add', customerController.addCustomer);
router.get('/phone/:phone', customerController.findCustomerByPhone);
router.post('/points', customerController.updatePoints);
router.get('/company-info/:companyName', customerController.getCompanyInfoByName);

router.put('/update-customer/:id', customerController.updateCustomer);
router.delete('/delete-customer/:id', customerController.deleteCustomer);

router.get('/filter-customer/retail', customerController.getRetailCustomer);
router.get('/filter-customer/wholesale', customerController.getWholestailCustomer);
router.put('/reset-points', customerController.resetPoints);

router.post('/check-representative', customerController.checkRepresentative);

router.get('/count-customers', customerController.countCustomers);

router.get('/check-exist-taxId/:taxId', customerController.checkExistTaxID);

router.get('/is-bad-debt/:companyName', customerController.isBadDebt);

router.put('/reset-discount/:id', customerController.resetDiscount);

module.exports = router;