"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = listNotifications;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.deleteNotification = deleteNotification;
exports.unreadCount = unreadCount;
const Notification_1 = require("../models/Notification");
async function listNotifications(userId) { return Notification_1.Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(50); }
async function markRead(id, userId) { await Notification_1.Notification.findOneAndUpdate({ _id: id, recipient: userId }, { read: true }); }
async function markAllRead(userId) { await Notification_1.Notification.updateMany({ recipient: userId, read: false }, { read: true }); }
async function deleteNotification(id, userId) { await Notification_1.Notification.findOneAndDelete({ _id: id, recipient: userId }); }
async function unreadCount(userId) { return Notification_1.Notification.countDocuments({ recipient: userId, read: false }); }
//# sourceMappingURL=notification.service.js.map