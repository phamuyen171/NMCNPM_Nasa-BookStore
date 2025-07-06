// src/presentation/routes/rule.routes.js
const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/rule.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

router.get('/', ruleController.getRules);

router.post('/', protect, authorize(['manager']), ruleController.createRules);

router.put('/', protect, authorize(['manager']), ruleController.updateRules);

module.exports = router;