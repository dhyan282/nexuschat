"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMessages = listMessages;
exports.createMessage = createMessage;
exports.editMessage = editMessage;
exports.deleteMessage = deleteMessage;
exports.addReaction = addReaction;
exports.markRead = markRead;
exports.searchMessages = searchMessages;
const Message_1 = require("../models/Message");
const Conversation_1 = require("../models/Conversation");
const Notification_1 = require("../models/Notification");
async function listMessages(convId, userId, before, limit = 30) {
    const conv = await Conversation_1.Conversation.findById(convId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId))
        throw { status: 403, message: 'Forbidden' };
    const q = { conversationId: convId };
    if (before)
        q.createdAt = { $lt: new Date(before) };
    const msgs = await Message_1.Message.find(q).sort({ createdAt: -1 }).limit(limit).populate('senderId', 'name username avatar').populate('replyTo');
    return msgs.reverse();
}
async function createMessage(data, userId) {
    const conv = await Conversation_1.Conversation.findById(data.conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === userId))
        throw { status: 403, message: 'Forbidden' };
    const msg = await Message_1.Message.create({
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content || '',
        attachments: data.attachments || [],
        replyTo: data.replyTo,
    });
    conv.lastMessage = msg._id;
    // unread counts
    conv.participants.forEach((p) => {
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
            await Notification_1.Notification.create({ recipient: p, type: 'new_message', title: 'New message', body: (data.content || '').slice(0, 80), data: { conversationId: conv._id, messageId: msg._id } });
        }
    }
    return populated;
}
async function editMessage(id, userId, content) {
    const msg = await Message_1.Message.findById(id);
    if (!msg)
        throw { status: 404, message: 'Not found' };
    if (msg.senderId.toString() !== userId)
        throw { status: 403, message: 'Forbidden' };
    msg.content = content;
    msg.editedAt = new Date();
    await msg.save();
    return msg;
}
async function deleteMessage(id, userId) {
    const msg = await Message_1.Message.findById(id);
    if (!msg)
        throw { status: 404, message: 'Not found' };
    if (msg.senderId.toString() !== userId)
        throw { status: 403, message: 'Forbidden' };
    msg.deletedAt = new Date();
    msg.content = '';
    await msg.save();
}
async function addReaction(id, userId, emoji) {
    const msg = await Message_1.Message.findById(id);
    if (!msg)
        throw { status: 404, message: 'Not found' };
    let r = msg.reactions.find((x) => x.emoji === emoji);
    if (!r) {
        msg.reactions.push({ emoji, users: [userId] });
    }
    else if (!r.users.some((u) => u.toString() === userId))
        r.users.push(userId);
    await msg.save();
    return msg;
}
async function markRead(convId, userId, messageId) {
    const conv = await Conversation_1.Conversation.findById(convId);
    if (!conv)
        throw { status: 404, message: 'Not found' };
    if (!conv.participants.some((p) => p.toString() === userId))
        throw { status: 403, message: 'Forbidden' };
    conv.unreadCounts.set(userId, 0);
    await conv.save();
    if (messageId) {
        await Message_1.Message.updateMany({ conversationId: convId, _id: { $lte: messageId }, 'readBy.user': { $ne: userId } }, { $push: { readBy: { user: userId, at: new Date() } } });
    }
}
async function searchMessages(userId, q) {
    const convs = await Conversation_1.Conversation.find({ participants: userId }).select('_id');
    const ids = convs.map(c => c._id);
    return Message_1.Message.find({ conversationId: { $in: ids }, content: { $regex: q, $options: 'i' }, deletedAt: null })
        .populate('senderId', 'name username avatar')
        .populate('conversationId', 'name type')
        .limit(50);
}
//# sourceMappingURL=message.service.js.map