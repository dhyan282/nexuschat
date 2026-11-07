"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stats = stats;
exports.listUsers = listUsers;
exports.suspendUser = suspendUser;
exports.activateUser = activateUser;
exports.deleteUser = deleteUser;
exports.announcements = announcements;
const User_1 = require("../models/User");
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
async function stats() {
    const [users, messages, groups, channels, online] = await Promise.all([
        User_1.User.countDocuments(),
        Message_1.Message.countDocuments(),
        Conversation_1.Conversation.countDocuments({ type: 'group' }),
        Conversation_1.Conversation.countDocuments({ type: 'channel' }),
        User_1.User.countDocuments({ status: 'online' }),
    ]);
    return { users, messages, groups, channels, online };
}
async function listUsers(q) {
    const filter = {};
    if (q)
        filter.$or = [{ name: { $regex: q, $options: 'i' } }, { username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    return User_1.User.find(filter).select('-password').sort({ createdAt: -1 }).limit(100);
}
async function suspendUser(id) { await User_1.User.findByIdAndUpdate(id, { status: 'offline' }); await User_1.User.findByIdAndUpdate(id, { role: 'user' }); return User_1.User.findByIdAndUpdate(id, { isVerified: false }, { new: true }).select('-password'); }
async function activateUser(id) { return User_1.User.findByIdAndUpdate(id, { isVerified: true }, { new: true }).select('-password'); }
async function deleteUser(id) { await User_1.User.findByIdAndDelete(id); }
async function announcements() { return []; }
//# sourceMappingURL=admin.service.js.map