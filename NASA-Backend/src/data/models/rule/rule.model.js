const mongoose = require('mongoose');

const bookRuleSchema = require('./bookRule.model');
const pointRuleSchema = require('./pointRule.model');
const debtRuleSchema = require('./debtRule.model')

const ruleSchema = new mongoose.Schema({

    // Dành cho sách
    book: {
        type: bookRuleSchema
    },

    point: {
        type: pointRuleSchema
    },

    debt: {
        type: debtRuleSchema
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Rule', ruleSchema);