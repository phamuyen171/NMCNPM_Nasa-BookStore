// const staffService = require('../../business/services/staff.service');
// const authService = require('../../business/services/auth.service');

const Rule = require('../../data/models/rule/rule.model');
const { findOne } = require('../../data/models/staff.model');

class ruleController {
  async createRules(req, res){
    try{
        const rules = new Rule({ book: {}, point: {}, debt: {}});
        await rules.save();
        return res.status(200).json({success: true, message: "Tạo quy định thành công."});
    } catch (error){
        return res.status(500).json({ success: false, message: error.message});
    }
  }

  async getRules(req, res){
    try{
        const rules = await Rule.find();
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách quy định thành công",
            data: rules
        });
    }
    catch (error){
        return res.status(500).json({ success: false, message: error.message });
    }
  }
  async updateRules(req, res){
    try{
        const rules = await Rule.findOne();
        if (!rules) return res.status(404).json({success: false, message: "Không tìm thấy quy định."});
        for (const groupKey of ['book', 'point', 'debt']){
            if(req.body[groupKey]){
                if (!rules[groupKey]) rules[groupKey] = {};

                for (const field in req.body[groupKey]){
                    rules[groupKey][field] = req.body[groupKey][field];
                }
            }
        }
        await rules.save();
        res.status(200).json({ success: true, message: "Cập nhập quy định thành công.", data: rules});

    } catch (error){
        if (error.name === "ValidationError"){
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
            success: false,
            message: messages.join('; ')
            });
        }
        res.status(500).json({success: false, message: error.message});
    }
  }
}


module.exports = new ruleController();