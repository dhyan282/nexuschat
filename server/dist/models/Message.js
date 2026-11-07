"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    conversationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    attachments: [{ url: { type: String }, name: { type: String }, type: { type: String }, size: { type: Number } }],
    replyTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [{ emoji: { type: String }, users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }] }],
    deliveredTo: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, at: Date }],
    editedAt: { type: Date },
    deletedAt: { type: Date },
}, { timestamps: true });
MessageSchema.index({ conversationId: 1, createdAt: -1 });
exports.Message = (0, mongoose_1.model)('Message', MessageSchema);
//# sourceMappingURL=Message.js.map