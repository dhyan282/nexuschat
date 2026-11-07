"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;
        const token = header?.startsWith('Bearer ') ? header.slice(7) : (req.cookies?.accessToken);
        if (!token)
            return res.status(401).json({ message: 'Unauthorized' });
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await User_1.User.findById(payload.userId).select('-password');
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        req.userId = payload.userId;
        req.user = user;
        next();
    }
    catch (e) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ message: 'Forbidden' });
    next();
}
//# sourceMappingURL=auth.js.map