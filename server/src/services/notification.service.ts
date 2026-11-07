import { Notification } from '../models/Notification';

export async function listNotifications(userId: string) { return Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(50); }
export async function markRead(id: string, userId: string) { await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { read: true }); }
export async function markAllRead(userId: string) { await Notification.updateMany({ recipient: userId, read: false }, { read: true }); }
export async function deleteNotification(id: string, userId: string) { await Notification.findOneAndDelete({ _id: id, recipient: userId }); }
export async function unreadCount(userId: string) { return Notification.countDocuments({ recipient: userId, read: false }); }
