const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

router.post('/', customerController.createOrGetCustomer);
router.post('/add', customerController.addCustomer);
router.get('/phone/:phone', customerController.findCustomerByPhone);
router.post('/points', customerController.updatePoints);

module.exports = router;