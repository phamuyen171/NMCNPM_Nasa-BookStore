// src/presentation/routes/rule.routes.js
const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/rule.controller'); 

router.get('/', ruleController.getRules);

router.post('/', ruleController.createRules);

router.put('/', ruleController.updateRules);

module.exports = router;