import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';

export async function registerUser(data: any) {
  const existing = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
  if (existing) throw { status: 409, message: 'Email or username already in use' };
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    username: data.username,
    email: data.email,
    password: hashed,
    phone: data.phone,
    avatar: data.avatar || '',
  });
  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });
  await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
  return { user: sanitize(user), accessToken, refreshToken };
}

export async function loginUser(identifier: string, password: string) {
  const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };
  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });
  await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
  user.status = 'online';
  user.lastSeen = new Date();
  await user.save();
  return { user: sanitize(user), accessToken, refreshToken };
}

export async function refreshTokens(token: string) {
  const payload = verifyRefreshToken(token);
  const stored = await RefreshToken.findOne({ token, revoked: false });
  if (!stored) throw { status: 401, message: 'Invalid refresh token' };
  stored.revoked = true;
  await stored.save();
  const user = await User.findById(payload.userId);
  if (!user) throw { status: 401, message: 'User not found' };
  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });
  await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
  return { accessToken, refreshToken };
}

export async function logoutUser(token?: string) {
  if (token) await RefreshToken.updateOne({ token }, { revoked: true });
}

export async function logoutAll(userId: string) {
  await RefreshToken.updateMany({ user: userId }, { revoked: true });
  await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email });
  if (!user) return; // don't reveal
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  user.resetToken = token;
  user.resetExpires = new Date(Date.now() + 60*60*1000);
  await user.save();
  // In production, email the link. Log for dev.
  console.log(`Password reset link: ${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${email}`);
  return token;
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  const user = await User.findOne({ email, resetToken: token, resetExpires: { $gt: new Date() } });
  if (!user) throw { status: 400, message: 'Invalid or expired reset token' };
  user.password = await (await import('bcryptjs')).default.hash(newPassword, 10);
  user.resetToken = undefined as any;
  user.resetExpires = undefined as any;
  await user.save();
}

function sanitize(u: any) {
  const o = u.toObject ? u.toObject() : u;
  delete o.password;
  return o;
}
