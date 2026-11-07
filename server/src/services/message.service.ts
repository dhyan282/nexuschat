import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { Notification } from '../models/Notification';

export async function listMessages(convId: string, userId: string, before?: string, limit = 30) {
  const conv = await Conversation.findById(convId);
  if (!conv || !conv.participants.some((p: any) => p.toString() === userId)) throw { status: 403, message: 'Forbidden' };
  const q: any = { conversationId: convId };
  if (before) q.createdAt = { $lt: new Date(before) };
  const msgs = await Message.find(q).sort({ createdAt: -1 }).limit(limit).populate('senderId', 'name username avatar').populate('replyTo');
  return msgs.reverse();
}

export async function createMessage(data: any, userId: string) {
  const conv = await Conversation.findById(data.conversationId);
  if (!conv || !conv.participants.some((p: any) => p.toString() === userId)) throw { status: 403, message: 'Forbidden' };
  const msg = await Message.create({
    conversationId: data.conversationId,
    senderId: userId,
    content: data.content || '',
    attachments: data.attachments || [],
    replyTo: data.replyTo,
  });
  conv.lastMessage = msg._id;
  // unread counts
  conv.participants.forEach((p: any) => {
    const pid = p.toString();
    if (pid !== userId) {
      const cur = conv.unreadCounts.get(pid) || 0;
      conv.unreadCounts.set(pid, cur + 1);
    }
  });
  await conv.save();
  const populated = await msg.populate('senderId', 'name username avatar');
  // notifications
  for (const p of conv.participants) {
    if (p.toString() !== userId) {
      await Notification.create({ recipient: p, type: 'new_message', title: 'New message', body: (data.content || '').slice(0,80), data: { conversationId: conv._id, messageId: msg._id } });
    }
  }
  return populated;
}

export async function editMessage(id: string, userId: string, content: string) {
  const msg = await Message.findById(id);
  if (!msg) throw { status: 404, message: 'Not found' };
  if (msg.senderId.toString() !== userId) throw { status: 403, message: 'Forbidden' };
  msg.content = content;
  msg.editedAt = new Date();
  await msg.save();
  return msg;
}

export async function deleteMessage(id: string, userId: string) {
  const msg = await Message.findById(id);
  if (!msg) throw { status: 404, message: 'Not found' };
  if (msg.senderId.toString() !== userId) throw { status: 403, message: 'Forbidden' };
  msg.deletedAt = new Date();
  msg.content = '';
  await msg.save();
}

export async function addReaction(id: string, userId: string, emoji: string) {
  const msg = await Message.findById(id);
  if (!msg) throw { status: 404, message: 'Not found' };
  let r = msg.reactions.find((x: any) => x.emoji === emoji);
  if (!r) { msg.reactions.push({ emoji, users: [userId] } as any); }
  else if (!r.users.some((u: any) => u.toString() === userId)) r.users.push(userId as any);
  await msg.save();
  return msg;
}

export async function markRead(convId: string, userId: string, messageId?: string) {
  const conv = await Conversation.findById(convId);
  if (!conv) throw { status: 404, message: 'Not found' };
  if (!conv.participants.some((p: any) => p.toString() === userId)) throw { status: 403, message: 'Forbidden' };
  conv.unreadCounts.set(userId, 0);
  await conv.save();
  if (messageId) {
    await Message.updateMany(
      { conversationId: convId, _id: { $lte: messageId }, 'readBy.user': { $ne: userId } },
      { $push: { readBy: { user: userId, at: new Date() } } }
    );
  }
}

export async function searchMessages(userId: string, q: string) {
  const convs = await Conversation.find({ participants: userId }).select('_id');
  const ids = convs.map(c => c._id);
  return Message.find({ conversationId: { $in: ids }, content: { $regex: q, $options: 'i' }, deletedAt: null })
    .populate('senderId', 'name username avatar')
    .populate('conversationId', 'name type')
    .limit(50);
}
