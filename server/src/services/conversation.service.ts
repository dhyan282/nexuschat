import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';

export async function listConversations(userId: string) {
  return Conversation.find({ participants: userId })
    .populate('participants', 'name username avatar status lastSeen')
    .populate({ path: 'lastMessage', populate: { path: 'senderId', select: 'name username avatar' } })
    .sort({ updatedAt: -1 });
}

export async function getConversation(id: string, userId: string) {
  const c = await Conversation.findById(id).populate('participants', 'name username avatar status lastSeen');
  if (!c) throw { status: 404, message: 'Conversation not found' };
  if (!c.participants.some((p: any) => p._id.toString() === userId)) throw { status: 403, message: 'Forbidden' };
  return c;
}

export async function createConversation(data: any, userId: string) {
  const { type, name, description, participants = [], isPrivate } = data;
  const all = Array.from(new Set([userId, ...participants]));
  if (type === 'direct') {
    const existing = await Conversation.findOne({ type: 'direct', participants: { $all: all, $size: all.length } });
    if (existing) return existing;
  }
  const conv = await Conversation.create({
    type, name, description, isPrivate: !!isPrivate,
    participants: all,
    admins: [userId],
    createdBy: userId,
  });
  return conv.populate('participants', 'name username avatar status lastSeen');
}

export async function deleteConversation(id: string, userId: string) {
  const c = await getConversation(id, userId);
  if (c.createdBy?.toString() !== userId && c.type !== 'direct') throw { status: 403, message: 'Forbidden' };
  await Message.deleteMany({ conversationId: id });
  await Conversation.findByIdAndDelete(id);
}

export async function addMember(convId: string, userId: string, targetId: string) {
  const c = await getConversation(convId, userId);
  if (!c.admins.some((a: any) => a.toString() === userId) && c.type !== 'direct') throw { status: 403, message: 'Forbidden' };
  if (!c.participants.some((p: any) => p.toString() === targetId)) {
    c.participants.push(targetId as any);
    await c.save();
  }
  return c;
}

export async function removeMember(convId: string, userId: string, targetId: string) {
  const c = await getConversation(convId, userId);
  if (!c.admins.some((a: any) => a.toString() === userId)) throw { status: 403, message: 'Forbidden' };
  c.participants = c.participants.filter((p: any) => p.toString() !== targetId);
  await c.save();
  return c;
}

export async function updateConversation(convId: string, userId: string, data: any) {
  const c = await getConversation(convId, userId);
  if (!c.admins.some((a: any) => a.toString() === userId) && c.type !== 'direct') throw { status: 403, message: 'Forbidden' };
  if (data.name !== undefined) c.name = data.name;
  if (data.description !== undefined) c.description = data.description;
  if (data.avatar !== undefined) c.avatar = data.avatar;
  await c.save();
  return c;
}
