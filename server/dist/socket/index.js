"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const Conversation_1 = require("../models/Conversation");
const Message_1 = require("../models/Message");
const Notification_1 = require("../models/Notification");
function setupSocket(io) {
    // auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token)
                return next(new Error('Unauthorized'));
            const payload = (0, jwt_1.verifyAccessToken)(token);
            const user = await User_1.User.findById(payload.userId).select('-password');
            if (!user)
                return next(new Error('Unauthorized'));
            socket.userId = payload.userId;
            socket.user = user;
            next();
        }
        catch (e) {
            next(new Error('Unauthorized'));
        }
    });
    io.on('connection', async (socket) => {
        const userId = socket.userId;
        await User_1.User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
        socket.join(`user:${userId}`);
        io.emit('user:online', { userId });
        // join conversation rooms
        const convs = await Conversation_1.Conversation.find({ participants: userId }).select('_id');
        convs.forEach(c => socket.join(`conv:${c._id}`));
        socket.on('conversation:join', (convId) => socket.join(`conv:${convId}`));
        socket.on('conversation:leave', (convId) => socket.leave(`conv:${convId}`));
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(`conv:${conversationId}`).emit('typing:start', { conversationId, userId });
        });
        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(`conv:${conversationId}`).emit('typing:stop', { conversationId, userId });
        });
        socket.on('message:send', async (data, ack) => {
            try {
                const conv = await Conversation_1.Conversation.findById(data.conversationId);
                if (!conv || !conv.participants.some((p) => p.toString() === userId)) {
                    return ack?.({ error: 'Forbidden' });
                }
                const msg = await Message_1.Message.create({
                    conversationId: data.conversationId,
                    senderId: userId,
                    content: data.content || '',
                    attachments: data.attachments || [],
                    replyTo: data.replyTo,
                });
                conv.lastMessage = msg._id;
                conv.participants.forEach((p) => {
                    const pid = p.toString();
                    if (pid !== userId) {
                        const cur = conv.unreadCounts.get(pid) || 0;
                        conv.unreadCounts.set(pid, cur + 1);
                    }
                });
                await conv.save();
                const populated = await msg.populate('senderId', 'name username avatar');
                io.to(`conv:${data.conversationId}`).emit('message:new', populated);
                for (const p of conv.participants) {
                    if (p.toString() !== userId) {
                        await Notification_1.Notification.create({ recipient: p, type: 'new_message', title: 'New message', body: (data.content || '').slice(0, 80), data: { conversationId: conv._id, messageId: msg._id } });
                        io.to(`user:${p}`).emit('notification:new', { type: 'new_message', conversationId: conv._id, messageId: msg._id, title: 'New message', body: (data.content || '').slice(0, 80) });
                    }
                }
                ack?.({ ok: true, message: populated });
            }
            catch (e) {
                ack?.({ error: e.message || 'Failed' });
            }
        });
        socket.on('message:delivered', async ({ messageId }) => {
            await Message_1.Message.findByIdAndUpdate(messageId, { $addToSet: { deliveredTo: userId } });
            io.emit('message:delivered', { messageId, userId });
        });
        socket.on('message:read', async ({ conversationId, messageId }) => {
            const conv = await Conversation_1.Conversation.findById(conversationId);
            if (!conv || !conv.participants.some((p) => p.toString() === userId))
                return;
            conv.unreadCounts.set(userId, 0);
            await conv.save();
            await Message_1.Message.updateMany({ conversationId, _id: { $lte: messageId }, 'readBy.user': { $ne: userId } }, { $push: { readBy: { user: userId, at: new Date() } } });
            io.to(`conv:${conversationId}`).emit('message:read', { conversationId, userId, messageId });
        });
        socket.on('message:edit', async ({ messageId, content }) => {
            const msg = await Message_1.Message.findById(messageId);
            if (!msg || msg.senderId.toString() !== userId)
                return;
            msg.content = content;
            msg.editedAt = new Date();
            await msg.save();
            io.to(`conv:${msg.conversationId}`).emit('message:edit', { messageId, content, editedAt: msg.editedAt });
        });
        socket.on('message:delete', async ({ messageId }) => {
            const msg = await Message_1.Message.findById(messageId);
            if (!msg || msg.senderId.toString() !== userId)
                return;
            msg.deletedAt = new Date();
            msg.content = '';
            await msg.save();
            io.to(`conv:${msg.conversationId}`).emit('message:delete', { messageId });
        });
        socket.on('message:reaction', async ({ messageId, emoji }) => {
            const msg = await Message_1.Message.findById(messageId);
            if (!msg)
                return;
            let r = msg.reactions.find((x) => x.emoji === emoji);
            if (!r)
                msg.reactions.push({ emoji, users: [userId] });
            else {
                const idx = r.users.findIndex((u) => u.toString() === userId);
                if (idx === -1)
                    r.users.push(userId);
                else
                    r.users.splice(idx, 1);
            }
            await msg.save();
            io.to(`conv:${msg.conversationId}`).emit('message:reaction', { messageId, reactions: msg.reactions });
        });
        socket.on('user:status:update', async ({ status }) => {
            await User_1.User.findByIdAndUpdate(userId, { status, lastSeen: new Date() });
            io.emit('user:status:update', { userId, status });
        });
        socket.on('disconnect', async () => {
            await User_1.User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
            io.emit('user:offline', { userId });
        });
    });
}
//# sourceMappingURL=index.js.map