module.exports = (req, res, next) => {
    if (req.userData && req.userData.role !== 'admin') {
        next(); // User has a non-admin role, continue to the next middleware or route
    } else {
        return res.status(403).json({ message: 'Forbidden: User access only.' });
    }
};