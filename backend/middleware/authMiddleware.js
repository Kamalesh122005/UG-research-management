const isAuthenticated = (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Please log in' });
    }
};

const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized: Please log in' });
        }

        if (roles.includes(req.session.user.role)) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Insufficient role privileges' });
        }
    };
};

module.exports = {
    isAuthenticated,
    hasRole
};
