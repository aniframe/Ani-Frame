const jwt_middleware = require('./jwt_middleware');

module.exports = (req, res, next) => {
    if (jwt_middleware(req, res, next)) {
        if (req.userData && req.userData.role == 'admin') {
            next(); // User has admin role, continue to the next middleware or route
        } else {
            return res.status(403).json({ message: 'Forbidden: Admin access required.' });
        }
    }
};