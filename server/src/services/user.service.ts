import { User } from '../models/User';

export async function getMe(userId: string) { return User.findById(userId).select('-password'); }
export async function updateMe(userId: string, data: any) {
  const allowed = ['name','bio','phone','avatar','status'];
  const update: any = {};
  for (const k of allowed) if (data[k] !== undefined) update[k] = data[k];
  return User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
}
export async function searchUsers(q: string, currentUserId: string) {
  if (!q) return [];
  return User.find({
    _id: { $ne: currentUserId },
    $or: [{ username: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }],
  }).select('-password').limit(20);
}
export async function getUser(id: string) { return User.findById(id).select('-password'); }
export async function blockUser(userId: string, targetId: string) {
  await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: targetId } });
}
export async function unblockUser(userId: string, targetId: string) {
  await User.findByIdAndUpdate(userId, { $pull: { blockedUsers: targetId } });
}
export async function getBlocked(userId: string) {
  const u = await User.findById(userId).populate('blockedUsers', '-password');
  return u?.blockedUsers || [];
}
