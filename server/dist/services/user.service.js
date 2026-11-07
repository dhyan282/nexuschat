"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
exports.updateMe = updateMe;
exports.searchUsers = searchUsers;
exports.getUser = getUser;
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
exports.getBlocked = getBlocked;
const User_1 = require("../models/User");
async function getMe(userId) { return User_1.User.findById(userId).select('-password'); }
async function updateMe(userId, data) {
    const allowed = ['name', 'bio', 'phone', 'avatar', 'status'];
    const update = {};
    for (const k of allowed)
        if (data[k] !== undefined)
            update[k] = data[k];
    return User_1.User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
}
async function searchUsers(q, currentUserId) {
    if (!q)
        return [];
    return User_1.User.find({
        _id: { $ne: currentUserId },
        $or: [{ username: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }],
    }).select('-password').limit(20);
}
async function getUser(id) { return User_1.User.findById(id).select('-password'); }
async function blockUser(userId, targetId) {
    await User_1.User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: targetId } });
}
async function unblockUser(userId, targetId) {
    await User_1.User.findByIdAndUpdate(userId, { $pull: { blockedUsers: targetId } });
}
async function getBlocked(userId) {
    const u = await User_1.User.findById(userId).populate('blockedUsers', '-password');
    return u?.blockedUsers || [];
}
//# sourceMappingURL=user.service.js.map