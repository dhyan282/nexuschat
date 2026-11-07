import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: any;
  senderId: any;
  content: string;
  attachments: { url: string; name: string; type: string; size: number }[];
  replyTo?: any;
  reactions: { emoji: string; users: any[] }[];
  deliveredTo: any[];
  readBy: { user: any; at: Date }[];
  editedAt?: Date;
  deletedAt?: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  attachments: [{ url: { type: String }, name: { type: String }, type: { type: String }, size: { type: Number } }],
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  reactions: [{ emoji: { type: String }, users: [{ type: Schema.Types.ObjectId, ref: 'User' }] }],
  deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, at: Date }],
  editedAt: { type: Date },
  deletedAt: { type: Date },
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', MessageSchema);
