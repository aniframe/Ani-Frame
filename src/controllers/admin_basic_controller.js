const user_model = require('../models/user_model');

module.exports = class AdminBasicController {
    async get_all_user(req, res) {
        try {
            const users = await user_model.find({ role: { $ne: 'admin' } }).select('-cart -orders -addresses -role -password -__v');
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async get_user_by_id(req, res) {
        try {
            const userId = req.query.userId;
            const user = await user_model.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }
}