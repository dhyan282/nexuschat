import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'admin';
  status: 'online' | 'offline' | 'away';
  isVerified: boolean;
  lastSeen?: Date;
  blockedUsers: string[];
  resetToken?: string;
  resetExpires?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  status: { type: String, enum: ['online','offline','away'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  lastSeen: { type: Date },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  resetToken: { type: String },
  resetExpires: { type: Date },
}, { timestamps: true });



export const User = model<IUser>('User', UserSchema);
