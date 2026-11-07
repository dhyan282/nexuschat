import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Notification } from '../models/Notification';

export async function stats() {
  const [users, messages, groups, channels, online] = await Promise.all([
    User.countDocuments(),
    Message.countDocuments(),
    Conversation.countDocuments({ type: 'group' }),
    Conversation.countDocuments({ type: 'channel' }),
    User.countDocuments({ status: 'online' }),
  ]);
  return { users, messages, groups, channels, online };
}
export async function listUsers(q?: string) {
  const filter: any = {};
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
  return User.find(filter).select('-password').sort({ createdAt: -1 }).limit(100);
}
export async function suspendUser(id: string) { await User.findByIdAndUpdate(id, { status: 'offline' }); await User.findByIdAndUpdate(id, { role: 'user' }); return User.findByIdAndUpdate(id, { isVerified: false }, { new: true }).select('-password'); }
export async function activateUser(id: string) { return User.findByIdAndUpdate(id, { isVerified: true }, { new: true }).select('-password'); }
export async function deleteUser(id: string) { await User.findByIdAndDelete(id); }
export async function announcements() { return []; }
