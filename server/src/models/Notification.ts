import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: any;
  type: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, read: 1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
