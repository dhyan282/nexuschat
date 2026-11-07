import { Schema, model, Document } from 'mongoose';

export type ConversationType = 'direct' | 'group' | 'channel';

export interface IConversation extends Document {
  type: ConversationType;
  name?: string;
  description?: string;
  avatar?: string;
  participants: any[];
  admins: any[];
  isPrivate: boolean;
  lastMessage?: any;
  unreadCounts: Map<string, number>;
  pinnedMessages: any[];
  createdBy: any;
}

const ConversationSchema = new Schema<IConversation>({
  type: { type: String, enum: ['direct','group','channel'], required: true },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  avatar: { type: String, default: '' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  unreadCounts: { type: Map, of: Number, default: {} },
  pinnedMessages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });

export const Conversation = model<IConversation>('Conversation', ConversationSchema);
