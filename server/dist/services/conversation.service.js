"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listConversations = listConversations;
exports.getConversation = getConversation;
exports.createConversation = createConversation;
exports.deleteConversation = deleteConversation;
exports.addMember = addMember;
exports.removeMember = removeMember;
exports.updateConversation = updateConversation;
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
async function listConversations(userId) {
    return Conversation_1.Conversation.find({ participants: userId })
        .populate('participants', 'name username avatar status lastSeen')
        .populate({ path: 'lastMessage', populate: { path: 'senderId', select: 'name username avatar' } })
        .sort({ updatedAt: -1 });
}
async function getConversation(id, userId) {
    const c = await Conversation_1.Conversation.findById(id).populate('participants', 'name username avatar status lastSeen');
    if (!c)
        throw { status: 404, message: 'Conversation not found' };
    if (!c.participants.some((p) => p._id.toString() === userId))
        throw { status: 403, message: 'Forbidden' };
    return c;
}
async function createConversation(data, userId) {
    const { type, name, description, participants = [], isPrivate } = data;
    const all = Array.from(new Set([userId, ...participants]));
    if (type === 'direct') {
        const existing = await Conversation_1.Conversation.findOne({ type: 'direct', participants: { $all: all, $size: all.length } });
        if (existing)
            return existing;
    }
    const conv = await Conversation_1.Conversation.create({
        type, name, description, isPrivate: !!isPrivate,
        participants: all,
        admins: [userId],
        createdBy: userId,
    });
    return conv.populate('participants', 'name username avatar status lastSeen');
}
async function deleteConversation(id, userId) {
    const c = await getConversation(id, userId);
    if (c.createdBy?.toString() !== userId && c.type !== 'direct')
        throw { status: 403, message: 'Forbidden' };
    await Message_1.Message.deleteMany({ conversationId: id });
    await Conversation_1.Conversation.findByIdAndDelete(id);
}
async function addMember(convId, userId, targetId) {
    const c = await getConversation(convId, userId);
    if (!c.admins.some((a) => a.toString() === userId) && c.type !== 'direct')
        throw { status: 403, message: 'Forbidden' };
    if (!c.participants.some((p) => p.toString() === targetId)) {
        c.participants.push(targetId);
        await c.save();
    }
    return c;
}
async function removeMember(convId, userId, targetId) {
    const c = await getConversation(convId, userId);
    if (!c.admins.some((a) => a.toString() === userId))
        throw { status: 403, message: 'Forbidden' };
    c.participants = c.participants.filter((p) => p.toString() !== targetId);
    await c.save();
    return c;
}
async function updateConversation(convId, userId, data) {
    const c = await getConversation(convId, userId);
    if (!c.admins.some((a) => a.toString() === userId) && c.type !== 'direct')
        throw { status: 403, message: 'Forbidden' };
    if (data.name !== undefined)
        c.name = data.name;
    if (data.description !== undefined)
        c.description = data.description;
    if (data.avatar !== undefined)
        c.avatar = data.avatar;
    await c.save();
    return c;
}
//# sourceMappingURL=conversation.service.js.map