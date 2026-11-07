"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.refreshTokens = refreshTokens;
exports.logoutUser = logoutUser;
exports.logoutAll = logoutAll;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const jwt_1 = require("../utils/jwt");
async function registerUser(data) {
    const existing = await User_1.User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
    if (existing)
        throw { status: 409, message: 'Email or username already in use' };
    const hashed = await bcryptjs_1.default.hash(data.password, 10);
    const user = await User_1.User.create({
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashed,
        phone: data.phone,
        avatar: data.avatar || '',
    });
    const accessToken = (0, jwt_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id.toString(), role: user.role });
    await RefreshToken_1.RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    return { user: sanitize(user), accessToken, refreshToken };
}
async function loginUser(identifier, password) {
    const user = await User_1.User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user)
        throw { status: 401, message: 'Invalid credentials' };
    const ok = await bcryptjs_1.default.compare(password, user.password);
    if (!ok)
        throw { status: 401, message: 'Invalid credentials' };
    const accessToken = (0, jwt_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id.toString(), role: user.role });
    await RefreshToken_1.RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();
    return { user: sanitize(user), accessToken, refreshToken };
}
async function refreshTokens(token) {
    const payload = (0, jwt_1.verifyRefreshToken)(token);
    const stored = await RefreshToken_1.RefreshToken.findOne({ token, revoked: false });
    if (!stored)
        throw { status: 401, message: 'Invalid refresh token' };
    stored.revoked = true;
    await stored.save();
    const user = await User_1.User.findById(payload.userId);
    if (!user)
        throw { status: 401, message: 'User not found' };
    const accessToken = (0, jwt_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
    const refreshToken = (0, jwt_1.signRefreshToken)({ userId: user._id.toString(), role: user.role });
    await RefreshToken_1.RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    return { accessToken, refreshToken };
}
async function logoutUser(token) {
    if (token)
        await RefreshToken_1.RefreshToken.updateOne({ token }, { revoked: true });
}
async function logoutAll(userId) {
    await RefreshToken_1.RefreshToken.updateMany({ user: userId }, { revoked: true });
    await User_1.User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
}
async function forgotPassword(email) {
    const user = await User_1.User.findOne({ email });
    if (!user)
        return; // don't reveal
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    user.resetToken = token;
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    // In production, email the link. Log for dev.
    console.log(`Password reset link: ${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${email}`);
    return token;
}
async function resetPassword(email, token, newPassword) {
    const user = await User_1.User.findOne({ email, resetToken: token, resetExpires: { $gt: new Date() } });
    if (!user)
        throw { status: 400, message: 'Invalid or expired reset token' };
    user.password = await (await Promise.resolve().then(() => __importStar(require('bcryptjs')))).default.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
}
function sanitize(u) {
    const o = u.toObject ? u.toObject() : u;
    delete o.password;
    return o;
}
//# sourceMappingURL=auth.service.js.map