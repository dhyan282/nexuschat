"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const ConversationSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['direct', 'group', 'channel'], required: true },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    avatar: { type: String, default: '' },
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: { type: Boolean, default: false },
    lastMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Message' },
    unreadCounts: { type: Map, of: Number, default: {} },
    pinnedMessages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Message' }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
ConversationSchema.index({ participants: 1 });
exports.Conversation = (0, mongoose_1.model)('Conversation', ConversationSchema);
//# sourceMappingURL=Conversation.js.map