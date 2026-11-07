import { Schema, model, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  user: any;
  token: string;
  expiresAt: Date;
  revoked: boolean;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
}, { timestamps: true });

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
